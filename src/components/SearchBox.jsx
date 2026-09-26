// ช่องค้นหาตามชื่อเพื่อน (controlled: ค่าและการกรองอยู่ที่ผู้เรียก)
export default function SearchBox({ value, onChange }) {
  return (
    <label className="search">
      <span className="visually-hidden">ค้นหาตามชื่อเพื่อน</span>
      <span className="search-icon" aria-hidden="true">🔍</span>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="ค้นหาตามชื่อเพื่อน"
      />
    </label>
  )
}
