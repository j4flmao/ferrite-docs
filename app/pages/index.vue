<script setup lang="ts">
import { heroCodeHtml } from '~/data/hero-code'
import {
  ArrowRight,
  GitFork,
  Boxes,
  Braces,
  Layers,
  ShieldCheck,
  Zap,
  Cpu,
  Route,
  Bot,
  Database,
  Radio,
  TestTube2,
  FileJson,
} from '@lucide/vue'

const features = [
  {
    icon: ShieldCheck,
    title: 'Compile-time dependency injection',
    description: 'Providers are registered and resolved at build time. Missing dependencies and cycles surface as compiler errors, never runtime panics.',
  },
  {
    icon: Layers,
    title: 'Modules & providers',
    description: 'Declare imports, providers, controllers and exports on a struct with the #[module] macro — your whole dependency graph in one place.',
  },
  {
    icon: Route,
    title: 'Macro-based routing',
    description: 'Annotate handlers with #[get], #[post], #[patch] and #[delete]. Ferrite wires Axum routes, pipelines and metadata for you.',
  },
  {
    icon: Bot,
    title: 'Cross-cutting concerns',
    description: 'Guards, interceptors, middleware, pipes and exception filters compose as attribute macros along a documented pipeline.',
  },
  {
    icon: Cpu,
    title: 'Configuration & validation',
    description: 'Layered .env and ferrite.toml via ConfigService, plus derive-based DTO validation that returns rich 422 responses.',
  },
  {
    icon: FileJson,
    title: 'OpenAPI out of the box',
    description: 'Export an OpenAPI 3.1 spec from route, body and guard metadata — and browse it in the bundled Swagger UI.',
  },
  {
    icon: Database,
    title: 'Persistence',
    description: 'One Repository abstraction over SQLx, Diesel and SeaORM adapters, with SQL migration tooling built into the CLI.',
  },
  {
    icon: Radio,
    title: 'Realtime & messaging',
    description: 'WebSocket gateways, gRPC transports, NATS and Kafka share the same module and controller model as HTTP.',
  },
  {
    icon: Zap,
    title: 'Caching, jobs & cron',
    description: 'Redis cache services, background job queues and cron scheduling are one fr add away from your service.',
  },
]

useSeoMeta({
  title: 'Ferrite — A batteries-included backend framework for Rust',
  description: 'Modules, compile-time dependency injection, and macro-based routing on top of Axum, Tokio, and Tower.',
})
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="relative overflow-hidden border-b border-border">
      <div
        class="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.12),transparent_55%)]"
      />
      <div class="mx-auto max-w-[1440px] px-4 py-24 md:px-6 md:py-32">
        <div class="mx-auto flex max-w-3xl flex-col items-center text-center">
          <div class="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs">
            <span class="inline-block size-1.5 rounded-full bg-emerald-500" />
            <span class="text-muted-foreground">MIT licensed · v0.1.0 · crates.io</span>
          </div>

          <h1 class="text-balance text-5xl font-bold tracking-tight md:text-6xl">
            Backend, <span class="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">batteries included</span>.
          </h1>

          <p class="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
            Ferrite gives Rust backends a structured, modular shape — modules, compile-time
            dependency injection, and macro-based routing on top of Axum, Tokio and Tower.
          </p>

          <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button as="a" to="/docs/overview/first-steps" size="lg">
              Get started
              <ArrowRight class="ml-2 size-4" />
            </Button>
            <Button
              as="a"
              href="https://github.com/j4flmao/ferrite_rs"
              target="_blank"
              rel="noopener"
              variant="outline"
              size="lg"
            >
              <GitFork class="mr-2 size-4" />
              View on GitHub
            </Button>
          </div>

          <div class="mt-10 flex flex-wrap items-center justify-center gap-2 text-xs">
            <Badge variant="secondary">Rust</Badge>
            <Badge variant="secondary">Axum 0.8</Badge>
            <Badge variant="secondary">Tokio</Badge>
            <Badge variant="secondary">Tower</Badge>
            <Badge variant="secondary">Compile-time DI</Badge>
            <Badge variant="secondary">Macro routing</Badge>
            <Badge variant="secondary">OpenAPI 3.1</Badge>
          </div>
        </div>
      </div>
    </section>

    <!-- Code showcase -->
    <section class="mx-auto max-w-[1440px] px-4 py-16 md:px-6">
      <div class="grid items-start gap-10 lg:grid-cols-2">
        <div class="flex flex-col gap-4 lg:sticky lg:top-24">
          <span class="text-sm font-semibold uppercase tracking-wider text-indigo-500">A minimal application</span>
          <h2 class="text-balance text-3xl font-bold tracking-tight">
            Describe the whole app in one module.
          </h2>
          <p class="max-w-md text-muted-foreground">
            Ferrite resolves every dependency at compile time. Controllers, providers and
            routes are discovered, wired and type-checked before your binary ever run.
          </p>
          <div class="flex flex-wrap gap-2">
            <Button as="a" to="/docs/overview/first-steps" variant="ghost">
              Read the guide
              <ArrowRight class="ml-2 size-4" />
            </Button>
          </div>
        </div>

        <div class="overflow-hidden rounded-xl border border-border bg-[oklch(0.985 0 0)] dark:bg-[oklch(0.205 0 0)] shadow-sm">
          <div class="flex items-center gap-1.5 border-b border-border px-4 py-2.5">
            <span class="size-2.5 rounded-full bg-red-400/80" />
            <span class="size-2.5 rounded-full bg-amber-400/80" />
            <span class="size-2.5 rounded-full bg-emerald-400/80" />
            <span class="ml-2 font-mono text-xs text-muted-foreground">src/main.rs</span>
          </div>
          <div
          v-html="heroCodeHtml"
          class="landing-code"
        />
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="border-y border-border bg-muted/30">
      <div class="mx-auto max-w-[1440px] px-4 py-20 md:px-6">
        <div class="mx-auto mb-12 flex max-w-2xl flex-col items-center text-center">
          <span class="text-sm font-semibold uppercase tracking-wider text-indigo-500">Features</span>
          <h2 class="mt-2 text-balance text-3xl font-bold tracking-tight">
            Everything you need, already wired in.
          </h2>
          <p class="mt-4 text-muted-foreground">
            Pull any ecosystem crate in with a single <code class="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">fr add</code> command.
          </p>
        </div>

        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card
            v-for="feature in features"
            :key="feature.title"
            class="transition-colors hover:border-foreground/30"
          >
            <CardHeader>
              <div class="mb-2 inline-flex size-9 items-center justify-center rounded-lg border border-border bg-background">
                <component :is="feature.icon" class="size-4.5 text-indigo-500" />
              </div>
              <CardTitle class="text-base">
                {{ feature.title }}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p class="text-sm leading-relaxed text-muted-foreground">
                {{ feature.description }}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>

    <!-- Ecosystem -->
    <section class="mx-auto max-w-[1440px] px-4 py-20 md:px-6">
      <div class="grid items-center gap-10 lg:grid-cols-2">
        <div class="flex flex-col gap-4">
          <span class="text-sm font-semibold uppercase tracking-wider text-indigo-500">Ecosystem</span>
          <h2 class="text-balance text-3xl font-bold tracking-tight">
            One consistent, pinned release line.
          </h2>
          <p class="max-w-md text-muted-foreground">
            Every ferrite-* crate is released in lockstep and pinned to the matching framework
            release, so your dependency tree always resolves to one consistent version.
          </p>
          <Button as="a" to="/docs/ecosystem/crates" variant="ghost">
            Browse the crates
            <ArrowRight class="ml-2 size-4" />
          </Button>
        </div>

        <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div
            v-for="item in [
              { icon: Boxes, label: 'auth-jwt', to: '/docs/techniques/authentication' },
              { icon: ShieldCheck, label: 'auth-oauth', to: '/docs/techniques/oauth2-oidc' },
              { icon: Database, label: 'orm-sea', to: '/docs/techniques/database' },
              { icon: Radio, label: 'ws', to: '/docs/techniques/websockets' },
              { icon: Braces, label: 'grpc', to: '/docs/techniques/grpc' },
              { icon: Zap, label: 'cron', to: '/docs/techniques/scheduling' },
              { icon: TestTube2, label: 'testing', to: '/docs/fundamentals/testing' },
              { icon: FileJson, label: 'swagger', to: '/docs/fundamentals/openapi-swagger' },
              { icon: Cpu, label: '+ 11 more', to: '/docs/ecosystem/crates' },
            ]"
            :key="item.label"
          >
            <NuxtLink
              :to="item.to"
              class="flex items-center gap-3 rounded-lg border border-border bg-card p-3.5 transition-colors hover:border-foreground/30 hover:bg-accent/40"
            >
              <component :is="item.icon" class="size-4 shrink-0 text-indigo-500" />
              <span class="truncate font-mono text-xs font-medium">{{ item.label }}</span>
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="border-t border-border">
      <div class="mx-auto flex max-w-[1440px] flex-col items-center gap-6 px-4 py-20 text-center md:px-6">
        <h2 class="max-w-xl text-balance text-3xl font-bold tracking-tight">
          Structure your first Ferrite service.
        </h2>
        <p class="max-w-lg text-muted-foreground">
          From scaffolding to production — controllers, guards, validation, OpenAPI and a CLI
          that does the boring work for you.
        </p>
        <div class="flex flex-wrap items-center justify-center gap-3">
          <Button as="a" to="/docs/overview/first-steps" size="lg">
            Read the docs
            <ArrowRight class="ml-2 size-4" />
          </Button>
          <Button
            as="a"
            href="https://crates.io/crates/ferrite-framework"
            target="_blank"
            rel="noopener"
            variant="outline"
            size="lg"
          >
            Install from crates.io
          </Button>
        </div>
      </div>
    </section>
  </div>
</template>