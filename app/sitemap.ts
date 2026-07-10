import type { MetadataRoute } from 'next';
import { site } from '@/lib/content';
import { getAllPosts } from '@/lib/posts';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = site.meta.siteUrl;
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`,            lastModified: now, changeFrequency: 'monthly', priority: 1 },
    { url: `${base}/blog`,        lastModified: now, changeFrequency: 'weekly',  priority: 0.6 },
    { url: `${base}/privacidade`, lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${base}/lgpd`,        lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${base}/termos`,      lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
  ];

  const postRoutes: MetadataRoute.Sitemap = getAllPosts().map((post) => ({
    url: `${base}/blog/${post.slug}`,
    lastModified: post.date ? new Date(post.date) : now,
    changeFrequency: 'yearly',
    priority: 0.5,
  }));

  return [...staticRoutes, ...postRoutes];
}
