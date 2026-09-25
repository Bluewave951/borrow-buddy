# Borrow Buddy

ระบบบันทึกของที่เจ้าของให้เพื่อนยืม ว่าใครยืมอะไร เมื่อไร ต้องคืนเมื่อไร และคืนแล้วหรือยัง

## ฟีเจอร์

- บันทึกการยืม (Loan) พร้อมชื่อเพื่อน, ของที่ยืม, วันที่ยืม และกำหนดคืน
- ติดตามสถานะ: ยังไม่คืน (Outstanding), เกินกำหนด (Overdue), คืนแล้ว (Returned)
- ค้นหารายการยืม
- สลับธีมสว่าง/มืด (Light/Dark theme)

## เทคโนโลยีที่ใช้

- [React](https://react.dev/) 19
- [Vite](https://vitejs.dev/) สำหรับ dev server และ build
- [Vitest](https://vitest.dev/) สำหรับ unit test
- [oxlint](https://oxc.rs/docs/guide/usage/linter.html) สำหรับ lint

## เริ่มต้นใช้งาน

ติดตั้ง dependencies:

```bash
npm install
```

รัน dev server:

```bash
npm run dev
```

รันเทส:

```bash
npm run test
```

Build สำหรับ production:

```bash
npm run build
```

## โครงสร้างโปรเจกต์

```
src/
  components/   คอมโพเนนต์ UI (LoanForm, LoanList, LoanItem, SearchBox, ThemeToggle)
  lib/          logic และ utility (loanRules, dateFormat, storage, theme)
```

## เอกสารเพิ่มเติม

- [CONTEXT.md](./CONTEXT.md) — คำศัพท์และนิยามของโดเมน (domain terminology)
