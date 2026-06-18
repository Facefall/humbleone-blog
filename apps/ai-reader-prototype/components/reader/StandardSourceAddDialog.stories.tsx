import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import type { SourceCollection } from '../../types/reader'
import { StandardReaderStoryFrame } from './StandardReaderStoryFrame'
import { StandardSourceAddDialog } from './StandardSourceAddDialog'

const storyCollections: SourceCollection[] = [
  {
    id: 'ai-labs',
    name: 'AI 实验室',
    sourceIds: ['openai', 'anthropic', 'deepmind'],
  },
  {
    id: 'agent-tools',
    name: 'Agent 工具',
    sourceIds: ['codewhale', 'pydantic'],
  },
  {
    id: 'community',
    name: '社区观察',
    sourceIds: ['hacker-news', 'litemore'],
  },
]

const meta = {
  title: 'AI Reader/Standard Source Add Dialog',
  component: StandardSourceAddDialog,
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'standard',
    },
  },
  args: {
    collections: storyCollections,
    getCollectionLabel: (collection) => collection.name,
    open: true,
    onOpenChange: () => undefined,
    onSubmit: () => undefined,
  },
  decorators: [
    (Story) => (
      <StandardReaderStoryFrame height="100vh">
        <Story />
      </StandardReaderStoryFrame>
    ),
  ],
} satisfies Meta<typeof StandardSourceAddDialog>

export default meta

type Story = StoryObj<typeof meta>

function DialogPreview() {
  const [open, setOpen] = useState(true)

  return (
    <div style={{ display: 'grid', height: '100%', placeItems: 'center' }}>
      <button
        type="button"
        className="standard-source-menu-trigger"
        style={{ width: 112, color: 'var(--standard-primary)' }}
        onClick={() => setOpen(true)}
      >
        新增来源
      </button>
      <StandardSourceAddDialog
        collections={storyCollections}
        getCollectionLabel={(collection) => collection.name}
        open={open}
        onOpenChange={setOpen}
        onSubmit={() => undefined}
      />
    </div>
  )
}

export const UrlWithTag: Story = {
  render: () => <DialogPreview />,
}
