<template>
  <div>
    <h1 data-testid="title">
      Fouc
    </h1>

    <!-- A *nested* async component. `FoucNestedParent` resolves first, and only
         then renders the styled `FoucAsyncBlock`. That inner component is
         instantiated after the first chunk, so the renderer streams its SFC
         `<style>` ahead of the chunk that carries its DOM. -->
    <Suspense>
      <FoucNestedParent :delay="100" />
      <template #fallback>
        <div class="skeleton">
          loading nested...
        </div>
      </template>
    </Suspense>

    <!-- A slow sibling holds the stream open, so a `<style>` deferred to the
         closing HTML would leave `flashy` painted unstyled for a while. -->
    <Suspense>
      <AsyncBlock
        name="slow"
        :delay="800"
        :progress="100"
      />
      <template #fallback>
        <div class="skeleton">
          loading slow...
        </div>
      </template>
    </Suspense>
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'Fouc Test' })
</script>
