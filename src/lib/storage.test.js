import { describe, expect, it } from 'vitest'
import { LOAD_WARNING, SAVE_WARNING, insertLoan, loadLoans, updateLoan } from './storage.js'

const row = {
  id: '1',
  friend_name: 'ต้น',
  item_name: 'ร่มสีฟ้า',
  borrowed_date: '2026-09-01',
  due_date: '2026-09-24',
  returned_date: null,
}

const loan = {
  id: '1',
  friendName: 'ต้น',
  itemName: 'ร่มสีฟ้า',
  borrowedDate: '2026-09-01',
  dueDate: '2026-09-24',
  returnedDate: null,
}

// client จำลองที่รองรับ chain เท่าที่ storage.js เรียกใช้จริง (thenable แบบเดียวกับ supabase-js)
// RLS ที่แท้จริงกรองข้อมูลที่ฝั่งฐานข้อมูล จึงจำลองแค่ผลลัพธ์ที่ควรได้กลับมา ไม่จำลอง RLS เอง
function fakeClient({ selectResult, insertResult, updateResult } = {}) {
  const calls = {}
  const builder = {
    select: () => builder,
    single: () => builder,
    eq: (column, value) => {
      calls.eq = { column, value }
      return builder
    },
    insert: (values) => {
      calls.insert = values
      return builder
    },
    update: (values) => {
      calls.update = values
      return builder
    },
    then: (resolve) => {
      resolve(calls.update ? updateResult : calls.insert ? insertResult : selectResult)
    },
  }
  return { client: { from: () => builder }, calls }
}

describe('loadLoans', () => {
  it('โหลดสำเร็จ = แปลงแถวเป็น Loan ของแอปครบทุกฟิลด์', async () => {
    const { client } = fakeClient({ selectResult: { data: [row], error: null } })
    expect(await loadLoans(client)).toEqual({ loans: [loan], warning: null })
  })

  it('โหลดไม่สำเร็จ = รายการว่างพร้อมคำเตือนภาษาไทย', async () => {
    const { client } = fakeClient({ selectResult: { data: null, error: { message: 'x' } } })
    expect(await loadLoans(client)).toEqual({ loans: [], warning: LOAD_WARNING })
  })
})

describe('insertLoan', () => {
  it('เพิ่มสำเร็จ = คืน Loan ที่บันทึกแล้ว (id จากฐานข้อมูล) ไม่มีคำเตือน', async () => {
    const { client, calls } = fakeClient({ insertResult: { data: row, error: null } })
    const draft = { ...loan, id: undefined }
    expect(await insertLoan(draft, client)).toEqual({ loan, warning: null })
    expect(calls.insert).toEqual({
      friend_name: 'ต้น',
      item_name: 'ร่มสีฟ้า',
      borrowed_date: '2026-09-01',
      due_date: '2026-09-24',
      returned_date: null,
    })
  })

  it('เพิ่มไม่สำเร็จ = คืนคำเตือนภาษาไทย ไม่โยนข้อผิดพลาด', async () => {
    const { client } = fakeClient({ insertResult: { data: null, error: { message: 'x' } } })
    expect(await insertLoan(loan, client)).toEqual({ loan: null, warning: SAVE_WARNING })
  })
})

describe('updateLoan', () => {
  it('แก้ไขสำเร็จ = คืน Loan ที่บันทึกแล้ว และอัปเดตด้วย id เดิม', async () => {
    const { client, calls } = fakeClient({ updateResult: { data: row, error: null } })
    expect(await updateLoan(loan, client)).toEqual({ loan, warning: null })
    expect(calls.eq).toEqual({ column: 'id', value: '1' })
  })

  it('แก้ไขไม่สำเร็จ = คืนคำเตือนภาษาไทย ไม่โยนข้อผิดพลาด', async () => {
    const { client } = fakeClient({ updateResult: { data: null, error: { message: 'x' } } })
    expect(await updateLoan(loan, client)).toEqual({ loan: null, warning: SAVE_WARNING })
  })
})
