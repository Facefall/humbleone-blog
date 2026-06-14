<template>
  <header class="articleHeader">
    <div>
      <h1 class="title">{{ page.title }}</h1>
      <div class="date">发布于：{{ publishDate }}</div>
    </div>
    <div class="sourceLinks" aria-label="文章来源">
      <a :href="githubSourceUrl" target="_blank" rel="noopener">GitHub</a>
      <a v-if="notionUrl" :href="notionUrl" target="_blank" rel="noopener">Notion</a>
    </div>
  </header>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useData } from 'vitepress'

const { page } = useData()
const publishDate = computed(() => String(page.value.frontmatter.date || '').slice(0, 10))
const notionUrl = computed(() => String(page.value.frontmatter.notionUrl || ''))
const githubSourceUrl = computed(() =>
  `https://github.com/Facefall/humbleone-blog/blob/main/${page.value.relativePath}`,
)
</script>

<style scoped>
.articleHeader {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 1rem;
  align-items: start;
  margin-bottom: 1em;
  padding-bottom: 1em;
  border-bottom: 1px dashed #c7c7c7;
}

.title {
  color: var(--vp-c-text-1);
  font-weight: 600;
  font-size: 2.25em;
  margin-top: 0.3em;
  margin-bottom: 0.3em;
  line-height: 1.3;
  font-family: var(--vp-font-family-base);
}

.date {
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.sourceLinks {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  padding-top: 0.75em;
  white-space: nowrap;
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.sourceLinks a {
  color: var(--vp-c-text-2);
  font-weight: 600;
  text-decoration: none;
}

.sourceLinks a:hover {
  color: var(--vp-c-brand);
}

@media (max-width: 640px) {
  .articleHeader {
    grid-template-columns: 1fr;
    gap: 0.25rem;
  }

  .sourceLinks {
    padding-top: 0;
  }
}
</style>
