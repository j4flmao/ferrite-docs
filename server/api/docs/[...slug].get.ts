import { findFlatDoc } from '#shared/docs-nav'

export default defineEventHandler(async (event) => {
  const slugParam = getRouterParam(event, 'slug')

  if (!slugParam) {
    throw createError({ statusCode: 400, statusMessage: 'Missing document slug' })
  }

  const safeSlug = decodeURIComponent(slugParam).replace(/\.\./g, '').trim()
  const doc = await loadDoc(safeSlug)

  const entry = findFlatDoc(safeSlug)

  return {
    slug: doc.slug,
    title: doc.frontmatter.title,
    description: doc.frontmatter.description,
    source: doc.source,
    document: doc.document,
    toc: doc.toc,
    editUrl: getGithubEditUrl(safeSlug),
    prev: entry?.prev ?? null,
    next: entry?.next ?? null,
  }
})