"use client";

import { useState, useMemo } from "react";

type Category = { id: number; name: string };
type Promotion = {
  id?: number;
  name: string;
  description: string;
  discountValue: number | string;
  startAt: string;
  endAt: string;
  isActive: boolean;
  categoryIds: number[];
};

export default function PromotionUpsertForm(props: {
  mode: "create" | "edit";
  categories: Category[];
  initial?: Promotion;
  action: (formData: FormData) => void;
}) {
  const [formData, setFormData] = useState<Promotion>({
    name: props.initial?.name ?? "",
    description: props.initial?.description ?? "",
    discountValue: props.initial?.discountValue ?? "",
    startAt: props.initial?.startAt
      ? props.initial.startAt.substring(0, 16)
      : "",
    endAt: props.initial?.endAt ? props.initial.endAt.substring(0, 16) : "",
    isActive: props.initial?.isActive ?? true,
    categoryIds: props.initial?.categoryIds ?? [],
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setFormData({
        ...formData,
        [name]: (e.target as HTMLInputElement).checked,
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleCategoryToggle = (categoryId: number) => {
    setFormData((prev) => {
      const isSelected = prev.categoryIds.includes(categoryId);
      if (isSelected) {
        return {
          ...prev,
          categoryIds: prev.categoryIds.filter((id) => id !== categoryId),
        };
      } else {
        return { ...prev, categoryIds: [...prev.categoryIds, categoryId] };
      }
    });
  };

  const formatDateTimeForAPI = (dateTimeStr: string) => {
    if (!dateTimeStr) return null;
    return dateTimeStr.replace("T", " ") + ":00";
  };

  const payloadJson = useMemo(() => {
    return JSON.stringify({
      name: formData.name,
      description: formData.description,
      discountValue: Number(formData.discountValue),
      discountType: "PERCENT",
      startAt: formatDateTimeForAPI(formData.startAt),
      endAt: formatDateTimeForAPI(formData.endAt),
      isActive: formData.isActive,
      categoryIds: formData.categoryIds,
    });
  }, [formData]);

  const isValid =
    formData.name.trim() !== "" &&
    formData.discountValue !== "" &&
    Number(formData.discountValue) >= 0 &&
    Number(formData.discountValue) <= 100 &&
    formData.startAt !== "" &&
    formData.endAt !== "";

  return (
    /* เพิ่ม w-full และ max-w-3xl เพื่อไม่ให้ฟอร์มแผ่กว้างจนหลุดสายตา */
    <div className="w-full max-w-3xl mx-auto pb-10">
      <form action={props.action} className="grid gap-6">
        <input type="hidden" name="payload" value={payloadJson} />

        <div className="grid gap-5 rounded-xl border border-gray-200 bg-white p-5 md:p-8 shadow-sm">
          {/* ชื่อโปรโมชั่น */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1.5">
              ชื่อโปรโมชั่น *
            </label>
            <input
              required
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              placeholder="เช่น โปรโมชั่น Summer Sale"
            />
          </div>

          {/* รายละเอียด */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1.5">
              รายละเอียดโปรโมชั่น
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-gray-300 bg-white p-4 text-sm text-gray-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              rows={3}
              placeholder="ระบุเงื่อนไขหรือรายละเอียดเพิ่มเติม..."
            ></textarea>
          </div>

          {/* ส่วนลด - เพิ่ม mb-6 เพื่อถีบระยะห่างด้านล่างออกไป */}
          <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 mb-4 shadow-sm">
            <label className="block text-sm font-bold text-blue-900 mb-3">
              ส่วนลดประจำโปรโมชั่น (%) *
            </label>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="relative w-full sm:w-32">
                <input
                  required
                  type="number"
                  min="0"
                  max="100"
                  name="discountValue"
                  value={formData.discountValue}
                  onChange={handleInputChange}
                  className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm font-bold text-gray-800 outline-none focus:border-blue-500 pr-10 shadow-sm"
                  placeholder="0-100"
                />  
              </div>
              <span className="text-xs text-blue-700 leading-relaxed bg-white/50 p-2 rounded-md border border-blue-100/50 flex-1">
                💡 ส่วนลดจะถูกคำนวณจากราคาสินค้าในหมวดหมู่ที่เลือกเท่านั้น
              </span>
            </div>
          </div>

          {/* วันที่ - เพิ่ม mt-2 เพื่อช่วยเว้นระยะห่างจากก้อนบนอีกนิด */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-2">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">
                วันที่เริ่มใช้งาน *
              </label>
              <input
                required
                type="datetime-local"
                name="startAt"
                value={formData.startAt}
                onChange={handleInputChange}
                className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm text-gray-800 outline-none focus:border-blue-500 transition-all shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">
                สิ้นสุดการใช้งาน *
              </label>
              <input
                required
                type="datetime-local"
                name="endAt"
                value={formData.endAt}
                onChange={handleInputChange}
                className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm text-gray-800 outline-none focus:border-blue-500 transition-all shadow-sm"
              />
            </div>
          </div>
          {/* เลือกหมวดหมู่ */}
          <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
            <label className="block text-sm font-bold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">📁</span> เลือกหมวดหมู่สินค้าที่ร่วมรายการ
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-56 overflow-y-auto pr-2 custom-scrollbar">
              {props.categories.map((cat) => (
                <label
                  key={cat.id}
                  className="flex items-center p-3 rounded-lg border border-white bg-white shadow-sm cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-all group"
                >
                  <input
                    type="checkbox"
                    checked={formData.categoryIds.includes(cat.id)}
                    onChange={() => handleCategoryToggle(cat.id)}
                    className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="ml-3 text-sm font-medium text-gray-700 group-hover:text-blue-700 truncate">
                    {cat.name}
                  </span>
                </label>
              ))}
            </div>
            {props.categories.length === 0 && (
              <div className="text-center py-4 text-amber-600 text-xs bg-amber-50 rounded-lg border border-amber-100 mt-2">
                ⚠️ ยังไม่มีหมวดหมู่สินค้าในระบบ (ตรวจสอบ API)
              </div>
            )}
          </div>

          {/* สถานะการใช้งาน */}
          <div className="flex items-center p-1">
            <div className="flex items-center h-5">
              <input
                id="isActive"
                name="isActive"
                type="checkbox"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
              />
            </div>
            <label
              htmlFor="isActive"
              className="ml-3 text-sm font-bold text-gray-800 cursor-pointer select-none"
            >
              เปิดใช้งานโปรโมชั่นนี้ทันที
            </label>
          </div>
        </div>

        {/* ปุ่มบันทึก */}
        <div className="sticky bottom-0 bg-[#f4f6f8] pt-2 pb-4 sm:static sm:bg-transparent sm:p-0">
          <button
            type="submit"
            disabled={!isValid}
            className="h-15 w-full rounded-xl shadow-lg bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 transition-all disabled:bg-gray-400 disabled:shadow-none disabled:cursor-not-allowed active:scale-[0.97]"
          >
            {props.mode === "create"
              ? "✔️ ยืนยันสร้างโปรโมชั่น"
              : "💾 บันทึกการเปลี่ยนแปลง"}
          </button>
        </div>
      </form>
    </div>
  );
}
