<script setup lang="ts">
import { Search, X, FileText } from '@lucide/vue'
import { docsSections } from '~~/shared/docs-nav'

const open = defineModel<boolean>('open', { default: false })

const query = ref('')
const input = ref<HTMLInputElement | null>(null)
const activeIndex = ref(0)

const results = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) {
    return []
  }
  const flat: { section: string; title: string; slug: string }[] = []
  for (const section of docsSections) {
    for (const item of section.items) {
      if (
        item.title.toLowerCase().includes(q)
        || section.title.toLowerCase().includes(q)
        || item.slug.toLowerCase().includes(q)
      ) {
        flat.push({ section: section.title, title: item.title, slug: item.slug })
      }
    }
  }
  return flat
})

function reset() {
  query.value = ''
  activeIndex.value = 0
}

function go(slug: string) {
  reset()
  open.value = false
  navigateTo(`/docs/${slug}`)
}

watch(open, (isOpen) => {
  if (isOpen) {
    activeIndex.value = 0
    nextTick(() => input.value?.focus())
  }
})

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    open.value = false
    return
  }

  if (!results.value.length) {
    return
  }

  if (e.key === 'ArrowDown') {
    e.preventDefault()
    activeIndex.value = Math.min(activeIndex.value + 1, results.value.length - 1)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    activeIndex.value = Math.max(activeIndex.value - 1, 0)
  } else if (e.key === 'Enter') {
    e.preventDefault()
    const result = results.value[activeIndex.value]
    if (result) {
      go(result.slug)
    }
  }
}

function onGlobalKeydown(e: KeyboardEvent) {
  const target = e.target as HTMLElement
  const isTyping = target.matches('input, textarea, select, [contenteditable]')
  if (!isTyping && (e.key === '/' || (e.ctrlKey && e.key.toLowerCase() === 'k'))) {
    e.preventDefault()
    open.value = true
  }
}

onMounted(() => {
  window.addEventListener('keydown', onGlobalKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onGlobalKeydown)
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-150"
      enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-150"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-[60] flex items-start justify-center bg-background/40 p-4 pt-[12vh] backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-label="Search documentation"
        @click.self="open = false"
      >
        <div
          class="w-full max-w-lg overflow-hidden rounded-xl border border-border bg-card shadow-2xl"
          @keydown="onKeydown"
        >
          <div class="flex items-center gap-2 border-b border-border px-4">
            <Search class="size-4 shrink-0 text-muted-foreground" />
            <input
              ref="input"
              v-model="query"
              type="text"
              placeholder="Search the documentation..."
              class="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              @input="activeIndex = 0"
            >
            <Button
              variant="ghost"
              size="icon"
              class="size-7"
              aria-label="Close search"
              @click="open = false"
            >
              <X class="size-4" />
            </Button>
          </div>

          <div class="max-h-[50vh] overflow-y-auto p-2">
            <p
              v-if="query && !results.length"
              class="px-3 py-8 text-center text-sm text-muted-foreground"
            >
              No results for “{{ query }}”
            </p>
            <p
              v-else-if="!query"
              class="px-3 py-8 text-center text-sm text-muted-foreground"
            >
              Type to search across all documentation pages.
            </p>
            <ul
              v-else
              class="flex flex-col gap-0.5"
            >
              <li
                v-for="(result, index) in results"
                :key="result.slug"
              >
                <button
                  type="button"
                  class="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left transition-colors"
                  :class="index === activeIndex ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/60'"
                  @click="go(result.slug)"
                  @mouseenter="activeIndex = index"
                >
                  <FileText class="size-4 shrink-0 text-muted-foreground" />
                  <span class="min-w-0">
                    <span class="block truncate text-sm font-medium">{{ result.title }}</span>
                    <span class="block truncate text-xs text-muted-foreground">{{ result.section }}</span>
                  </span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>