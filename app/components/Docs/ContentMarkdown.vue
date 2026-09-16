<script lang="ts">
import { defineComponent, h, type VNode, type PropType } from 'vue'
import type { MarkdownDocument as ComarkDocument } from 'comark'
import { withBase } from 'ufo'

type MarkdownNode = string | any[]

function internalHref(href: string) {
  const cleanHref = href.trim()
  return cleanHref.startsWith('/') && !cleanHref.startsWith('//')
}

export default defineComponent({
  name: 'ContentMarkdown',
  props: {
    document: {
      type: Object as PropType<ComarkDocument>,
      required: true,
    },
  },
  setup(props) {
    const runtimeConfig = useRuntimeConfig()
    const baseURL = runtimeConfig.app.baseURL || '/'

    function renderNode(node: MarkdownNode, slotKey?: number): VNode | string {
      if (typeof node === 'string') {
        return node
      }
      if (!Array.isArray(node) || node.length === 0) {
        return ''
      }

      const [tag, attrs, ...children] = node
      const rawChildren: Array<VNode | string> = (children ?? [])
        .map((child: MarkdownNode, i: number) => renderNode(child, i))
        .filter((child) => child !== null && child !== '' && child !== undefined)

      const newAttrs = { ...(attrs ?? {}) }

      if (tag === 'a' && typeof newAttrs.href === 'string' && internalHref(newAttrs.href)) {
        const trimmedHref = newAttrs.href.trim()
        if (!trimmedHref.startsWith(baseURL)) {
          newAttrs.href = withBase(trimmedHref, baseURL)
        }
      }

      return h(tag, { key: slotKey, ...newAttrs }, rawChildren)
    }

    return () => {
      const nodes: MarkdownNode[] = (props.document as unknown as { nodes?: MarkdownNode[] })?.nodes ?? []
      return h('div', { class: 'docs-prose' }, nodes.map((node, i) => renderNode(node, i)))
    }
  },
})
</script>