<script setup lang="ts">
import type { PrimitiveProps } from "reka-ui"
import type { HTMLAttributes, Component } from "vue"
import type { RouteLocationRaw } from "vue-router"
import type { ButtonVariants } from "."
import { Primitive } from "reka-ui"
import { NuxtLink } from "#components"
import { cn } from "@/lib/utils"
import { buttonVariants } from "."

const props = withDefaults(defineProps<{
  as?: PrimitiveProps["as"] | Component
  asChild?: boolean
  to?: RouteLocationRaw
  variant?: ButtonVariants["variant"]
  size?: ButtonVariants["size"]
  class?: HTMLAttributes["class"]
}>(), {
  as: "button" as const,
})

const asComponent = computed(() => (props.to !== undefined ? NuxtLink : props.as))
</script>

<template>
  <Primitive
    data-slot="button"
    :data-variant="variant"
    :data-size="size"
    :as="asComponent"
    :as-child="asChild"
    :to="to"
    :class="cn(buttonVariants({ variant, size }), props.class)"
  >
    <slot />
  </Primitive>
</template>