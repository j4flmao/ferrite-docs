declare const document: Document | undefined

export function useContentEnhancer() {
  const enhance = (root: HTMLElement | null) => {
    if (!root) {
      return
    }

    // Code blocks: add a header with the language, an optional filename and a copy button.
    root.querySelectorAll<HTMLPreElement>('pre.shiki').forEach((pre) => {
      const code = pre.querySelector('code')
      const lang =
        code?.getAttribute('data-language')
        || pre.getAttribute('data-language')
        || code?.className.match(/language-([\w-]+)/)?.[1]
        || 'text'

      if (pre.parentElement?.classList.contains('code-block') === false) {
        const wrapper = document!.createElement('div')
        wrapper.className = 'code-block'
        pre.parentElement?.insertBefore(wrapper, pre)
        wrapper.appendChild(pre)
      }

      const block = pre.parentElement
      if (!block || block.querySelector('.code-filename')) {
        return
      }

      const header = document!.createElement('div')
      header.className = 'code-filename'

      const label = document!.createElement('span')
      label.textContent = lang
      header.appendChild(label)

      const spacer = document!.createElement('span')
      spacer.className = 'flex-1'
      header.appendChild(spacer)

      const copyButton = document!.createElement('button')
      copyButton.type = 'button'
      copyButton.className =
        'inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground'
      copyButton.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>'
      copyButton.append('Copy')
      header.appendChild(copyButton)

      block.insertBefore(header, block.firstChild)

      copyButton.addEventListener('click', async () => {
        const text = pre.textContent ?? ''
        try {
          await navigator.clipboard.writeText(text)
        } catch {
          const textarea = document!.createElement('textarea')
          textarea.value = text
          document!.body.appendChild(textarea)
          textarea.select()
          document!.execCommand('copy')
          textarea.remove()
        }
        copyButton.textContent = 'Copied'
        copyButton.setAttribute('data-copied', 'true')
        setTimeout(() => {
          const svg = document!.createElement('div')
          svg.innerHTML =
            '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>'
          copyButton.innerHTML = ''
          copyButton.appendChild(svg)
          copyButton.append('Copy')
          copyButton.removeAttribute('data-copied')
        }, 1600)
      })
    })

    // Heading anchor links (#)
    root.querySelectorAll<HTMLHeadingElement>('h1, h2, h3, h4, h5, h6[id]').forEach((heading) => {
      if (heading.querySelector('a.anchor-link')) {
        return
      }
      const link = document!.createElement('a')
      link.className = 'anchor-link'
      link.href = `#${heading.id}`
      link.setAttribute('aria-label', `Link to ${heading.textContent?.trim() ?? heading.id}`)
      link.textContent = '#'
      heading.appendChild(link)
    })
  }

  return { enhance }
}