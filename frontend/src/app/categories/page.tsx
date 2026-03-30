"use client";

import { useEffect, useState } from "react";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const fetchCategories = async () => {
    const res = await fetch("http://localhost:8080/api/categories");
    const data = await res.json();
    setCategories(data);
    setFiltered(data);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const result = categories.filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      String(c.id).includes(search)
    );
    setFiltered(result);
  }, [search, categories]);

  const handleSave = async () => {
    if (!name) return alert("กรุณาใส่ชื่อ");

    let res;

    if (editingId) {
      res = await fetch(`http://localhost:8080/api/categories/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });
    } else {
      res = await fetch("http://localhost:8080/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });
    }

    if (!res.ok) {
      const msg = await res.text();
      alert(msg);
      return;
    }

    resetForm();
    fetchCategories();
  };

  const handleEdit = (c: any) => {
    setEditingId(c.id);
    setName(c.name);
    setDescription(c.description || "");
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("ลบหมวดหมู่นี้?")) return;

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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">📂 หมวดหมู่สินค้า</h1>

        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          + เพิ่ม
        </button>
      </div>

      <input
        className="border p-2 rounded w-64"
        placeholder="ค้นหา (ชื่อ / ID)"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {showForm && (
        <div className="bg-white p-4 rounded-xl shadow flex gap-2">
          <input
            className="border p-2 rounded flex-1"
            placeholder="ชื่อ"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="border p-2 rounded flex-1"
            placeholder="รายละเอียด"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <button
            onClick={handleSave}
            className="bg-green-500 text-white px-4 rounded"
          >
            {editingId ? "อัปเดต" : "บันทึก"}
          </button>
          <button onClick={resetForm}>ยกเลิก</button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm table-fixed">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 w-20 text-left">ID</th>
              <th className="p-3 text-left">ชื่อ</th>
              <th className="p-3 text-left">รายละเอียด</th>
              <th className="p-3 w-40 text-center">จัดการ</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="p-3">{c.id}</td>
                <td className="p-3">{c.name}</td>
                <td className="p-3 truncate">{c.description}</td>
                <td className="p-3 text-center space-x-2">
                  <button onClick={() => handleEdit(c)} className="text-blue-500">
                    แก้ไข
                  </button>
                  <button onClick={() => handleDelete(c.id)} className="text-red-500">
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