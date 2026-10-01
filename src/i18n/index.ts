import he from './he.json'

// Strings live in a separate file per language so Russian can be added later.
const strings: Record<string, string> = he

export function t(key: string, vars?: Record<string, string | number>): string {
  let s = strings[key] ?? key
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.split(`{${k}}`).join(String(v))
  return s
}
