export const siteConfig = {
  name: 'TruyenDoc',
  description: 'Your site description here',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  ogImage: '/og-image.jpg',
  links: {
    twitter: 'https://twitter.com/yourhandle',
    github: 'https://github.com/yourhandle',
  },
};

export type SiteConfig = typeof siteConfig;
