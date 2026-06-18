import type { Preview } from '@storybook/nextjs-vite'
import type { Decorator } from '@storybook/react'
import { I18nextProvider } from 'react-i18next'

import '../app/globals.css'
import { fontVariables } from '../lib/fonts'
import i18n from '../lib/i18n/client'
import { type AppLocale, supportedLocales } from '../lib/i18n/settings'

const withI18n: Decorator = (Story, context) => {
  const locale = (context.globals.locale as AppLocale | undefined) ?? 'zh-CN'

  if (i18n.language !== locale) {
    void i18n.changeLanguage(locale)
  }

  return (
    <I18nextProvider i18n= { i18n } >
    <div className={ fontVariables }>
      <Story />
      </div>
      </I18nextProvider>
  )
}

const preview: Preview = {
  decorators: [withI18n],
  globalTypes: {
    locale: {
      name: 'Locale',
      description: 'UI language',
      toolbar: {
        icon: 'globe',
        items: supportedLocales.map((locale) => ({
          value: locale,
          title: locale,
        })),
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    locale: 'zh-CN',
  },
  parameters: {
    nextjs: {
      appDirectory: true,
    },
    layout: 'centered',
    backgrounds: {
      default: 'standard',
      values: [
        { name: 'standard', value: '#0c0c0c' },
        { name: 'desk', value: '#1b100c' },
        { name: 'paper', value: '#ead6b9' },
      ],
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
}

export default preview
