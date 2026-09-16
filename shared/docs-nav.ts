export interface DocsNavItem {
  title: string
  slug: string
}

export interface DocsNavSection {
  title: string
  items: DocsNavItem[]
}

export const docsSections: DocsNavSection[] = [
  {
    title: 'Overview',
    items: [
      { title: 'Introduction', slug: 'overview/introduction' },
      { title: 'First steps', slug: 'overview/first-steps' },
      { title: 'Controllers', slug: 'overview/controllers' },
      { title: 'Providers', slug: 'overview/providers' },
      { title: 'Modules', slug: 'overview/modules' },
      { title: 'Bootstrap', slug: 'overview/bootstrap' },
      { title: 'Middleware', slug: 'overview/middleware' },
      { title: 'Guards', slug: 'overview/guards' },
      { title: 'Interceptors', slug: 'overview/interceptors' },
      { title: 'Pipes', slug: 'overview/pipes' },
      { title: 'Exception filters', slug: 'overview/exception-filters' },
      { title: 'Configuration', slug: 'overview/configuration' },
      { title: 'Validation', slug: 'overview/validation' },
      { title: 'CLI usage', slug: 'overview/cli-usage' },
    ],
  },
  {
    title: 'Fundamentals',
    items: [
      { title: 'Dependency injection', slug: 'fundamentals/dependency-injection' },
      { title: 'Lifecycle events', slug: 'fundamentals/lifecycle-events' },
      { title: 'Testing', slug: 'fundamentals/testing' },
      { title: 'OpenAPI & Swagger', slug: 'fundamentals/openapi-swagger' },
      { title: 'Health checks', slug: 'fundamentals/health-checks' },
    ],
  },
  {
    title: 'Techniques',
    items: [
      { title: 'Database (ORM)', slug: 'techniques/database' },
      { title: 'Authentication (JWT)', slug: 'techniques/authentication' },
      { title: 'OAuth2 & OIDC', slug: 'techniques/oauth2-oidc' },
      { title: 'Caching (Redis)', slug: 'techniques/caching' },
      { title: 'Rate limiting', slug: 'techniques/rate-limiting' },
      { title: 'WebSockets', slug: 'techniques/websockets' },
      { title: 'gRPC', slug: 'techniques/grpc' },
      { title: 'Messaging (NATS & Kafka)', slug: 'techniques/messaging' },
      { title: 'Background jobs', slug: 'techniques/background-jobs' },
      { title: 'Scheduling', slug: 'techniques/scheduling' },
      { title: 'CQRS', slug: 'techniques/cqrs' },
      { title: 'i18n', slug: 'techniques/i18n' },
    ],
  },
  {
    title: 'Ecosystem',
    items: [
      { title: 'CLI reference', slug: 'ecosystem/cli-reference' },
      { title: 'Ecosystem crates', slug: 'ecosystem/crates' },
      { title: 'Roadmap', slug: 'ecosystem/roadmap' },
    ],
  },
]

export interface FlatDoc {
  index: number
  sectionTitle: string
  title: string
  slug: string
  next: { title: string; slug: string } | null
  prev: { title: string; slug: string } | null
}

const flat: FlatDoc[] = []
for (const section of docsSections) {
  for (const item of section.items) {
    flat.push({
      index: flat.length,
      sectionTitle: section.title,
      title: item.title,
      slug: item.slug,
      prev: null,
      next: null,
    })
  }
}
for (let i = 0; i < flat.length; i++) {
  const doc = flat[i]
  if (!doc) {
    continue
  }
  const prev = i > 0 ? flat[i - 1] : undefined
  const next = i < flat.length - 1 ? flat[i + 1] : undefined
  doc.prev = prev ? { title: prev.title, slug: prev.slug } : null
  doc.next = next ? { title: next.title, slug: next.slug } : null
}

export function getFlatDocs(): FlatDoc[] {
  return flat
}

export function findFlatDoc(slug: string): FlatDoc | undefined {
  return flat.find((doc) => doc.slug === slug)
}