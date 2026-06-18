'use client'

import { useTranslation } from 'react-i18next'

import { type AppLocale, supportedLocales } from '../lib/i18n/settings'

export function LocaleSwitcher() {
  const { i18n, t } = useTranslation('common')
  const currentLocale = (supportedLocales.includes(i18n.language as AppLocale) ? i18n.language : 'zh-CN') as AppLocale

  function setLocale(locale: AppLocale) {
    void i18n.changeLanguage(locale)
  }

  return (
    <div className="locale-switcher" role="group" aria-label={t('localeSwitcher.aria')}>
      {supportedLocales.map((locale) => (
        <button
          key={locale}
          type="button"
          className={locale === currentLocale ? 'is-active' : undefined}
          aria-pressed={locale === currentLocale}
          onClick={() => setLocale(locale)}
        >
          {t(`localeSwitcher.${locale === 'zh-CN' ? 'zh' : 'en'}`)}
        </button>
      ))}
    </div>
  )
}
