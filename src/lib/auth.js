import { supabase } from './supabaseClient.js'

const LOGIN_ERROR = 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'
const GENERIC_ERROR = 'เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่'

// client รับเป็นพารามิเตอร์ เพื่อให้ทดสอบด้วย client จำลองได้
export async function signIn(email, password, client = supabase) {
  const { error } = await client.auth.signInWithPassword({ email, password })
  if (!error) return null
  return error.message === 'Invalid login credentials' ? LOGIN_ERROR : GENERIC_ERROR
}

export async function signOut(client = supabase) {
  await client.auth.signOut()
}

export async function getSession(client = supabase) {
  const {
    data: { session },
  } = await client.auth.getSession()
  return session
}

// callback ได้รับ session (หรือ null เมื่อออกจากระบบ) ทุกครั้งที่สถานะล็อกอินเปลี่ยน
export function onAuthStateChange(callback, client = supabase) {
  const {
    data: { subscription },
  } = client.auth.onAuthStateChange((_event, session) => callback(session))
  return subscription
}
