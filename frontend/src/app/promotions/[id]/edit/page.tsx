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

  // 1. ดึงหมวดหมู่ (ดัก Error ไว้ ถ้า 404 ก็จะได้ Array ว่างๆ กลับมาแทน)
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
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">✏️ แก้ไขโปรโมชั่น #{promotion.id}</h1>
          <p className="mt-1 text-sm text-gray-500">แก้ไขรายละเอียดแล้วกดบันทึก</p>
        </div>
        <Link
          href="/promotions"
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded shadow-sm transition font-medium"
        >
          กลับหน้ารวม
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto pb-6">
        <div className="max-w-3xl mx-auto">
          <PromotionUpsertForm
            mode="edit"
            categories={categories}
            initial={promotion}
            action={updatePromotionAction.bind(null, promoId)}
          />
        </div>
      </div>
    </div>
  );
}