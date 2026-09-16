<script setup lang="ts">
import { ArrowLeft, ArrowRight, ExternalLink, Pencil } from '@lucide/vue'

defineProps<{
  editUrl: string
  prev?: { title: string; slug: string } | null
  next?: { title: string; slug: string } | null
}>()
</script>

<template>
  <div class="mt-6 flex flex-col gap-6">
    <div class="flex items-center justify-between gap-4 text-sm">
      <div class="flex items-center gap-1.5 text-muted-foreground">
        <Pencil class="size-3.5" />
        <a
          :href="editUrl"
          target="_blank"
          rel="noopener"
          class="inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
        >
          Edit this page on GitHub
          <ExternalLink class="size-3.5" />
        </a>
      </div>
      <NuxtLink
        to="/"
        class="text-muted-foreground transition-colors hover:text-foreground"
      >
        Ferrite docs
      </NuxtLink>
    </div>

    <div class="grid gap-4 sm:grid-cols-2">
      <NuxtLink
        v-if="prev"
        :to="`/docs/${prev.slug}`"
        class="group flex flex-col gap-1 rounded-lg border border-border bg-card p-4 transition-colors hover:border-foreground/40 hover:bg-accent/40"
      >
        <span class="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <ArrowLeft class="size-3.5 transition-transform group-hover:-translate-x-0.5" />
          Previous
        </span>
        <span class="text-sm font-medium text-foreground">{{ prev.title }}</span>
      </NuxtLink>

      <NuxtLink
        v-if="next"
        :to="`/docs/${next.slug}`"
        class="group flex flex-col gap-1 rounded-lg border border-border bg-card p-4 text-right transition-colors hover:border-foreground/40 hover:bg-accent/40"
      >
        <span class="inline-flex items-center justify-end gap-1 text-xs text-muted-foreground">
          Next
          <ArrowRight class="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
        <span class="text-sm font-medium text-foreground">{{ next.title }}</span>
      </NuxtLink>
    </div>
  </div>
</template>