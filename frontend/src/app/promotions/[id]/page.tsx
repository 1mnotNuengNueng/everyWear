import Link from "next/link";
import { notFound } from "next/navigation";
import { apiGetJson, apiGet } from "@/lib/api";
import DeletePromotionButton from "../_components/DeletePromotionButton";

export const dynamic = "force-dynamic";

function formatDateTime(value: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default async function PromotionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const promoId = Number(id);
  if (!Number.isFinite(promoId)) notFound();

  // 1. ดึงข้อมูลโปรโมชั่นหลัก
  const promoRes = await apiGet(`/api/promotions/${promoId}`);
  if (promoRes.status === 404) notFound();
  if (!promoRes.ok) throw new Error("Failed to fetch promotion");
  const promotion = await promoRes.json();

  // 2. ดึงหมวดหมู่ทั้งหมด เพื่อเอาชื่อมาโชว์ (เทียบกับ categoryIds ที่ได้มา)
  let allCategories: any[] = [];
  try {
    allCategories = await apiGetJson<any[]>("/api/categories") || [];
  } catch (error) {
    console.warn("API Categories not ready");
  }
  
  // กรองเอาเฉพาะหมวดหมู่ที่เข้าร่วมโปรโมชั่นนี้
  const linkedCategories = allCategories.filter((cat) => 
    promotion.categoryIds?.includes(cat.id)
  );

  // 3. ดึงรายการคูปองที่อยู่ในโปรโมชั่นนี้
  let coupons: any[] = [];
  try {
    coupons = await apiGetJson<any[]>(`/api/coupons/promotions/${promoId}`) || [];
  } catch (error) {
    console.warn("API Coupons by Promotion not ready or 404");
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-800">
              🏷️ รายละเอียดโปรโมชั่น
            </h1>
            <span className={`px-3 py-1 text-xs font-bold rounded-full border ${promotion.isActive ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
              {promotion.isActive ? 'กำลังเปิดใช้งาน' : 'ปิดใช้งานชั่วคราว'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/promotions"
            className="h-10 inline-flex items-center justify-center rounded bg-gray-200 px-4 text-sm font-medium text-gray-700 hover:bg-gray-300 transition"
          >
            กลับหน้ารวม
          </Link>
          <Link
            href={`/promotions/${promoId}/edit`}
            className="h-10 inline-flex items-center justify-center rounded bg-yellow-100 px-4 text-sm font-medium text-yellow-700 hover:bg-yellow-200 transition"
          >
            ✏️ แก้ไขโปรโมชั่น
          </Link>
          <DeletePromotionButton promoId={promoId} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-6 space-y-6">
        
        {/* 1. ข้อมูลทั่วไปของโปรโมชั่น */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-3 mb-4">ข้อมูลทั่วไป</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">ชื่อโปรโมชั่น</p>
              <p className="font-bold text-gray-800 text-lg">{promotion.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">ส่วนลด</p>
              {/* เพิ่มเครื่องหมาย % หลังเลขส่วนลด */}
              <p className="font-black text-blue-600 text-xl">{promotion.discountValue}%</p>
            </div>
            <div className="col-span-1 md:col-span-2">
              <p className="text-sm text-gray-500 mb-1">รายละเอียด / เงื่อนไข</p>
              <p className="text-gray-700 bg-gray-50 p-3 rounded border border-gray-100">
                {promotion.description || "ไม่มีรายละเอียดระบุไว้"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">วันเริ่มโปรโมชั่น</p>
              <p className="font-medium text-gray-800">{formatDateTime(promotion.startAt)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">วันสิ้นสุดโปรโมชั่น</p>
              <p className="font-medium text-gray-800">{formatDateTime(promotion.endAt)}</p>
            </div>
          </div>
        </div>

        {/* 2. หมวดหมู่สินค้าที่เข้าร่วม */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-3 mb-4">
            📁 หมวดหมู่สินค้าที่เข้าร่วม ({linkedCategories.length})
          </h2>
          {linkedCategories.length === 0 ? (
            <p className="text-gray-400 text-sm">ไม่ได้ระบุหมวดหมู่ที่เข้าร่วมโปรโมชั่นนี้</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {linkedCategories.map(cat => (
                <span key={cat.id} className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded text-sm font-medium">
                  {cat.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 3. รายการคูปองภายใต้โปรโมชั่นนี้ */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50">
            <h2 className="text-lg font-bold text-gray-800">
              🎟️ คูปองที่เกี่ยวข้อง ({coupons.length})
            </h2>
            <p className="text-sm text-gray-500 mt-1">คูปองทั้งหมดที่ถูกสร้างขึ้นภายใต้โปรโมชั่นนี้</p>
          </div>
          
          {coupons.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">
              <span className="text-3xl block mb-2">🎫</span>
              ยังไม่มีการสร้างคูปองสำหรับโปรโมชั่นนี้
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-100 text-gray-500 uppercase font-bold text-xs">
                  <tr>
                    <th className="px-6 py-3">รหัสคูปอง (Code)</th>
                    <th className="px-6 py-3 text-right">ส่วนลด</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {coupons.map((coupon) => (
                    <tr key={coupon.id} className="hover:bg-blue-50 transition">
                      <td className="px-6 py-4 font-bold text-gray-800">{coupon.code}</td>
                      {/* เพิ่มเครื่องหมาย % หลังเลขส่วนลดในตารางคูปอง */}
                      <td className="px-6 py-4 text-right font-black text-blue-600">{coupon.discountValue}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}