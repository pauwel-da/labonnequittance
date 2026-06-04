import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://labonnequittance.fr'

  return [
    {
      url: base,
      lastModified: new Date('2026-06-04'),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${base}/login`,
      lastModified: new Date('2026-06-04'),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${base}/signup`,
      lastModified: new Date('2026-06-04'),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${base}/blog`,
      lastModified: new Date('2026-06-04'),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${base}/blog/quittance-vs-recu-loyer`,
      lastModified: new Date('2026-05-15'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${base}/blog/attestation-loyer-caf-bailleur`,
      lastModified: new Date('2026-05-15'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${base}/blog/comment-faire-quittance-de-loyer`,
      lastModified: new Date('2026-05-15'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${base}/blog/creer-sa-quittance-de-loyer-pdf-gratuitement-en-2026`,
      lastModified: new Date('2026-05-15'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${base}/cgu`,
      lastModified: new Date('2026-01-01'),
      changeFrequency: 'yearly',
      priority: 0.2,
    },
    {
      url: `${base}/mentions-legales`,
      lastModified: new Date('2026-01-01'),
      changeFrequency: 'yearly',
      priority: 0.2,
    },
    {
      url: `${base}/confidentialite`,
      lastModified: new Date('2026-01-01'),
      changeFrequency: 'yearly',
      priority: 0.2,
    },
  ]
}
