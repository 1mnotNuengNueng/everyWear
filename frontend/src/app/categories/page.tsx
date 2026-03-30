"use client";

import { useEffect, useMemo, useState } from "react";

type Category = {
  id: number;
  name: string;
  description?: string | null;
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const fetchCategories = async () => {
    const res = await fetch("http://localhost:8080/api/categories");
    const data = (await res.json()) as Category[];
    setCategories(data);
  };

  useEffect(() => {
    let ignore = false;

    const loadCategories = async () => {
      const res = await fetch("http://localhost:8080/api/categories");
      const data = (await res.json()) as Category[];
      if (!ignore) {
        setCategories(data);
      }
    };

    void loadCategories();

    return () => {
      ignore = true;
    };
  }, []);

  const filtered = useMemo(() => {
    return categories.filter((category) => {
      const keyword = search.trim().toLowerCase();
      if (!keyword) return true;

      return (
        category.name.toLowerCase().includes(keyword) ||
        String(category.id).includes(keyword) ||
        (category.description ?? "").toLowerCase().includes(keyword)
      );
    });
  }, [categories, search]);

  const handleSave = async () => {
    if (!name.trim()) {
      alert("กรุณาใส่ชื่อหมวดหมู่");
      return;
    }

    const payload = {
      name: name.trim(),
      description: description.trim(),
    };

    const res = editingId
      ? await fetch(`http://localhost:8080/api/categories/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      : await fetch("http://localhost:8080/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

    if (!res.ok) {
      const msg = await res.text();
      alert(msg);
      return;
    }

    resetForm();
    fetchCategories();
  };

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setName(category.name);
    setDescription(category.description ?? "");
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("ลบหมวดหมู่นี้ใช่ไหม?")) return;

    const res = await fetch(`http://localhost:8080/api/categories/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const msg = await res.text();
      alert(msg);
      return;
    }

    fetchCategories();
  };

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setDescription("");
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-slate-900 via-slate-800 to-sky-800 px-6 py-7 text-white shadow-xl">
        <div className="absolute -right-12 top-0 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute bottom-0 left-1/3 h-24 w-24 rounded-full bg-cyan-300/20 blur-2xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-black tracking-tight">
              การจัดการหมวดหมู่สินค้า
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-200">
              ดูรายการหมวดหมู่สินค้า เพิ่ม แก้ไข ลบและค้นหาหมวดหมู่สินค้า
            </p>
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="inline-flex min-w-[210px] items-center justify-center rounded-2xl border border-white/15 bg-white px-6 py-3.5 text-sm font-bold text-slate-900 shadow-lg shadow-slate-950/20 transition hover:-translate-y-0.5 hover:bg-slate-100"
          >
            + เพิ่มหมวดหมู่ใหม่
          </button>
        </div>

        <div className="relative mt-6">
          <div className="max-w-xs rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-200">
              หมวดหมู่สินค้าทั้งหมด
            </p>
            <p className="mt-2 text-3xl font-black">{categories.length}</p>
          </div>
        </div>
      </section>

      <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800">ค้นหาและจัดการข้อมูล</h2>
            <p className="mt-1 text-sm text-slate-500">
              ค้นหาจากชื่อหมวดหมู่ รหัส ID หรือคำอธิบาย
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                Search
              </span>
              <input
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-20 pr-4 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100 sm:w-80"
                placeholder="ชื่อ / ID / คำอธิบาย"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {showForm ? (
              <button
                onClick={resetForm}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                ปิดฟอร์ม
              </button>
            ) : null}
          </div>
        </div>

        {showForm ? (
          <div className="mt-5 rounded-[24px] border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-cyan-50 p-5">
            <div>
              <h3 className="text-lg font-bold text-slate-800">
                {editingId ? `แก้ไขหมวดหมู่ #${editingId}` : "เพิ่มหมวดหมู่ใหม่"}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                กรอกชื่อและคำอธิบายให้ชัดเจนเพื่อให้จัดการหมวดหมู่ได้ง่ายขึ้น
              </p>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-[1.1fr,1.4fr,auto] lg:items-end">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  ชื่อหมวดหมู่
                </span>
                <input
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                  placeholder="เช่น เสื้อผ้าผู้หญิง"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  คำอธิบาย
                </span>
                <input
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                  placeholder="อธิบายสั้น ๆ ว่าหมวดนี้ใช้กับสินค้าแบบไหน"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </label>

              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  className="rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-600"
                >
                  {editingId ? "อัปเดตข้อมูล" : "บันทึกหมวดหมู่"}
                </button>
                <button
                  onClick={resetForm}
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-white"
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </section>

      <section className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800">รายการหมวดหมู่สินค้า</h2>
            <p className="mt-1 text-sm text-slate-500">
              {filtered.length === categories.length
                ? `กำลังแสดงทั้งหมด ${categories.length} รายการ`
                : `พบ ${filtered.length} จากทั้งหมด ${categories.length} รายการ`}
            </p>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="rounded-full bg-slate-100 px-5 py-4 text-3xl">📂</div>
            <h3 className="mt-4 text-lg font-bold text-slate-800">
              ไม่พบหมวดหมู่ที่ค้นหา
            </h3>
            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              ลองค้นหาด้วยชื่ออื่น หรือกดปุ่มเพิ่มหมวดหมู่เพื่อสร้างรายการใหม่
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-fixed text-sm">
              <colgroup>
                <col className="w-24" />
                <col className="w-[28%]" />
                <col />
                <col className="w-44" />
              </colgroup>
              <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                <tr>
                  <th className="px-5 py-4">ID</th>
                  <th className="px-5 py-4">ชื่อหมวดหมู่</th>
                  <th className="px-5 py-4">คำอธิบาย</th>
                  <th className="px-5 py-4 text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((category) => (
                  <tr
                    key={category.id}
                    className="transition hover:bg-sky-50/60"
                  >
                    <td className="px-5 py-4 align-middle">
                      <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                        #{category.id}
                      </span>
                    </td>
                    <td className="px-5 py-4 align-middle">
                      <div className="font-semibold text-slate-800">
                        {category.name}
                      </div>
                    </td>
                    <td className="px-5 py-4 align-middle text-slate-600">
                      {category.description?.trim() || "-"}
                    </td>
                    <td className="px-5 py-4 align-middle">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(category)}
                          className="rounded-xl bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 transition hover:bg-blue-100"
                        >
                          แก้ไข
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-700 transition hover:bg-red-100"
                        >
                          ลบ
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
