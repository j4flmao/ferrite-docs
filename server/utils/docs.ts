import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { createMarkdownParser } from 'comark'
import type { MarkdownDocument } from 'comark'
import shiki from 'comark/plugins/shiki'
import toc from 'comark/plugins/toc'
import githubLight from '@shikijs/themes/github-light'
import githubDark from '@shikijs/themes/github-dark'
import rust from '@shikijs/langs/rust'
import bash from '@shikijs/langs/bash'
import dockerfile from '@shikijs/langs/dockerfile'
import javascript from '@shikijs/langs/javascript'
import json from '@shikijs/langs/json'
import sql from '@shikijs/langs/sql'
import toml from '@shikijs/langs/toml'
import typescript from '@shikijs/langs/typescript'
import vue from '@shikijs/langs/vue'
import yaml from '@shikijs/langs/yaml'

export interface DocFrontmatter {
  title: string
  description?: string
}

export interface LoadedDoc {
  slug: string
  source: string
  frontmatter: DocFrontmatter
  document: MarkdownDocument
  toc: unknown
}

let parser: ReturnType<typeof createMarkdownParser> | null = null

export function getParser() {
  if (!parser) {
    parser = createMarkdownParser({
      registerDefaultPlugins: true,
      plugins: [
        shiki({
          themes: {
            light: githubLight,
            dark: githubDark,
          },
          languages: [
            rust,
            bash,
            dockerfile,
            javascript,
            json,
            sql,
            toml,
            typescript,
            vue,
            yaml,
          ],
        }),
        toc({ depth: 3, title: 'On This Page' }),
      ],
    })
  }
  return parser
}

export function docPath(slug: string) {
  return resolve(process.cwd(), 'content', 'docs', `${slug}.md`)
}

export async function loadDoc(slug: string): Promise<LoadedDoc> {
  const path = docPath(slug)
  if (!existsSync(path)) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Document not found',
      message: `No document found at content/docs/${slug}.md`,
    })
  }
  const source = await readFile(path, 'utf-8')
  const result = (await getParser()(source)) as unknown as {
    nodes: unknown[]
    meta: Record<string, unknown>
    frontmatter?: Record<string, unknown>
  }
  return {
    slug,
    source,
    frontmatter: {
      title: String(result.frontmatter?.title ?? slug),
      description: result.frontmatter?.description ? String(result.frontmatter.description) : undefined,
    },
    document: result as unknown as MarkdownDocument,
    toc: result.meta?.toc ?? null,
  }
}

export function getGithubEditUrl(slug: string) {
  return `https://github.com/j4flmao/ferrite_rs/edit/main/docs/content/${slug}.md`
}