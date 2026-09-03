import { getImageUrl } from './image'

const SITE_ICON_LINK_ID = 'site-favicon'
const DEFAULT_SITE_ICON = '/site-icon.jpg?v=gotou-20260903'

export function resolveSiteIconHref(value: unknown): string {
  const icon = String(value || '').trim()
  return !icon || icon === '/dj.svg' ? DEFAULT_SITE_ICON : getImageUrl(icon)
}

export function applySiteIcon(value: unknown) {
  const link = document.getElementById(SITE_ICON_LINK_ID) as HTMLLinkElement | null
  if (link) {
    link.href = resolveSiteIconHref(value)
  }
}
