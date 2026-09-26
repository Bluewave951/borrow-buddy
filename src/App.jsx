import { useEffect, useLayoutEffect, useState } from 'react'
import './App.css'
import LoginForm from './components/LoginForm.jsx'
import LoanForm from './components/LoanForm.jsx'
import LoanList from './components/LoanList.jsx'
import SearchBox from './components/SearchBox.jsx'
import ThemeToggle from './components/ThemeToggle.jsx'
import { getSession, onAuthStateChange, signOut } from './lib/auth.js'
import { toIsoDate } from './lib/dateFormat.js'
import {
  STATUS,
  STATUS_LABEL,
  filterLoansByFriend,
  groupLoans,
  markReturned,
  unmarkReturned,
} from './lib/loanRules.js'
import { insertLoan, loadLoans, updateLoan } from './lib/storage.js'
import { getInitialTheme, saveTheme, toggleTheme } from './lib/theme.js'

// แท็บหลัก: รายการแยกตามสถานะ + แท็บเพิ่ม/แก้ไข
const TAB_ADD = 'add'
const TABS = [
  { id: STATUS.OVERDUE, icon: '⏰', label: STATUS_LABEL[STATUS.OVERDUE] },
  { id: STATUS.OUTSTANDING, icon: '📦', label: STATUS_LABEL[STATUS.OUTSTANDING] },
  { id: STATUS.RETURNED, icon: '✅', label: STATUS_LABEL[STATUS.RETURNED] },
  { id: TAB_ADD, icon: '➕', label: 'เพิ่ม' },
]

function App() {
  // undefined = ยังไม่ตรวจสถานะล็อกอิน, null = ยังไม่ล็อกอิน, object = ล็อกอินแล้ว
  const [session, setSession] = useState(undefined)
  const [loans, setLoans] = useState([])
  const [warning, setWarning] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState(STATUS.OUTSTANDING)
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
  const groups = groupLoans(visibleLoans, today)

  const handleEdit = (loan) => {
    setEditingId(loan.id)
    setTab(TAB_ADD)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setTab(STATUS.OUTSTANDING)
  }

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
    if (loan.id) setTab(STATUS.OUTSTANDING)
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
    <main className="app">
      <header className="app-header">
        <div className="brand">
          <span className="brand-logo" aria-hidden="true">🤝</span>
          <div>
            <h1>Borrow Buddy</h1>
            <p className="brand-sub">จดว่าใครยืมอะไรไป ไม่ลืมทวงคืน</p>
          </div>
        </div>
        <div className="header-actions">
          <ThemeToggle theme={theme} onToggle={handleToggleTheme} />
          <button type="button" className="ghost" onClick={() => signOut()}>
            ออกจากระบบ
          </button>
        </div>
      </header>

      <nav className="tabs" role="tablist" aria-label="เมนูหลัก">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={`tab tab-${t.id}`}
            onClick={() => setTab(t.id)}
          >
            <span className="tab-icon" aria-hidden="true">{t.icon}</span>
            <span className="tab-label">
              {t.id === TAB_ADD && editingLoan ? 'แก้ไข' : t.label}
            </span>
            {t.id !== TAB_ADD && <span className="tab-count">{groups[t.id].length}</span>}
          </button>
        ))}
      </nav>

      {warning && <p role="alert">{warning}</p>}

      <div className="tab-panel" role="tabpanel">
        {tab === TAB_ADD ? (
          <LoanForm
            key={editingLoan?.id ?? 'new'}
            today={today}
            editingLoan={editingLoan}
            onSave={handleSave}
            onCancelEdit={handleCancelEdit}
          />
        ) : (
          <>
            <SearchBox value={query} onChange={setQuery} />
            <LoanList
              loans={groups[tab]}
              status={tab}
              today={today}
              onMarkReturned={handleMarkReturned}
              onUnmarkReturned={handleUnmarkReturned}
              onEdit={handleEdit}
            />
          </>
        )}
      </div>
    </main>
  )
}

export default App
