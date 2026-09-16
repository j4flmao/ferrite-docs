<script setup lang="ts">
import { GitFork } from '@lucide/vue'

const columns = [
  {
    title: 'Docs',
    links: [
      { label: 'Introduction', to: '/docs/overview/introduction' },
      { label: 'First steps', to: '/docs/overview/first-steps' },
      { label: 'Controllers', to: '/docs/overview/controllers' },
      { label: 'CLI reference', to: '/docs/ecosystem/cli-reference' },
    ],
  },
  {
    title: 'Techniques',
    links: [
      { label: 'Database', to: '/docs/techniques/database' },
      { label: 'Authentication', to: '/docs/techniques/authentication' },
      { label: 'WebSockets', to: '/docs/techniques/websockets' },
      { label: 'gRPC', to: '/docs/techniques/grpc' },
    ],
  },
  {
    title: 'Ecosystem',
    links: [
      { label: 'Ecosystem crates', to: '/docs/ecosystem/crates' },
      { label: 'Roadmap', to: '/docs/ecosystem/roadmap' },
      { label: 'Examples', to: '/docs/ecosystem/crates' },
      { label: 'Contributing', to: 'https://github.com/j4flmao/ferrite_rs/blob/main/CONTRIBUTING.md' },
    ],
  },
]
</script>

<template>
  <footer class="border-t border-border bg-muted/30">
    <div class="mx-auto max-w-[1440px] px-4 md:px-6">
      <div class="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div class="flex flex-col gap-3">
          <LogoMark :size="32" />
          <p class="max-w-xs text-sm leading-relaxed text-muted-foreground">
            A batteries-included backend framework for Rust: modules, compile-time dependency injection, and macro-based routing on top of Axum, Tokio, and Tower.
          </p>
          <div class="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              as="a"
              href="https://github.com/j4flmao/ferrite_rs"
              target="_blank"
              rel="noopener"
            >
              <GitFork class="size-3.5" />
              GitHub
            </Button>
          </div>
        </div>

        <div
          v-for="column in columns"
          :key="column.title"
          class="flex flex-col gap-3"
        >
          <p class="text-sm font-semibold text-foreground">{{ column.title }}</p>
          <ul class="flex flex-col gap-2">
            <li
              v-for="link in column.links"
              :key="link.label"
            >
              <NuxtLink
                v-if="link.to.startsWith('/')"
                :to="link.to"
                class="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {{ link.label }}
              </NuxtLink>
              <a
                v-else
                :href="link.to"
                target="_blank"
                rel="noopener"
                class="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {{ link.label }}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div class="flex flex-col gap-2 border-t border-border py-6 sm:flex-row sm:items-center sm:justify-between">
        <p class="text-xs text-muted-foreground">
          © {{ new Date().getFullYear() }} Ferrite. Released under the MIT License.
        </p>
        <p class="text-xs text-muted-foreground">
          Built with Nuxt, Comark and shadcn/ui.
        </p>
      </div>
    </div>
  </footer>
</template>