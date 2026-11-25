/// <reference path="../fixtures/basic/.nuxt/nuxt.d.ts" />

import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { streamingIifeCode } from '@unhead/vue/stream/iife'
import { createStreamableHead } from '@unhead/vue/stream/client'

import { Body, Html } from '#app/../head/runtime/components'
import { installClientHead } from '#app/../head/runtime/client-head'
import { getClientHeadState } from '#app/../head/runtime/client-head-state'

describe('head components with a streamed client head', () => {
  afterEach(() => {
    delete (window as any).__unhead__
    document.documentElement.removeAttribute('data-theme')
  })

  // With `experimental.ssrStreaming`, the client head is unhead's stream adapter, which renders
  // the DOM synchronously on `patch()`. `<Html>` and `<Body>` patch from their render functions,
  // so that render must not subscribe them to the input they share.
  it('updates a bound <Html> attribute without <Html> and <Body> re-rendering each other', async () => {
    // the inline IIFE a streamed response runs before the app hydrates
    new Function(streamingIifeCode)()
    const head = createStreamableHead()!
    expect(head).toBeDefined()
    const nuxtApp = useNuxtApp()
    installClientHead(nuxtApp, head)
    // the app has hydrated, so DOM updates are no longer paused
    getClientHeadState(nuxtApp).paused = false

    const theme = ref('system')
    const renders: Record<string, number> = { Html: 0, Body: 0 }
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const wrapper = await mountSuspended(defineComponent({
      setup () {
        return () => h(Html, { 'lang': 'en', 'data-theme': theme.value }, () => [
          h(Body, { class: 'app' }, () => [h('p', 'rendered')]),
        ])
      },
    }), {
      global: {
        mixins: [{
          // counts re-renders caused by a reactive change, by component
          renderTriggered (this: { $options: { name?: string } }) {
            const name = this.$options.name
            if (name && name in renders) { renders[name]!++ }
          },
        }],
      },
    })

    await nextTick()
    renders.Html = renders.Body = 0

    theme.value = 'dark'
    await nextTick()
    await nextTick()

    expect(warn.mock.calls.flat().join('\n')).not.toContain('Maximum recursive updates')
    // `<Html>` re-renders for its own prop; `<Body>` has nothing to re-render for
    expect(renders.Html).toBeLessThanOrEqual(2)
    expect(renders.Body).toBe(0)
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')

    wrapper.unmount()
    warn.mockRestore()
  })
})
