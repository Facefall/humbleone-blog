import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { StandardReaderStoryFrame } from './StandardReaderStoryFrame'
import { StandardSearchCommand } from './StandardSearchCommand'

const meta = {
  title: 'AI Reader/Standard Search Command',
  component: StandardSearchCommand,
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'standard',
    },
  },
  args: {
    resultCount: 6,
    searchQuery: '',
    onSearchQueryChange: () => undefined,
  },
  decorators: [
    (Story) => (
      <StandardReaderStoryFrame>
        <Story />
      </StandardReaderStoryFrame>
    ),
  ],
} satisfies Meta<typeof StandardSearchCommand>

export default meta

type Story = StoryObj<typeof meta>

function SearchCommandPreview() {
  const [query, setQuery] = useState('')

  return (
    <div className="standard-search-story-hint">
      <span>Ctrl / Cmd + K</span>
      <small>Open content search</small>
      <StandardSearchCommand resultCount={6} searchQuery={query} onSearchQueryChange={setQuery} />
    </div>
  )
}

export const KeyboardTriggered: Story = {
  render: () => <SearchCommandPreview />,
}
