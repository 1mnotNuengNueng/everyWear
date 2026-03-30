"use client";

import { useEffect, useMemo, useState } from "react";

type Category = {
  id: number;
  name: string;
};

type Item = {
  id: number;
  name: string;
  price: number | string;
  categoryId?: number | null;
  categoryName?: string | null;
};

function formatMoney(value: number | string) {
  const amount = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(amount)) return String(value);

  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 2,
  }).format(amount);
}

export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const fetchItems = async () => {
    const res = await fetch("http://localhost:8080/api/items");
    const data = (await res.json()) as Item[];
    setItems(data);
  };

  useEffect(() => {
    let ignore = false;

    const loadInitialData = async () => {
      const [itemsRes, categoriesRes] = await Promise.all([
        fetch("http://localhost:8080/api/items"),
        fetch("http://localhost:8080/api/categories"),
      ]);

      const [itemsData, categoriesData] = (await Promise.all([
        itemsRes.json(),
        categoriesRes.json(),
      ])) as [Item[], Category[]];

      if (!ignore) {
        setItems(itemsData);
        setCategories(categoriesData);
      }
    };

    void loadInitialData();

    return () => {
      ignore = true;
    };
  }, []);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const keyword = search.trim().toLowerCase();
      const matchSearch =
        !keyword ||
        item.name.toLowerCase().includes(keyword) ||
        String(item.id).includes(keyword) ||
        (item.categoryName ?? "").toLowerCase().includes(keyword);

      const matchCategory =
        !filterCategory || String(item.categoryId ?? "") === filterCategory;

      return matchSearch && matchCategory;
    });
  }, [filterCategory, items, search]);

  const handleSave = async () => {
    if (!name.trim() || !price.trim()) {
      alert("กรอกชื่อสินค้าและราคาให้ครบ");
      return;
    }

    const numericPrice = Number(price);
    if (Number.isNaN(numericPrice) || numericPrice < 0) {
      alert("กรุณาใส่ราคาให้ถูกต้อง");
      return;
    }

    const body = {
      name: name.trim(),
      price: numericPrice,
      isActive: true,
      category: categoryId ? { id: Number(categoryId) } : null,
    };

    const res = editingId
      ? await fetch(`http://localhost:8080/api/items/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
      : await fetch("http://localhost:8080/api/items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

    if (!res.ok) {
      const msg = await res.text();
      alert(msg);
      return;
    }

    resetForm();
    fetchItems();
  };

  const handleEdit = (item: Item) => {
    setEditingId(item.id);
    setName(item.name);
    setPrice(String(item.price));
    setCategoryId(item.categoryId ? String(item.categoryId) : "");
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("ลบสินค้านี้ใช่ไหม?")) return;

    const res = await fetch(`http://localhost:8080/api/items/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const msg = await res.text();
      alert(msg);
      return;
    }

    fetchItems();
  };

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setPrice("");
    setCategoryId("");
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#1f2937] via-[#0f4c81] to-[#059669] px-6 py-7 text-white shadow-xl">
        <div className="absolute right-0 top-0 h-40 w-40 translate-x-1/4 -translate-y-1/4 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-40 w-40 -translate-x-1/4 translate-y-1/4 rounded-full bg-emerald-300/20 blur-3xl" />

        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-black tracking-tight">
              การจัดการรายการสินค้า
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-100">
              ดูสินค้า ค้นหา แยกตามหมวดหมู่ และเพิ่มข้อมูลใหม่ แก้ไข และลบรายการสินค้า
            </p>
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="inline-flex min-w-[180px] items-center justify-center rounded-2xl border border-white/20 bg-white px-6 py-3.5 text-sm font-bold text-slate-900 shadow-lg shadow-slate-950/20 transition hover:-translate-y-0.5 hover:bg-slate-100"
          >
            + เพิ่มสินค้า
          </button>
        </div>

        <div className="relative mt-6">
          <div className="max-w-xs rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-100">
              สินค้าทั้งหมด
            </p>
            <p className="mt-2 text-3xl font-black">{items.length}</p>
          </div>
        </div>
      </section>

      <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800">ค้นหาและคัดกรองสินค้า</h2>
            <p className="mt-1 text-sm text-slate-500">
              ค้นหาด้วยชื่อสินค้า ID หรือชื่อหมวดหมู่ แล้วกรองเฉพาะหมวดที่ต้องการ
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr),220px,auto]">
            <input
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100 md:min-w-[320px]"
              placeholder="ค้นหาชื่อสินค้า / ID / หมวดหมู่"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="">ทุกหมวดหมู่</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            {showForm ? (
              <button
                onClick={resetForm}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                ปิดฟอร์ม
              </button>
            ) : (
              <div />
            )}
          </div>
        </div>

        {showForm ? (
          <div className="mt-5 rounded-[24px] border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-sky-50 p-5">
            <div>
              <h3 className="text-lg font-bold text-slate-800">
                {editingId ? `แก้ไขสินค้า #${editingId}` : "เพิ่มสินค้าใหม่"}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                กรอกข้อมูลสินค้าให้ครบเพื่อให้จัดการรายการสินค้าได้ง่ายขึ้น
              </p>
            </div>

            <div className="mt-5 grid gap-4 xl:grid-cols-[1.1fr,0.8fr,1fr,auto] xl:items-end">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  ชื่อสินค้า
                </span>
                <input
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                  placeholder="เช่น เดรสผ้าลินิน"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  ราคา
                </span>
                <input
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                  placeholder="0.00"
                  inputMode="decimal"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  หมวดหมู่
                </span>
                <select
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                >
                  <option value="">ไม่ระบุหมวดหมู่</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>

              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  className="rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-600"
                >
                  {editingId ? "อัปเดตสินค้า" : "บันทึกสินค้า"}
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
            <h2 className="text-lg font-bold text-slate-800">รายการสินค้า</h2>
            <p className="mt-1 text-sm text-slate-500">
              {filtered.length === items.length
                ? `กำลังแสดงสินค้าทั้งหมด ${items.length} รายการ`
                : `พบ ${filtered.length} จากทั้งหมด ${items.length} รายการ`}
            </p>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="rounded-full bg-slate-100 px-5 py-4 text-3xl">👕</div>
            <h3 className="mt-4 text-lg font-bold text-slate-800">
              ยังไม่พบสินค้าที่ต้องการ
            </h3>
            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              ลองเปลี่ยนคำค้นหา หรือเลือกหมวดหมู่อื่นเพื่อดูสินค้าเพิ่มเติม
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-fixed text-sm">
              <colgroup>
                <col className="w-24" />
                <col className="w-[30%]" />
                <col className="w-36" />
                <col className="w-[24%]" />
                <col className="w-44" />
              </colgroup>
              <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                <tr>
                  <th className="px-5 py-4">ID</th>
                  <th className="px-5 py-4">สินค้า</th>
                  <th className="px-5 py-4">ราคา</th>
                  <th className="px-5 py-4">หมวดหมู่</th>
                  <th className="px-5 py-4 text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item) => (
                  <tr key={item.id} className="transition hover:bg-emerald-50/50">
                    <td className="px-5 py-4 align-middle">
                      <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                        #{item.id}
                      </span>
                    </td>
                    <td className="px-5 py-4 align-middle">
                      <div className="font-semibold text-slate-800">{item.name}</div>
                    </td>
                    <td className="px-5 py-4 align-middle font-bold text-slate-800">
                      {formatMoney(item.price)}
                    </td>
                    <td className="px-5 py-4 align-middle">
                      <span className="inline-flex rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                        {item.categoryName || "ไม่ระบุ"}
                      </span>
                    </td>
                    <td className="px-5 py-4 align-middle">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="rounded-xl bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 transition hover:bg-blue-100"
                        >
                          แก้ไข
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
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
