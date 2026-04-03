import type { MetadataRoute } from 'next';
import { constituencies, getDistrictList } from '@/lib/data';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://kerala-elections-dashboard.vercel.app';

  const staticPages = [
    '',
    '/constituencies',
    '/districts',
    '/categories',
    '/compare',
    '/trends',
    '/demographics',
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: path === '' ? 1 : 0.8,
  }));

  const constituencyPages = constituencies.map((c) => ({
    url: `${baseUrl}/constituency/${c.CONST_ID}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  const districtPages = getDistrictList().map((name) => ({
    url: `${baseUrl}/district/${encodeURIComponent(name)}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...constituencyPages, ...districtPages];
}
