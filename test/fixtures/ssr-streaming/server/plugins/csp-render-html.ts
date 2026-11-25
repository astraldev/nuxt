import { definePlugin as defineNitroPlugin } from 'nitro'

const NONCE = 'render-html-nonce'

// Behaves like a CSP module that stamps its nonce in `render:html` only (as
// nuxt-security does): it never sees the tags streamed after the shell. Gated
// to `/nonce-render-html`.
export default defineNitroPlugin((nitro) => {
  nitro.hooks.hook('render:html', (ctx, { event }) => {
    if (event.url.pathname !== '/nonce-render-html') { return }
    event.res.headers.set('content-security-policy', `script-src 'nonce-${NONCE}' 'strict-dynamic'`)
    for (const section of ['head', 'bodyPrepend'] as const) {
      ctx[section] = ctx[section].map(chunk => chunk.replace(/<(script|link)(?=[\s>])/g, `<$1 nonce="${NONCE}"`))
    }
  })
})
