import { docsSections } from '#shared/docs-nav'

function xmlEscape(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

export default defineEventHandler(() => {
  const config = useRuntimeConfig()
  const siteUrl = process.env.NUXT_PUBLIC_SITE_URL ?? 'https://ferrite.rs'
  const baseURL = (config.app?.baseURL as string) ?? '/'
  const base = siteUrl + baseURL.replace(/\/$/, '')

  const paths = ['/']

  for (const section of docsSections) {
    for (const item of section.items) {
      paths.push(`/docs/${item.slug}`)
    }
  }

  const entries = paths.map((path) => `  <url><loc>${xmlEscape(base + path)}</loc></url>`).join('\n')

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`,
    {
      headers: { 'content-type': 'application/xml; charset=utf-8' },
    },
  )
})