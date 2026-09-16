<script setup lang="ts">
useSeoMeta({
  title: 'Ferrite — A batteries-included backend framework for Rust',
  ogTitle: 'Ferrite — A batteries-included backend framework for Rust',
  description: 'Modules, compile-time dependency injection, and macro-based routing on top of Axum, Tokio, and Tower.',
  ogDescription: 'Modules, compile-time dependency injection, and macro-based routing on top of Axum, Tokio, and Tower.',
})
</script>

<template>
  <div class="min-h-screen bg-background">
    <DocsHeader />
    <slot />
    <SiteFooter />
  </div>
</template>