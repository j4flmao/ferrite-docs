export default defineEventHandler(() => {
  const config = useRuntimeConfig()
  const siteUrl = process.env.NUXT_PUBLIC_SITE_URL ?? 'https://ferrite.rs'
  const baseURL = (config.app?.baseURL as string) ?? '/'
  return new Response(`User-Agent: *\nDisallow:\n\nSitemap: ${siteUrl}${baseURL}sitemap.xml\n`, {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  })
})