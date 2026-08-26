const CN_HOST = 'cn.huangwenxuangod.xyz'
const OVERSEAS_HOST = 'huangwenxuangod.xyz'

const trimOrigin = (value: string) => value.replace(/\/+$/, '')

export const currentSiteOrigin = () => {
  if (typeof window === 'undefined') return ''
  return trimOrigin(window.location.origin)
}

export const localizedSiteOrigins = () => {
  if (typeof window === 'undefined') return null
  const hostname = window.location.hostname.toLowerCase()
  if (hostname !== CN_HOST && hostname !== OVERSEAS_HOST) return null
  const protocol = window.location.protocol
  return {
    cn: `${protocol}//${CN_HOST}`,
    overseas: `${protocol}//${OVERSEAS_HOST}`,
  }
}
