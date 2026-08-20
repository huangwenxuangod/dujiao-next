export const supportedLocales = ['zh-CN', 'zh-TW', 'en-US', 'ru-RU'] as const
export type SupportedLocale = typeof supportedLocales[number]

export type LocaleDetectionOptions = {
  savedLocale?: string | null
  languages?: readonly string[]
  hostname?: string
}

const localeFromBrowserLanguage = (language: string): SupportedLocale | null => {
  const normalized = language.trim().toLowerCase().replace('_', '-')
  if (!normalized) return null
  if (normalized === 'ru' || normalized.startsWith('ru-')) return 'ru-RU'
  if (normalized === 'en' || normalized.startsWith('en-')) return 'en-US'
  if (normalized.includes('hant') || /^(zh-(tw|hk|mo))/.test(normalized)) return 'zh-TW'
  if (normalized === 'zh' || normalized.startsWith('zh-')) return 'zh-CN'
  return null
}

const defaultLocaleForHostname = (hostname: string): SupportedLocale => {
  return hostname.trim().toLowerCase().split(':')[0] === 'cn.huangwenxuangod.xyz'
    ? 'zh-CN'
    : 'en-US'
}

export function detectLocale(options: LocaleDetectionOptions = {}): SupportedLocale {
  const saved = options.savedLocale ?? (typeof localStorage !== 'undefined' ? localStorage.getItem('locale') : null)
  if (saved && supportedLocales.includes(saved as SupportedLocale)) return saved as SupportedLocale

  const languages = options.languages ?? (typeof navigator !== 'undefined'
    ? (navigator.languages?.length ? navigator.languages : [navigator.language])
    : [])
  for (const language of languages) {
    const detected = localeFromBrowserLanguage(language)
    if (detected) return detected
  }

  const hostname = options.hostname ?? (typeof window !== 'undefined' ? window.location.hostname : '')
  return defaultLocaleForHostname(hostname)
}
