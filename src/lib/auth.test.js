import { describe, expect, it, vi } from 'vitest'
import { getSession, onAuthStateChange, signIn, signOut } from './auth.js'

// client จำลองเท่าที่ auth.js เรียกใช้จริง
function fakeClient({ signInError, session } = {}) {
  return {
    auth: {
      signInWithPassword: vi.fn().mockResolvedValue({ error: signInError ?? null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      getSession: vi.fn().mockResolvedValue({ data: { session: session ?? null } }),
      onAuthStateChange: vi.fn((callback) => {
        callback('SIGNED_IN', session ?? null)
        return { data: { subscription: { unsubscribe: vi.fn() } } }
      }),
    },
  }
}

describe('signIn', () => {
  it('ล็อกอินสำเร็จ = ไม่มีคำเตือน', async () => {
    const client = fakeClient()
    expect(await signIn('a@b.com', 'secret', client)).toBeNull()
    expect(client.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'a@b.com',
      password: 'secret',
    })
  })

  it('อีเมล/รหัสผ่านผิด = ข้อความภาษาไทยเจาะจง', async () => {
    const client = fakeClient({ signInError: { message: 'Invalid login credentials' } })
    expect(await signIn('a@b.com', 'wrong', client)).toBe('อีเมลหรือรหัสผ่านไม่ถูกต้อง')
  })

  it('ผิดพลาดแบบอื่น = ข้อความภาษาไทยทั่วไป', async () => {
    const client = fakeClient({ signInError: { message: 'Network error' } })
    expect(await signIn('a@b.com', 'secret', client)).toBe('เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่')
  })
})

describe('signOut', () => {
  it('เรียก signOut ของ client', async () => {
    const client = fakeClient()
    await signOut(client)
    expect(client.auth.signOut).toHaveBeenCalled()
  })
})

describe('getSession', () => {
  it('คืนเซสชันปัจจุบัน', async () => {
    const client = fakeClient({ session: { user: { id: 'u1' } } })
    expect(await getSession(client)).toEqual({ user: { id: 'u1' } })
  })
})

describe('onAuthStateChange', () => {
  it('เรียก callback ด้วยเซสชันล่าสุดเมื่อสถานะเปลี่ยน', () => {
    const client = fakeClient({ session: { user: { id: 'u1' } } })
    const callback = vi.fn()
    onAuthStateChange(callback, client)
    expect(callback).toHaveBeenCalledWith({ user: { id: 'u1' } })
  })
})
