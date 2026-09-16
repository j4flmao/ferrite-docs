<script setup lang="ts">
import { ChevronRight } from '@lucide/vue'
import { docsSections } from '~~/shared/docs-nav'

const props = defineProps<{
  activeSlug: string
}>()

const sectionPrefix: Record<string, string> = {
  Overview: 'overview',
  Fundamentals: 'fundamentals',
  Techniques: 'techniques',
  Ecosystem: 'ecosystem',
}

const openState = reactive<Record<string, boolean>>(
  Object.fromEntries(
    docsSections.map((s) => [s.title, s.items.some((i) => i.slug === props.activeSlug)]),
  ),
)

watch(
  () => props.activeSlug,
  (slug) => {
    for (const section of docsSections) {
      openState[section.title] ||= section.items.some((i) => i.slug === slug)
    }
  },
)
</script>

<template>
  <nav class="flex flex-col gap-1">
    <div
      v-for="section in docsSections"
      :key="section.title"
      class="min-w-0"
    >
      <Collapsible v-model:open="openState[section.title]">
        <CollapsibleTrigger
          class="group flex w-full items-center gap-1 rounded-md px-2 py-1.5 text-[13px] font-semibold text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <span class="truncate">{{ section.title }}</span>
          <ChevronRight
            class="ml-auto size-3.5 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-90"
          />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div class="mt-0.5 flex flex-col gap-0.5 pl-2">
            <NuxtLink
              v-for="item in section.items"
              :key="item.slug"
              :to="`/docs/${item.slug}`"
              class="flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] leading-snug transition-colors"
              :class="item.slug === activeSlug
                ? 'font-medium text-foreground bg-accent'
                : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'"
            >
              <span class="truncate">{{ item.title }}</span>
            </NuxtLink>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  </nav>
</template>