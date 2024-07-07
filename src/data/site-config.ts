export type Image = {
    src: string;
    alt?: string;
    caption?: string;
};

export type Link = {
    text: string;
    href: string;
};

export type Hero = {
    title?: string;
    text?: string;
    image?: Image;
    actions?: Link[];
};

export type Subscribe = {
    title?: string;
    text?: string;
    formUrl: string;
};

export type SiteConfig = {
    logo?: Image;
    title: string;
    subtitle?: string;
    description: string;
    image?: Image;
    headerNavLinks?: Link[];
    footerNavLinks?: Link[];
    socialLinks?: Link[];
    hero?: Hero;
    subscribe?: Subscribe;
    postsPerPage?: number;
    projectsPerPage?: number;
};

const siteConfig: SiteConfig = {
    title: 'okuboy.com',
    subtitle: 'okuboy.com/blog',
    description: "okuboy.com's blog. A blog about web development, software engineering, and other tech-related topics, sometimes with a touch of philosophy.",
    image: {
        src: '/logo.jpg',
        alt: 'okuboy.com logo'
    },
    headerNavLinks: [
        {
            text: 'okuboy.com',
            href: 'https://okuboy.com'
        },
        {
            text: '/blog',
            href: 'https://okuboy.com/blog'
        },
        {
            text: '/tags',
            href: 'https://okuboy.com/blog/tags'
        },
    ],
    // footerNavLinks: [
    //     {
    //         text: 'About',
    //         href: '/about'
    //     },
    //     {
    //         text: 'Contact',
    //         href: '/contact'
    //     },
    //     {
    //         text: 'Terms',
    //         href: '/terms'
    //     },
    //     {
    //         text: 'Download theme',
    //         href: 'https://github.com/JustGoodUI/dante-astro-theme'
    //     }
    // ],
    // socialLinks: [
    //     {
    //         text: 'Dribbble',
    //         href: 'https://dribbble.com/'
    //     },
    //     {
    //         text: 'Instagram',
    //         href: 'https://instagram.com/'
    //     },
    //     {
    //         text: 'X/Twitter',
    //         href: 'https://twitter.com/'
    //     }
    // ],
    hero: {
        title: "Hi! 👋",
        text: "I'm Okuboy, a data, software, and web engineer. I write about web development, software engineering, and other tech-related topics, sometimes with a touch of philosophy.",
        image: {
            src: '/logo.png',
            alt: 'okuboy.com logo'
        },
    },
    postsPerPage: 8,
    projectsPerPage: 8
};

export default siteConfig;
