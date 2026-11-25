<template>
  <div data-testid="title">
    Nonce From render:html
    <Suspense>
      <LateTags />
    </Suspense>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Nonce From render:html',
  script: [{ id: 'shell-body-close', innerHTML: 'globalThis.__shellBodyClose = true', tagPosition: 'bodyClose' }],
})
</script>
