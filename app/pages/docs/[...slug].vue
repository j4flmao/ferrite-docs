<script setup lang="ts">
import { Loader2, FileQuestion, ChevronRight } from '@lucide/vue'
import ContentMarkdown from '~/components/Docs/ContentMarkdown.vue'
import { docsSections } from '~~/shared/docs-nav'
import type { MarkdownDocument as ComarkDocument } from 'comark'
import type { Toc } from '~~/shared/toc'

const route = useRoute()

const slug = computed(() => {
  const segments = route.params.slug
  if (Array.isArray(segments)) {
    return segments.join('/')
  }
  return segments ? String(segments) : ''
})

const section = computed(() => {
  const prefix = slug.value.split('/')[0]
  return docsSections.find((s) => s.title.toLowerCase() === prefix) ?? null
})

interface DocResponse {
  slug: string
  title: string
  description?: string
  document: ComarkDocument
  toc: Toc | null
  editUrl: string
  prev?: { title: string; slug: string } | null
  next?: { title: string; slug: string } | null
}

const { data, pending, error } = await useFetch<DocResponse>(
  computed(() => `/api/docs/${encodeURIComponent(slug.value)}`),
  {
    watch: [slug],
  },
)

useSeoMeta({
  title: () => (data.value?.title ? `${data.value.title} · Ferrite` : 'Ferrite docs'),
  description: () => data.value?.description,
  ogTitle: () => data.value?.title,
  ogDescription: () => data.value?.description,
})

const contentRef = ref<HTMLElement | null>(null)
const { enhance } = useContentEnhancer()

watch(
  () => data.value?.slug,
  () => {
    nextTick(() => {
      enhance(contentRef.value)
    })
  },
)

onMounted(() => {
  enhance(contentRef.value)
})
</script>

<template>
  <div class="mx-auto w-full max-w-[1440px]">
    <div class="grid grid-cols-1 lg:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)_240px]">
      <!-- Left sidebar -->
      <aside class="hidden lg:block">
        <div class="sticky top-14 max-h-[calc(100vh-3.5rem)] overflow-y-auto border-r border-border px-4 py-8">
          <DocsSidebar :active-slug="slug" />
        </div>
      </aside>

      <!-- Main content -->
      <main class="min-w-0 px-4 md:px-8 lg:px-12">
        <div
          v-if="pending"
          class="mx-auto flex max-w-3xl items-center justify-center py-32 text-muted-foreground"
        >
          <Loader2 class="size-6 animate-spin" />
        </div>

        <div
          v-else-if="error"
          class="mx-auto flex max-w-3xl flex-col items-center gap-4 py-32 text-center"
        >
          <FileQuestion class="size-10 text-muted-foreground" />
          <h1 class="text-2xl font-semibold">Document not found</h1>
          <p class="text-sm text-muted-foreground">
            No Ferrite documentation exists at <code class="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">/docs/{{ slug }}</code>.
          </p>
          <Button as="a" to="/docs/overview/introduction">
            Back to the documentation
          </Button>
        </div>

        <article
          v-else-if="data"
          class="mx-auto max-w-3xl pb-16 pt-10"
        >
          <nav
            class="mb-4 flex flex-wrap items-center gap-1.5 text-[13px] text-muted-foreground"
            aria-label="Breadcrumb"
          >
            <NuxtLink
              to="/docs/overview/introduction"
              class="transition-colors hover:text-foreground"
            >
              Docs
            </NuxtLink>
            <template v-if="section">
              <ChevronRight class="size-3.5 text-border" />
              <NuxtLink
                v-if="section.items[0]"
                :to="`/docs/${section.items[0].slug}`"
                class="transition-colors hover:text-foreground"
              >
                {{ section.title }}
              </NuxtLink>
              <span v-else>{{ section.title }}</span>
            </template>
            <template v-if="data">
              <ChevronRight class="size-3.5 text-border" />
              <span class="font-medium text-foreground">{{ data.title }}</span>
            </template>
          </nav>

          <div ref="contentRef">
            <ContentMarkdown :document="data.document" />
          </div>

          <DocPager
            :edit-url="data.editUrl"
            :prev="data.prev"
            :next="data.next"
          />
        </article>
      </main>

      <!-- Right TOC -->
      <aside class="hidden xl:block">
        <div class="sticky top-14 max-h-[calc(100vh-3.5rem)] overflow-y-auto px-6 py-8">
          <DocsToc :toc="data?.toc ?? null" />
        </div>
      </aside>
    </div>
  </div>
</template>