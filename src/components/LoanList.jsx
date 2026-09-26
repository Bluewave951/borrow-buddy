import LoanItem from './LoanItem.jsx'

// ข้อความเมื่อแท็บไม่มีรายการ
const EMPTY_TEXT = {
  overdue: 'ไม่มีของที่เกินกำหนด เยี่ยมมาก 🎉',
  outstanding: 'ไม่มีของที่รอคืน',
  returned: 'ยังไม่มีรายการที่คืนแล้ว',
}

// รายการ Loan ของสถานะเดียว (App จัดกลุ่มและเรียงมาแล้ว)
export default function LoanList({ loans, status, today, onMarkReturned, onUnmarkReturned, onEdit }) {
  if (loans.length === 0) return <p className="empty">{EMPTY_TEXT[status]}</p>

  return (
    <ul className="loan-list">
      {loans.map((loan) => (
        <LoanItem
          key={loan.id}
          loan={loan}
          today={today}
          onMarkReturned={onMarkReturned}
          onUnmarkReturned={onUnmarkReturned}
          onEdit={onEdit}
        />
      ))}
    </ul>
  )
}
