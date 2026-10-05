import { describe, expect, it } from 'vitest'
import { readSeries, seriesFromHref, slugFromPath } from './homeScreen.ts'

describe('home screen series identity', () => {
  it('reads a series slug from the launch query', () => {
    expect(readSeries('https://volkanseki.github.io/zincirikirma/?series=sabah-yuruyusu#/sabah-yuruyusu')).toBe(
      'sabah-yuruyusu',
    )
    expect(readSeries('https://volkanseki.github.io/zincirikirma/#/')).toBeNull()
    expect(readSeries('https://volkanseki.github.io/zincirikirma/?series=../x')).toBeNull()
  })

  it('reads the open habit from the hash path', () => {
    expect(slugFromPath('/sabah-yuruyusu')).toBe('sabah-yuruyusu')
    expect(slugFromPath('/')).toBeNull()
  })

  it('prefers the series query and falls back to the hash', () => {
    expect(seriesFromHref('https://volkanseki.github.io/zincirikirma/?series=okuma#/sabah-yuruyusu')).toBe('okuma')
    expect(seriesFromHref('https://volkanseki.github.io/zincirikirma/#/sabah-yuruyusu')).toBe('sabah-yuruyusu')
    expect(seriesFromHref('https://volkanseki.github.io/zincirikirma/#/')).toBeNull()
  })
})
