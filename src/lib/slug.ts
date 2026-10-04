const TURKISH_MAP: Record<string, string> = {
  ç: 'c',
  Ç: 'c',
  ğ: 'g',
  Ğ: 'g',
  ı: 'i',
  I: 'i',
  İ: 'i',
  ö: 'o',
  Ö: 'o',
  ş: 's',
  Ş: 's',
  ü: 'u',
  Ü: 'u',
}

export function slugify(input: string): string {
  const replaced = input.replace(/[çÇğĞıIİöÖşŞüÜ]/g, (char) => TURKISH_MAP[char] ?? char)
  return replaced
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
}

export function uniqueSlug(base: string, existing: string[]): string {
  if (!base) return ''
  if (!existing.includes(base)) return base
  let suffix = 2
  while (existing.includes(`${base}-${suffix}`)) suffix += 1
  return `${base}-${suffix}`
}
