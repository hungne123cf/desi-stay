import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin']
    },
    sitemap: 'https://desi-stay.vercel.app/sitemap.xml'
  };
}
