import { t } from './i18n'

/**
 * Share through the system share sheet; fall back to copying.
 * Returns a status message to show inline (empty when nothing needs saying).
 */
export async function shareText(title: string, text: string): Promise<string> {
  if (navigator.share) {
    try {
      await navigator.share({ title, text })
      return ''
    } catch (e) {
      if ((e as DOMException).name === 'AbortError') return ''
    }
  }
  try {
    await navigator.clipboard.writeText(text)
    return t('share.copied')
  } catch {
    return t('share.failed')
  }
}
