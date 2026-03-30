import Link from "next/link";
import { notFound } from "next/navigation";
import { apiGetJson, apiGet } from "@/lib/api";
import PromotionUpsertForm from "../../_components/PromotionUpsertForm";
import { updatePromotionAction } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditPromotionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const promoId = Number(id);
  
  if (!Number.isFinite(promoId)) notFound();

  // 1. ดึงหมวดหมู่ (ดัก Error ไว้)
  let categories: any[] = [];
  try {
    categories = await apiGetJson<any[]>("/api/categories") || [];
  } catch (error) {
    console.warn("API /api/categories ยังไม่พร้อมใช้งาน");
  }

  // 2. ดึงข้อมูลโปรโมชั่นหลัก
  const promotionResponse = await apiGet(`/api/promotions/${promoId}`);
  if (promotionResponse.status === 404) notFound();
  if (!promotionResponse.ok) {
    throw new Error(`Failed to fetch promotion: ${promotionResponse.status}`);
  }
  
  const promotion = await promotionResponse.json();

  return (
    <div className="min-h-full bg-slate-50/50 flex flex-col">
      {/* --- Header & Navigation (Responsive) --- */}
      <div className="max-w-4xl mx-auto w-full px-4 pt-8 pb-6">
        <nav className="mb-4">
          <Link 
            href={`/promotions/${promoId}`} 
            className="group flex items-center text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors"
          >
            <span className="mr-2 transition-transform group-hover:-translate-x-1">←</span>
            ยกเลิกและกลับไปหน้ารายละเอียด
          </Link>
        </nav>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-yellow-400 text-white text-lg shadow-yellow-100 shadow-lg">
                ✏️
              </span>
              <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">
                แก้ไขข้อมูลโปรโมชั่น
              </h1>
            </div>
            <p className="text-slate-500 font-medium text-sm md:text-base">
              ปรับปรุงรายละเอียดแคมเปญและเงื่อนไขส่วนลดของคุณ
            </p>
          </div>

          <div className="hidden md:block">
            <span className="bg-blue-50 text-blue-600 border border-blue-100 px-4 py-2 rounded-full text-xs font-black shadow-sm">
              กำลังแก้ไขข้อมูล
            </span>
          </div>
        </div>
      </div>

      {/* --- Form Area (Responsive Container) --- */}
      <div className="flex-1 overflow-y-auto px-4 pb-12">
        <div className="max-w-4xl mx-auto">
          {/* เส้นแบ่งส่วนแบบจางๆ */}
          <div className="h-px w-full bg-slate-200 mb-8"></div>
          
          <div className="relative">
            {/* ตกแต่งแถบสีด้านข้างเฉพาะบน Desktop */}
            <div className="absolute -left-4 top-0 bottom-0 w-1 bg-yellow-400 rounded-full hidden md:block opacity-30"></div>
            
            <PromotionUpsertForm
              mode="edit"
              categories={categories}
              initial={promotion}
              // ใช้ .bind เพื่อส่ง ID ไปยัง Server Action
              action={updatePromotionAction.bind(null, promoId)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}