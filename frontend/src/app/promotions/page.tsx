import Link from "next/link";
import { apiGetJson } from "@/lib/api";
import DeletePromotionButton from "./_components/DeletePromotionButton"; 

export const dynamic = "force-dynamic";

export default async function PromotionsPage() {
  const promotions = await apiGetJson<any[]>("/api/promotions") || [];

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">จัดการโปรโมชั่น</h1>
          <p className="mt-1 text-sm text-gray-500">สร้างส่วนลด และผูกโปรโมชั่นกับหมวดหมู่สินค้า</p>
        </div>
        <Link
          href="/promotions/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow transition font-medium inline-flex items-center"
        >
          <span className="mr-2 text-lg">+</span> สร้างโปรโมชั่นใหม่
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto pb-6">
        {promotions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400 bg-white rounded-xl border border-gray-200">
            <span className="text-4xl mb-2">🏷️</span>
            <p>ยังไม่มีโปรโมชั่นในระบบ</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {promotions.map((promo) => (
              <div key={promo.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition relative flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <Link href={`/promotions/${promo.id}`} className="font-bold text-lg text-gray-800 hover:text-blue-600 transition">
                    {promo.name}
                  </Link>
                  <span className={`px-2 py-1 text-xs font-bold rounded-full border ${promo.isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                    {promo.isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                  </span>
                </div>
                
                <p className="text-sm text-gray-500 line-clamp-2 mb-4 h-10">{promo.description || "-"}</p>
                
                <div className="mb-4">
                  {/* เพิ่มเครื่องหมาย % ต่อท้ายตรงนี้ครับ */}
                  <p className="text-2xl font-black text-blue-600">ลด {promo.discountValue}%</p>
                  
                  <p className="text-xs text-gray-400 mt-1">เริ่ม: {promo.startAt ? promo.startAt.substring(0, 16) : "-"}</p>
                  <p className="text-xs text-gray-400">หมดเขต: {promo.endAt ? promo.endAt.substring(0, 16) : "-"}</p>
                </div>

                {/* ส่วนปุ่มด้านล่าง - ปรับให้ h-9 และ px-4 เท่ากันทั้งหมด */}
                <div className="mt-auto pt-4 border-t border-slate-100 flex justify-end gap-2">
                  <Link 
                    href={`/promotions/${promo.id}`} 
                    className="h-9 px-4 inline-flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 text-sm font-bold hover:bg-blue-100 transition-all active:scale-95 shadow-sm"
                  >
                    รายละเอียด
                  </Link>
                  <Link 
                    href={`/promotions/${promo.id}/edit`} 
                    className="h-9 px-4 inline-flex items-center justify-center rounded-lg bg-yellow-50 text-yellow-700 text-sm font-bold hover:bg-yellow-100 border border-yellow-100 transition-all active:scale-95 shadow-sm"
                  >
                    แก้ไข
                  </Link>
                  {/* ปุ่มลบเรียกจาก Component */}
                  <DeletePromotionButton promoId={promo.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}