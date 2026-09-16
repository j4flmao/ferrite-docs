<script setup lang="ts">
import type { Toc } from '~~/shared/toc'

const props = defineProps<{
  toc: Toc | null
}>()

const activeId = ref<string | null>(null)
const observer = shallowRef<IntersectionObserver | null>(null)

function observe() {
  observer.value?.disconnect()
  if (!props.toc?.links.length) {
    return
  }

  const headings: HTMLElement[] = []
  const collect = (links: Toc['links']) => {
    for (const link of links) {
      const el = document.getElementById(link.id)
      if (el) {
        headings.push(el)
      }
      if (link.children) {
        collect(link.children)
      }
    }
  }
  collect(props.toc.links)

  if (!headings.length) {
    return
  }

  const io = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .map((e) => e.target.id)
      if (visible.length > 0) {
        activeId.value = visible[0] ?? null
      } else {
        const closest = headings.find((h) => h.getBoundingClientRect().top > 0)
        activeId.value = closest?.id ?? null
      }
    },
    { rootMargin: '-90px 0px -65% 0px', threshold: 0 },
  )

  headings.forEach((h) => io.observe(h))
  observer.value = io
}

onMounted(() => {
  observe()
  window.addEventListener('scroll', observe, { passive: true })
})

watch(
  () => props.toc,
  () => {
    activeId.value = null
    nextTick(observe)
  },
)

onBeforeUnmount(() => {
  observer.value?.disconnect()
  window.removeEventListener('scroll', observe)
})

const show = computed(() => props.toc?.links.length)
</script>

<template>
  <nav
    v-if="show"
    class="flex flex-col gap-3"
    aria-label="On this page"
  >
    <p class="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
      {{ toc?.title || 'On This Page' }}
    </p>
    <ul class="flex flex-col gap-1 border-l border-border">
      <template
        v-for="link in toc?.links"
        :key="link.id"
      >
        <li>
          <a
            :href="`#${link.id}`"
            class="block border-l border-border -ml-px py-1 pl-3 text-[13px] leading-snug transition-colors"
            :class="activeId === link.id
              ? 'border-foreground font-medium text-foreground'
              : link.depth > 2 ? 'pl-6 text-muted-foreground' : 'text-muted-foreground hover:text-foreground'"
          >
            {{ link.text }}
          </a>
        </li>
        <template v-if="link.children?.length">
          <li
            v-for="child in link.children"
            :key="child.id"
          >
            <a
              :href="`#${child.id}`"
              class="block border-l border-border -ml-px py-1 pl-6 text-[13px] leading-snug text-muted-foreground transition-colors"
              :class="activeId === child.id && 'border-foreground font-medium text-foreground'"
            >
              {{ child.text }}
            </a>
          </li>
        </template>
      </template>
    </ul>
  </nav>
</template>