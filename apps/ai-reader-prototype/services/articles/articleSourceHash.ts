import { createHash } from 'node:crypto'

export type ArticleSourceHashInput = {
  body: string[]
  title: string
  url: string
}

export function createArticleSourceHash(input: ArticleSourceHashInput) {
  return createHash('sha256')
    .update(input.url.trim())
    .update('\n')
    .update(input.title.trim())
    .update('\n')
    .update(input.body.map((paragraph) => paragraph.replace(/\s+/g, ' ').trim()).filter(Boolean).join('\n\n'))
    .digest('hex')
}
