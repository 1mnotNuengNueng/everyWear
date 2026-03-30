import Link from "next/link";
import { apiGetJson } from "@/lib/api";
import PromotionUpsertForm from "../_components/PromotionUpsertForm";
import { createPromotionAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewPromotionPage() {
  // ดักจับ Error 404 ในกรณีที่ API หมวดหมู่ยังไม่ถูกสร้าง
  let categories: any[] = [];
  try {
    categories = await apiGetJson<any[]>("/api/categories") || [];
  } catch (error) {
    console.warn("API /api/categories ยังไม่พร้อมใช้งาน ให้ข้ามการดึงหมวดหมู่ไปก่อน");
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">สร้างโปรโมชั่นใหม่</h1>
          <p className="mt-1 text-sm text-gray-500">กรอกรายละเอียดโปรโมชั่นและเลือกหมวดหมู่ที่เข้าร่วม</p>
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
            mode="create"
            categories={categories}
            action={createPromotionAction}
          />
        </div>
      </div>
    </div>
  );
}