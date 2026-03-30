"use client";

import { useRouter } from "next/navigation"; // นำเข้า useRouter
import { deletePromotionAction } from "../actions";

export default function DeletePromotionButton({ promoId }: { promoId: number }) {
  const router = useRouter(); // สร้าง instance ของ router

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (window.confirm("ยืนยันการลบโปรโมชั่นนี้? (คูปองที่เกี่ยวข้องจะถูกลบทั้งหมด)")) {
      try {
        await deletePromotionAction(promoId); // 1. ลบข้อมูลที่หลังบ้าน
        
        // 2. เมื่อลบสำเร็จ ให้สั่งย้ายหน้ากลับไปที่หน้ารวมโปรโมชั่นทันที
        router.push("/promotions"); //
        
        // 3. (Optional) บังคับให้ Refresh ข้อมูลใหม่เพื่อให้รายการที่ลบหายไปจริงๆ
        router.refresh(); //
      } catch (error) {
        alert("ไม่สามารถลบได้: " + error);
      }
    }
  };

  return (
    <form onSubmit={handleDelete} className="inline-block">
      <button 
        type="submit" 
        className="h-10 inline-flex items-center justify-center rounded-lg bg-red-50 px-4 text-sm font-bold text-red-600 hover:bg-red-100 border border-red-100 transition-all active:scale-95 shadow-sm"
      >
        🗑️ ลบโปรโมชั่น
      </button>
    </form>
  );
}