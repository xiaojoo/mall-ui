import { describe, it, expect, beforeEach } from 'vitest'
import { SET_TOKEN, GET_TOKEN, REMOVE_TOKEN } from '../token'

describe('token 本地存储', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('SET_TOKEN 后 GET_TOKEN 能取回', () => {
    SET_TOKEN('abc-123')
    expect(GET_TOKEN()).toBe('abc-123')
  })

  it('REMOVE_TOKEN 后取不到', () => {
    SET_TOKEN('abc-123')
    REMOVE_TOKEN()
    expect(GET_TOKEN()).toBeNull()
  })

  it('使用专属键 MALL_UI_TOKEN，与后台 mall-web 的 token 隔离', () => {
    SET_TOKEN('x')
    expect(localStorage.getItem('MALL_UI_TOKEN')).toBe('x')
  })
})
