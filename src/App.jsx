import { useEffect, useLayoutEffect, useState } from 'react'
import './App.css'
import LoginForm from './components/LoginForm.jsx'
import LoanForm from './components/LoanForm.jsx'
import LoanList from './components/LoanList.jsx'
import SearchBox from './components/SearchBox.jsx'
import ThemeToggle from './components/ThemeToggle.jsx'
import { getSession, onAuthStateChange, signOut } from './lib/auth.js'
import { toIsoDate } from './lib/dateFormat.js'
import { filterLoansByFriend, markReturned, unmarkReturned } from './lib/loanRules.js'
import { insertLoan, loadLoans, updateLoan } from './lib/storage.js'
import { getInitialTheme, saveTheme, toggleTheme } from './lib/theme.js'

function App() {
  // undefined = ยังไม่ตรวจสถานะล็อกอิน, null = ยังไม่ล็อกอิน, object = ล็อกอินแล้ว
  const [session, setSession] = useState(undefined)
  const [loans, setLoans] = useState([])
  const [warning, setWarning] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [query, setQuery] = useState('')
  const [theme, setTheme] = useState(() =>
    getInitialTheme(undefined, window.matchMedia('(prefers-color-scheme: dark)').matches),
  )

  // ตั้งธีมให้ <html> ก่อนวาดหน้าจอ เพื่อไม่ให้จอกะพริบ
  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  // ตรวจสถานะล็อกอินตอนเปิดหน้า และติดตามการเปลี่ยนสถานะ (ล็อกอิน/ออกจากระบบ/เซสชันหมดอายุ)
  useEffect(() => {
    getSession().then(setSession)
    const subscription = onAuthStateChange(setSession)
    return () => subscription.unsubscribe()
  }, [])

  // โหลด Loan เมื่อล็อกอินสำเร็จ (ตอนออกจากระบบไม่ต้องล้าง loans เพราะไม่แสดงผลอยู่แล้ว - ดูเงื่อนไข session ด้านล่าง)
  useEffect(() => {
    if (!session) return
    loadLoans().then(({ loans: loaded, warning: loadWarning }) => {
      setLoans(loaded)
      setWarning(loadWarning)
    })
  }, [session])

  const handleToggleTheme = () => {
    const next = toggleTheme(theme)
    setTheme(next)
    saveTheme(next)
  }

  const today = toIsoDate(new Date())
  const editingLoan = loans.find((loan) => loan.id === editingId) ?? null
  const visibleLoans = filterLoansByFriend(loans, query)

  const handleSave = async (loan) => {
    const result = loan.id ? await updateLoan(loan) : await insertLoan(loan)
    if (result.warning) {
      setWarning(result.warning)
      return
    }
    setWarning(null)
    setLoans((prev) =>
      loan.id ? prev.map((l) => (l.id === loan.id ? result.loan : l)) : [...prev, result.loan],
    )
    setEditingId(null)
  }

  // บันทึก Loan ที่แก้ผ่านฟังก์ชันตรรกะแล้วอัปเดตฐานข้อมูล ใช้กับกดคืนแล้ว/ยกเลิกการคืน
  const applyUpdate = async (loan, update) => {
    const result = await updateLoan(update(loan))
    if (result.warning) {
      setWarning(result.warning)
      return
    }
    setWarning(null)
    setLoans((prev) => prev.map((l) => (l.id === loan.id ? result.loan : l)))
  }

  const handleMarkReturned = (loan, returnedDate) =>
    applyUpdate(loan, (l) => markReturned(l, today, returnedDate))

  const handleUnmarkReturned = (loan) => applyUpdate(loan, unmarkReturned)

  if (session === undefined) return null
  if (session === null) return <LoginForm />

  return (
    <main>
      <header className="app-header">
        <h1>Borrow Buddy</h1>
        <div className="header-actions">
          <ThemeToggle theme={theme} onToggle={handleToggleTheme} />
          <button type="button" onClick={() => signOut()}>
            ออกจากระบบ
          </button>
        </div>
      </header>
      {warning && <p role="alert">{warning}</p>}
      <LoanForm
        key={editingLoan?.id ?? 'new'}
        today={today}
        editingLoan={editingLoan}
        onSave={handleSave}
        onCancelEdit={() => setEditingId(null)}
      />
      <SearchBox value={query} onChange={setQuery} />
      <LoanList
        loans={visibleLoans}
        today={today}
        onMarkReturned={handleMarkReturned}
        onUnmarkReturned={handleUnmarkReturned}
        onEdit={(loan) => setEditingId(loan.id)}
      />
    </main>
  )
}

export default App
