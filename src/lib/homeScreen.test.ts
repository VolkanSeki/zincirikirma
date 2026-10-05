import { describe, expect, it } from 'vitest'
import { readSeries, seriesFromHref, seriesLaunchPath, slugFromPath } from './homeScreen.ts'

const root = '/zincirikirma'

describe('home screen series identity', () => {
  it('reads a series slug from the launch query', () => {
    expect(readSeries('https://volkanseki.github.io/zincirikirma/?series=sabah-yuruyusu')).toBe('sabah-yuruyusu')
    expect(readSeries('https://volkanseki.github.io/zincirikirma/')).toBeNull()
    expect(readSeries('https://volkanseki.github.io/zincirikirma/?series=../x')).toBeNull()
  })

  it('reads the open habit from the path', () => {
    expect(slugFromPath('/sabah-yuruyusu')).toBe('sabah-yuruyusu')
    expect(slugFromPath('/')).toBeNull()
    expect(slugFromPath('/index.html')).toBeNull()
  })

  it('reads the series from a real path, then the hash', () => {
    expect(seriesFromHref('https://volkanseki.github.io/zincirikirma/sabah-yuruyusu', root)).toBe('sabah-yuruyusu')
    expect(seriesFromHref('https://volkanseki.github.io/zincirikirma/#/sabah-yuruyusu', root)).toBe('sabah-yuruyusu')
    expect(seriesFromHref('https://volkanseki.github.io/zincirikirma/?series=okuma#/sabah-yuruyusu', root)).toBe('okuma')
    expect(seriesFromHref('https://volkanseki.github.io/zincirikirma/', root)).toBeNull()
  })

  it('turns a hash or query launch into the series path', () => {
    expect(seriesLaunchPath('https://volkanseki.github.io/zincirikirma/#/sabah-yuruyusu', root)).toBe(
      '/zincirikirma/sabah-yuruyusu',
    )
    expect(seriesLaunchPath('https://volkanseki.github.io/zincirikirma/?series=sabah-yuruyusu', root)).toBe(
      '/zincirikirma/sabah-yuruyusu',
    )
    expect(seriesLaunchPath('https://volkanseki.github.io/zincirikirma/sabah-yuruyusu', root)).toBeNull()
    expect(seriesLaunchPath('https://volkanseki.github.io/zincirikirma/', root)).toBeNull()
    expect(seriesLaunchPath('http://localhost:5173/#/okuma', '')).toBe('/okuma')
  })
})
