"use client";

import { deletePromotionAction } from "../actions";

export default function DeletePromotionButton({ promoId }: { promoId: number }) {
  const handleDelete = async (e: React.ChangeEvent<any>) => {
    // ป้องกันการทำงานซ้ำซ้อน
    if (window.confirm("ยืนยันการลบโปรโมชั่นนี้? (คูปองที่เกี่ยวข้องจะถูกลบทั้งหมด)")) {
      await deletePromotionAction(promoId);
    }
  };

  return (
    /* ใช้ inline-block เพื่อให้ปุ่มไม่กระโดดไปบรรทัดใหม่ */
    <form action={() => {}} onSubmit={(e) => e.preventDefault()} className="inline-block">
      <button 
        type="button"
        onClick={handleDelete}
        /* ใช้ h-10 และ px-4 ให้เท่ากับปุ่ม แก้ไข และ กลับหน้ารวม */
        className="h-10 inline-flex items-center justify-center rounded-lg bg-red-50 px-4 text-sm font-bold text-red-600 hover:bg-red-100 border border-red-100 transition-all active:scale-95"
      >
        🗑️ ลบโปรโมชั่น
      </button>
    </form>
  );
}