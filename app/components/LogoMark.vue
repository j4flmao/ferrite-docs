<script setup lang="ts">
withDefaults(defineProps<{
  size?: number
}>(), {
  size: 32,
})
</script>

<template>
  <span class="inline-flex items-center gap-2 select-none">
    <span
      class="relative inline-block shrink-0 overflow-hidden drop-shadow-sm"
      :style="{ width: `${size}px`, height: `${size}px` }"
    >
      <img
        src="/favicon.svg"
        alt=""
        aria-hidden="true"
        class="h-full w-full object-cover"
        style="transform: scale(1.6); transform-origin: 50% 46%;"
      >
    </span>
    <span
      class="font-semibold tracking-tight text-foreground"
      :style="{ fontSize: `${Math.round(size * 0.72)}px` }"
    >Ferrite</span>
  </span>
</template>