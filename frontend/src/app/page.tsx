import Link from "next/link";

export default function Home() {
  return (
    <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-[2rem] bg-slate-50/50 p-8">
      <div className="text-6xl mb-6">🏪</div>
      <h2 className="text-3xl font-black text-slate-800 tracking-tight">ยินดีต้อนรับสู่ everyWear POS</h2>
      <p className="text-slate-500 mt-2 font-medium">ระบบจัดการร้านค้าและโปรโมชั่น</p>

      {/* เพิ่มปุ่มเมนูทางลัด */}
      <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
        <Link 
          href="/promotions"
          className="px-6 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 hover:border-blue-500 hover:text-blue-600 shadow-sm transition-all hover:-translate-y-1"
        >
          🏷️ จัดการโปรโมชั่น
        </Link>
        <Link 
          href="/coupons"
          className="px-6 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 hover:border-orange-500 hover:text-orange-600 shadow-sm transition-all hover:-translate-y-1"
        >
          🎟️ จัดการคูปอง
        </Link>
        <Link 
          href="/orders"
          className="px-6 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 hover:border-green-500 hover:text-green-600 shadow-sm transition-all hover:-translate-y-1"
        >
          📦 ดูรายการสั่งซื้อ
        </Link>
      </div>
    </div>
  );
}