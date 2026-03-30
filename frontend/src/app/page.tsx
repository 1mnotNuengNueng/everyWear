import Link from "next/link";

export default function Home() {
  const menuItems = [
    { path: "/orders", label: "จัดการออเดอร์", icon: "📝", color: "hover:border-emerald-500 hover:text-emerald-600" },
    { path: "/promotions", label: "จัดการโปรโมชั่น", icon: "🏷️", color: "hover:border-blue-500 hover:text-blue-600" },
    { path: "/coupons", label: "จัดการคูปอง", icon: "🎟️", color: "hover:border-orange-500 hover:text-orange-600" },
    { path: "/items", label: "จัดการสินค้า", icon: "👕", color: "hover:border-purple-500 hover:text-purple-600" },
    { path: "/categories", label: "จัดการหมวดหมู่สินค้า", icon: "📂", color: "hover:border-cyan-500 hover:text-cyan-600" },
    { path: "/stock", label: "จัดการสต็อก", icon: "📦", color: "hover:border-amber-500 hover:text-amber-600" },
  ];

  return (
    <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-[2rem] bg-slate-50/50 p-8">
      {/* Icon & Title */}
      <div className="text-7xl mb-6 drop-shadow-sm">🏪</div>
      <h2 className="text-3xl font-black text-slate-800 tracking-tight">
        ยินดีต้อนรับสู่ everyWear POS
      </h2>
      <p className="text-slate-500 mt-2 font-medium">
        ระบบจัดการหลังบ้านครบวงจรสำหรับร้านค้าคุณ
      </p>

      {/* Grid ของปุ่มเมนูทางลัด */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-10 w-full max-w-4xl">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`group flex items-center gap-4 px-6 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md ${item.color}`}
          >
            <span className="text-2xl group-hover:scale-125 transition-transform duration-200">
              {item.icon}
            </span>
            <span className="text-lg">{item.label}</span>
          </Link>
        ))}
      </div>

      {/* Footer เล็กๆ */}
      <p className="text-slate-400 text-xs mt-12">
        everyWear POS System v1.0
      </p>
    </div>
  );
}