---
title: マルチリポジトリからなる１つのウェブサイトを Cloudflare に完全に依存して構築する
excerpt: okuboy.com ドメインにて自分のサイトをリニューアルしたが、ブログをサブドメインではなくサブディレクトリに配置しようと思った。blog.okuboy.com ではなく、okuboy.com/blog にブログを公開した。Cloudflare を使って結構簡単にできたので方法を紹介。
publishDate: '2024/07/07'
isFeatured: true
tags:
  - Web Development
  - Cloudflare
  - Reverse Proxy
seo:
  image:
    src: '/logo.png'
    alt: 'logo of this site'
---

## はじめに

ウェブサイトの構造を改善し、SEO対策を強化するため、ブログをサブドメインからサブディレクトリに移行することにした。この記事では、Cloudflareを活用してマルチリポジトリからなるウェブサイトを構築し、ブログを `okuboy.com/blog` として公開する方法を解説する。

## 構成概要

1. メインサイト（okuboy.com）とブログサイト（blog.okuboy.com）を別々のGitHubリポジトリで管理
2. Cloudflare Pagesを使用して両サイトをビルドし公開
3. Cloudflare Workersでリバースプロキシを実装し、okuboy.com/blogへのアクセスをblog.okuboy.comにルーティング

![サイト構成の概要図](/public/blog/open-my-new-website/okuboy-uml.jpg)

## 具体的な実装手順

### 1. Cloudflare Domainsでドメイン取得

Cloudflare Domain Registration を利用して `okuboy.com` ドメインを取得する。これにより Cloudflare のエコシステム内でドメイン管理が容易になる。

### 2. GitHubリポジトリの準備

メインサイトとブログサイト用に、それぞれ別のGitHubリポジトリを作成する。「分割して統治せよ」という格言がある。各サイトの開発と管理が独立して行えるので良い。

リポジトリの例

- メインサイト: `main-okuboy-com`
- ブログサイト: `blog-okuboy-com`

### 3. Cloudflare Pages でサイトのビルドと公開

Cloudflare Pages を使用して、両サイトをビルドし公開する。

1. Cloudflareダッシュボードから「Pages」セクションに移動
2. 「新しいプロジェクトを作成」を選択
3. GitHubアカウントと連携し、対象リポジトリを選択
4. ビルド設定を構成（フレームワークプリセットやビルドコマンドなど）
5. デプロイを実行

この手順をメインサイトとブログサイトの両方に対して行う。

![Cloudflare Pages の作成ボタン](/public/blog/open-my-new-website/create-pages.jpg)

### 4. Cloudflare Workersでリバースプロキシの実装

okuboy.com/blog へのアクセスを blog.okuboy.com にリダイレクトするリバースプロキシを Cloudflare Workers で実装する。

1. Cloudflareダッシュボードから「Workers & Pages」セクションに移動
2. Pages を作成するのと同じ **Create** を選択
3. 以下のコードを新しい Worker に貼り付け。ただ Worker を作成するときは一度 Deploy してからでないと Edit できない模様。

```javascript
export default {
  async fetch(request) {
    async function MethodNotAllowed(request) {
      return new Response(`Method ${request.method} not allowed.`, {
        status: 405,
        headers: {
          Allow: 'GET'
        }
      });
    }
    // Only GET requests work with this proxy.
    if (request.method !== 'GET') return MethodNotAllowed(request);

    // Get the URL that was just requested.
    const url = new URL(request.url);

    // Swap out the subdirectory with the subdomain to request the actual URL.
    const originUrl = url.toString().replace('https://okuboy.com/blog', 'https://blog.okuboy.com');

    // Fetch the origin.
    const originResponse = await fetch(originUrl);

    // Check if the response is HTML
    const contentType = originResponse.headers.get('content-type');
    if (contentType && contentType.includes('text/html')) {
      // If it's HTML, we need to rewrite the content
      let content = await originResponse.text();

      // Rewrite resource paths
      content = content.replace(/src="\//g, 'src="/blog/');
      content = content.replace(/href="\//g, 'href="/blog/');
      content = content.replace(/from="\//g, 'from="/blog/');

      // Create a new response with the modified content
      const newResponse = new Response(content, originResponse);
      newResponse.headers.set('content-type', 'text/html');
      return newResponse;
    } else {
      // For non-HTML responses, we need to set the correct MIME type
      const newResponse = new Response(originResponse.body, originResponse);
      if (url.pathname.endsWith('.js')) {
        newResponse.headers.set('content-type', 'application/javascript');
      } else if (url.pathname.endsWith('.css')) {
        newResponse.headers.set('content-type', 'text/css');
      }
      return newResponse;
    }
  }
};
```

このコードは、okuboy.com/blog へのリクエストを blog.okuboy.com に転送し、レスポンスのコンテンツを適切に書き換える。

### 5. Worker のルート設定

作成した Worker が正しいパスでトリガーされるよう、ルートを設定する。

1. Cloudflareダッシュボードの「Workers & Pages」セクションで、作成した Worker を選択
2. **Settings** > **Triggers** タブに移動し、**Add route** をクリック
3. ルートパターンとして `*okuboy.com/blog*` を入力

これにより、okuboy.com/blog へのすべてのアクセスが Worker によって処理される。

![ルートパターンの入力フィールドを示す画面キャプチャ](/public/blog/open-my-new-website/add-route.jpg)

## まとめ

Cloudflareのサービスを活用することで、マルチリポジトリからなるウェブサイトを効率的に構築し、ブログをサブディレクトリとして公開することができた。この方法の主な利点は以下の通り:

1. サイト構造の改善による SEO 効果の向上
2. マルチリポジトリによる柔軟な開発と管理
3. Cloudflare のエコシステムによる統合的なホスティングと CDN の利用

この手法を応用することで、複数の独立したウェブアプリケーションを1つのドメイン下に統合し、ユーザーにシームレスな体験を提供できる。
