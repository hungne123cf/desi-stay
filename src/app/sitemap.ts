import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://desi-stay.vercel.app',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1
    },
    {
      url: 'https://desi-stay.vercel.app/my-bookings',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8
    },
    {
      url: 'https://desi-stay.vercel.app/auth/login',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5
    }
  ];
}
