import { useState } from 'react'
import { signIn } from '../lib/auth.js'

// ฟอร์มล็อกอินสำหรับเจ้าของ ไม่มีลิงก์สมัครสมาชิก (บัญชีสร้างไว้ล่วงหน้า)
export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    const message = await signIn(email, password)
    setSubmitting(false)
    setError(message)
  }

  return (
    <main className="login-page">
      <form onSubmit={handleSubmit} noValidate>
        <h1>Borrow Buddy</h1>
        <h2>เข้าสู่ระบบ</h2>

        <label>
          อีเมล
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            required
          />
        </label>

        <label>
          รหัสผ่าน
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>

        {error && <p role="alert">{error}</p>}

        <button type="submit" disabled={submitting}>
          {submitting ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
        </button>
      </form>
    </main>
  )
}
