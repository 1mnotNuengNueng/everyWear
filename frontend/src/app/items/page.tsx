"use client";

import { useEffect, useState } from "react";

export default function ItemsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const fetchItems = async () => {
    const res = await fetch("http://localhost:8080/api/items");
    const data = await res.json();
    setItems(data);
    setFiltered(data);
  };

  const fetchCategories = async () => {
    const res = await fetch("http://localhost:8080/api/categories");
    const data = await res.json();
    setCategories(data);
  };

  useEffect(() => {
    fetchItems();
    fetchCategories();
  }, []);

  useEffect(() => {
    let result = items;

    if (search) {
      result = result.filter((i) =>
        i.name.toLowerCase().includes(search.toLowerCase()) ||
        String(i.id).includes(search)
      );
    }

    if (filterCategory) {
      result = result.filter((i) => String(i.categoryId) === filterCategory);
    }

    setFiltered(result);
  }, [search, filterCategory, items]);

  const handleSave = async () => {
    if (!name || !price) return alert("กรอกข้อมูลให้ครบ");

    const body = {
      name,
      price: parseFloat(price),
      isActive: true,
      category: categoryId ? { id: Number(categoryId) } : null,
    };

    let res;

    if (editingId) {
      res = await fetch(`http://localhost:8080/api/items/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } else {
      res = await fetch("http://localhost:8080/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    }

    if (!res.ok) {
      const msg = await res.text();
      alert(msg);
      return;
    }

    resetForm();
    fetchItems();
  };

  const handleEdit = (i: any) => {
    setEditingId(i.id);
    setName(i.name);
    setPrice(i.price);
    setCategoryId(i.categoryId || "");
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("ลบสินค้า?")) return;

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
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">👕 สินค้า</h1>

        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          + เพิ่มสินค้า
        </button>
      </div>

      {/* SEARCH + FILTER */}
      <div className="flex gap-2">
        <input
          className="border p-2 rounded w-64"
          placeholder="ค้นหา (ชื่อ / ID)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border p-2 rounded"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="">ทุกหมวดหมู่</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* FORM */}
      {showForm && (
        <div className="bg-white p-4 rounded-xl shadow flex gap-2 flex-wrap">
          <input
            className="border p-2 rounded"
            placeholder="ชื่อ"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            className="border p-2 rounded"
            placeholder="ราคา"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />

          <select
            className="border p-2 rounded"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">เลือกหมวดหมู่</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <button
            onClick={handleSave}
            className="bg-green-500 text-white px-4 rounded"
          >
            {editingId ? "อัปเดต" : "บันทึก"}
          </button>

          <button onClick={resetForm}>ยกเลิก</button>
        </div>
      )}

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm table-fixed">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 w-20 text-left">ID</th>
              <th className="p-3 text-left">ชื่อ</th>
              <th className="p-3 w-32 text-left">ราคา</th>
              <th className="p-3 text-left">หมวดหมู่</th>
              <th className="p-3 w-40 text-center">จัดการ</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((i) => (
              <tr key={i.id} className="border-t">
                <td className="p-3">{i.id}</td>
                <td className="p-3">{i.name}</td>
                <td className="p-3">{i.price}</td>
                <td className="p-3">{i.categoryName || "-"}</td>
                <td className="p-3 text-center space-x-2">
                  <button onClick={() => handleEdit(i)} className="text-blue-500">
                    แก้ไข
                  </button>
                  <button onClick={() => handleDelete(i.id)} className="text-red-500">
                    ลบ
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}