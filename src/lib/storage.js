import { supabase } from './supabaseClient.js'

export const TABLE = 'loans'

export const LOAD_WARNING = 'โหลดข้อมูลไม่สำเร็จ กรุณาตรวจการเชื่อมต่อแล้วลองใหม่'
export const SAVE_WARNING = 'บันทึกข้อมูลไม่สำเร็จ ข้อมูลล่าสุดอาจไม่ถูกเก็บไว้'

// แปลงแถวจากตาราง Supabase (snake_case) เป็น Loan ของแอป (camelCase) และกลับกัน
function rowToLoan(row) {
  return {
    id: row.id,
    friendName: row.friend_name,
    itemName: row.item_name,
    borrowedDate: row.borrowed_date,
    dueDate: row.due_date,
    returnedDate: row.returned_date,
  }
}

function loanToRow(loan) {
  return {
    friend_name: loan.friendName,
    item_name: loan.itemName,
    borrowed_date: loan.borrowedDate,
    due_date: loan.dueDate,
    returned_date: loan.returnedDate ?? null,
  }
}

// client รับเป็นพารามิเตอร์ เพื่อให้ทดสอบด้วย client จำลองได้
// RLS จำกัดผลลัพธ์ไว้เฉพาะ Loan ของเจ้าของที่ล็อกอินอยู่แล้ว ไม่ต้องกรองเพิ่มที่นี่
export async function loadLoans(client = supabase) {
  const { data, error } = await client.from(TABLE).select('*')
  if (error) return { loans: [], warning: LOAD_WARNING }
  return { loans: data.map(rowToLoan), warning: null }
}

// เพิ่ม Loan ใหม่ (id และ owner_id กำหนดโดยฐานข้อมูล) คืน Loan ที่บันทึกแล้ว หรือ warning เมื่อไม่สำเร็จ
export async function insertLoan(loan, client = supabase) {
  const { data, error } = await client.from(TABLE).insert(loanToRow(loan)).select().single()
  if (error) return { loan: null, warning: SAVE_WARNING }
  return { loan: rowToLoan(data), warning: null }
}

// แก้ไข Loan เดิมตาม id (ใช้ทั้งแก้ไขฟอร์ม, กดคืนแล้ว, ยกเลิกการคืน) คืน Loan ที่บันทึกแล้ว หรือ warning เมื่อไม่สำเร็จ
export async function updateLoan(loan, client = supabase) {
  const { data, error } = await client
    .from(TABLE)
    .update(loanToRow(loan))
    .eq('id', loan.id)
    .select()
    .single()
  if (error) return { loan: null, warning: SAVE_WARNING }
  return { loan: rowToLoan(data), warning: null }
}
