<script setup lang="ts">
import {
  GitFork,
  Menu,
  Moon,
  Search,
  Sun,
  ArrowRight,
} from '@lucide/vue'

const colorMode = useColorMode()
const searchOpen = ref(false)
const mobileOpen = ref(false)

const isDark = computed(() => colorMode.value === 'dark')

function toggleTheme() {
  colorMode.preference = isDark.value ? 'light' : 'dark'
}

const navLinks = [
  { label: 'Overview', to: '/docs/overview/introduction' },
  { label: 'Fundamentals', to: '/docs/fundamentals/dependency-injection' },
  { label: 'Techniques', to: '/docs/techniques/database' },
  { label: 'CLI reference', to: '/docs/ecosystem/cli-reference' },
]

const route = useRoute()

function getActiveSlug() {
  const segments = route.params.slug
  if (Array.isArray(segments)) {
    return segments.join('/')
  }
  return segments ? String(segments) : ''
}
</script>

<template>
  <header class="sticky top-0 z-50 h-14 border-b border-border bg-background/80 backdrop-blur-md">
    <div class="mx-auto flex h-full max-w-[1440px] items-center gap-3 px-4 md:px-6">
      <Button
        variant="ghost"
        size="icon"
        class="lg:hidden"
        aria-label="Toggle menu"
        @click="mobileOpen = true"
      >
        <Menu class="size-5" />
      </Button>

<NuxtLink to="/" class="shrink-0" aria-label="Ferrite home">
        <LogoMark :size="35" />
      </NuxtLink>

      <nav class="ml-2 hidden min-w-0 items-center gap-0.5 lg:flex">
        <NuxtLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="rounded-md px-3 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          {{ link.label }}
        </NuxtLink>
        <NuxtLink
          to="/docs/ecosystem/roadmap"
          class="rounded-md px-3 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          Roadmap
        </NuxtLink>
      </nav>

      <div class="ml-auto flex items-center gap-1">
        <Button
          variant="ghost"
          class="hidden gap-2 text-[13px] text-muted-foreground md:inline-flex"
          @click="searchOpen = true"
        >
          <Search class="size-4" />
          <span>Search...</span>
          <kbd class="pointer-events-none ml-2 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">/</kbd>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          class="md:hidden"
          aria-label="Search"
          @click="searchOpen = true"
        >
          <Search class="size-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          aria-label="GitHub repository"
          as="a"
          href="https://github.com/j4flmao/ferrite_rs"
          target="_blank"
          rel="noopener"
        >
          <GitFork class="size-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
          @click="toggleTheme"
        >
          <ClientOnly>
            <Sun v-if="isDark" class="size-4" />
            <Moon v-else class="size-4" />
            <template #fallback>
              <Moon class="size-4" />
            </template>
          </ClientOnly>
        </Button>
      </div>
    </div>

    <Sheet v-model:open="mobileOpen">
      <SheetContent side="left" class="w-[300px] gap-0 p-0 sm:max-w-[320px]">
        <SheetHeader class="h-14 flex-row items-center gap-2 border-b border-border px-4 pt-0 sm:pt-0">
          <SheetTitle class="sr-only">Documentation menu</SheetTitle>
          <LogoMark :size="30" />
        </SheetHeader>
        <div class="flex-1 overflow-y-auto px-3 py-4">
          <DocsSidebar :active-slug="getActiveSlug()" @click="mobileOpen = false" />
        </div>
        <div class="border-t border-border p-3">
          <NuxtLink
            to="/docs/overview/first-steps"
            class="flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            @click="mobileOpen = false"
          >
            Get started
            <ArrowRight class="size-4" />
          </NuxtLink>
        </div>
      </SheetContent>
    </Sheet>

    <SearchOverlay v-model:open="searchOpen" />
  </header>
</template>