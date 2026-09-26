import { useState } from 'react'
import { formatThaiDate } from '../lib/dateFormat.js'
import {
  STATUS,
  STATUS_LABEL,
  getDaysOverdue,
  getLoanStatus,
  markReturned,
  validateLoan,
} from '../lib/loanRules.js'

// หนึ่งรายการ Loan พร้อมปุ่ม: คืนแล้ว (เฉพาะที่ยังไม่คืน), ยกเลิกการคืน (เฉพาะที่คืนแล้ว), แก้ไข
// ไม่มีปุ่มลบ
export default function LoanItem({ loan, today, onMarkReturned, onUnmarkReturned, onEdit }) {
  const status = getLoanStatus(loan, today)
  const daysOverdue = getDaysOverdue(loan, today)
  const isReturned = status === STATUS.RETURNED

  const [returnDate, setReturnDate] = useState(today)
  const [errors, setErrors] = useState([])

  const handleMarkReturned = () => {
    const found = validateLoan(markReturned(loan, today, returnDate))
    setErrors(found)
    if (found.length > 0) return
    onMarkReturned(loan, returnDate)
  }

  return (
    <li className={`loan-item loan-${status}`}>
      <div className="loan-head">
        <strong>{loan.itemName}</strong>
        <span className={`status status-${status}`}>
          {STATUS_LABEL[status]}
          {status === STATUS.OVERDUE && ` ${daysOverdue} วัน`}
        </span>
      </div>
      <p className="loan-friend">👤 {loan.friendName}</p>
      <dl className="loan-dates">
        <div>
          <dt>วันที่ยืม</dt>
          <dd>{formatThaiDate(loan.borrowedDate)}</dd>
        </div>
        <div>
          <dt>กำหนดคืน</dt>
          <dd>{formatThaiDate(loan.dueDate)}</dd>
        </div>
        {isReturned && (
          <div>
            <dt>วันที่คืนจริง</dt>
            <dd>{formatThaiDate(loan.returnedDate)}</dd>
          </div>
        )}
      </dl>

      {!isReturned && (
        <div className="return-row">
          <label>
            วันที่คืนจริง
            <input
              type="date"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
            />
          </label>
          <button type="button" className="mark-returned" onClick={handleMarkReturned}>
            ✓ คืนแล้ว
          </button>
        </div>
      )}
      {errors.length > 0 && (
        <ul role="alert">
          {errors.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      )}

      <div className="loan-actions">
        {isReturned && (
          <button type="button" onClick={() => onUnmarkReturned(loan)}>
            ยกเลิกการคืน
          </button>
        )}
        <button type="button" className="ghost" onClick={() => onEdit(loan)}>
          ✏️ แก้ไข
        </button>
      </div>
    </li>
  )
}
