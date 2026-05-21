import type { MetadataRoute } from 'next';
import { site } from '@/lib/content';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = site.meta.siteUrl;
  const now = new Date();
  return [
    { url: `${base}/`,            lastModified: now, changeFrequency: 'monthly', priority: 1 },
    { url: `${base}/privacidade`, lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${base}/lgpd`,        lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${base}/termos`,      lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
  ];
}
