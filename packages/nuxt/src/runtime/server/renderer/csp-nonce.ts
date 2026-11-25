// The value must be a valid CSP nonce (base64 per the spec) so that it can be
// interpolated into `nonce="..."` without escaping.
const SCRIPT_NONCE_RE = /<script(?=[\s>])[^>]*?\snonce="([\w+/\-=]*)"/

export function extractCspNonce (headTags: string): string | undefined {
  return SCRIPT_NONCE_RE.exec(headTags)?.[1] || undefined
}

// an inline or external `<script>`/`<style>` element with its content; `</script` cannot occur
// inside rendered content, which unhead escapes
const SCRIPT_OR_STYLE_RE = /<(script|style)(?=[\s>])([^>]*)>([\s\S]*?)<\/\1>/g
const NONCE_ATTR_RE = /\snonce=/

/** Add `nonce` to the `<script>` and `<style>` tags in `html` that do not have one. */
export function stampCspNonce (html: string, nonce: string): string {
  return html.replace(SCRIPT_OR_STYLE_RE, (tag, name: string, attrs: string, content: string) =>
    NONCE_ATTR_RE.test(attrs) ? tag : `<${name} nonce="${nonce}"${attrs}>${content}</${name}>`,
  )
}
