// https://nuxt.com/docs/api/configuration/nuxt-config
import fs from 'node:fs'
import tailwindcss from '@tailwindcss/vite'

const baseURL = '/ferrite-docs/'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@nuxtjs/color-mode', 'shadcn-nuxt'],

  css: ['~/assets/css/tailwind.css'],

  nitro: {
    prerender: {
      routes: ['/robots.txt', '/sitemap.xml'],
    },
  },

  vite: {
    plugins: [tailwindcss()],
    vue: {
      script: {
        fs: {
          fileExists: fs.existsSync,
          readFile: (file: string) => fs.readFileSync(file, 'utf-8'),
          realpath: fs.realpathSync,
        },
      },
    },
  },

  shadcn: {
    prefix: '',
    componentDir: '@/components/ui',
  },

  colorMode: {
    classSuffix: '',
    preference: 'system',
    fallback: 'light',
  },

  app: {
    baseURL,
    head: {
      htmlAttrs: { lang: 'en' },
      title: 'Ferrite — A batteries-included backend framework for Rust',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content:
            'Ferrite gives Rust backends a structured, modular shape with compile-time dependency injection and macro-based routing on top of Axum, Tokio, and Tower.',
        },
        { name: 'og:title', content: 'Ferrite — Rust backend framework' },
        {
          name: 'og:description',
          content:
            'Compile-time DI, modules, controllers, guards, interceptors, pipes — the batteries-included Rust backend framework.',
        },
        { name: 'og:type', content: 'website' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: `${baseURL}favicon.svg` },
        {
          rel: 'preconnect',
          href: 'https://fonts.googleapis.com',
        },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: '',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap',
        },
      ],
    },
  },

  future: {
    compatibilityVersion: 4,
  },
})