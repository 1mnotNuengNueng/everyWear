"use client";

import { useState } from "react";
import { apiUrl } from "@/lib/api";
import type { StockItem, Item } from "../page";

const SIZES = ["s", "m", "l", "xl"];

function formatDateTime(value: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function StatusBadge({ quantity }: { quantity: number }) {
  if (quantity === 0)
    return (
      <span className="inline-flex rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-700">
        หมด
      </span>
    );
  if (quantity <= 15)
    return (
      <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
        ใกล้หมด
      </span>
    );
  return (
    <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
      ปกติ
    </span>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-semibold text-zinc-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function StockClient({
  initialStocks,
  items,
}: {
  initialStocks: StockItem[];
  items: Item[];
}) {
  const [stocks, setStocks] = useState<StockItem[]>(initialStocks);
  const [search, setSearch] = useState("");
  const [filterSize, setFilterSize] = useState("all");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<StockItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StockItem | null>(null);

  const [form, setForm] = useState({ itemId: "", size: "s", quantity: 0 });

  const notify = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const reload = async () => {
    const res = await fetch(apiUrl("/api/stock"), { cache: "no-store" });
    if (res.ok) setStocks(await res.json());
  };

  const filtered = stocks.filter((s) => {
    const matchSearch = s.itemName?.toLowerCase().includes(search.toLowerCase());
    const matchSize = filterSize === "all" || s.size === filterSize;
    return matchSearch && matchSize;
  });

  const totalQty = stocks.reduce((a, s) => a + s.quantity, 0);
  const lowCount = stocks.filter((s) => s.quantity > 0 && s.quantity <= 15).length;
  const outCount = stocks.filter((s) => s.quantity === 0).length;

  const handleAdd = async () => {
    if (!form.itemId) { notify("กรุณาเลือกสินค้า", false); return; }
    setBusy(true);
    try {
      const res = await fetch(apiUrl("/api/stock"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: Number(form.itemId),
          size: form.size,
          quantity: form.quantity,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      await reload();
      setAddOpen(false);
      setForm({ itemId: "", size: "s", quantity: 0 });
      notify("เพิ่ม stock สำเร็จ");
    } catch (e: unknown) {
      notify(e instanceof Error ? e.message : "เกิดข้อผิดพลาด", false);
    } finally {
      setBusy(false);
    }
  };

  const handleEdit = async () => {
    if (!editTarget) return;
    setBusy(true);
    try {
      const res = await fetch(apiUrl(`/api/stock/${editTarget.id}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quantity: form.quantity,
          size: editTarget.size,
          itemId: editTarget.itemId,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      await reload();
      setEditTarget(null);
      notify("แก้ไข stock สำเร็จ");
    } catch (e: unknown) {
      notify(e instanceof Error ? e.message : "เกิดข้อผิดพลาด", false);
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setBusy(true);
    try {
      const res = await fetch(apiUrl(`/api/stock/${deleteTarget.id}`), {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(await res.text());
      await reload();
      setDeleteTarget(null);
      notify("ลบ stock สำเร็จ");
    } catch (e: unknown) {
      notify(e instanceof Error ? e.message : "เกิดข้อผิดพลาด", false);
    } finally {
      setBusy(false);
    }
  };

  const openEdit = (s: StockItem) => {
    setEditTarget(s);
    setForm({ itemId: String(s.itemId), size: s.size, quantity: s.quantity });
  };

  return (
    <div className="flex flex-col flex-1 bg-white font-sans">
      <main className="w-full max-w-5xl flex-1 mx-auto px-6 py-10">

        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
              จัดการ Stock
            </h1>
            <p className="mt-1 text-sm text-zinc-600">
              เพิ่ม แก้ไข และลบข้อมูลสินค้าคงคลัง
            </p>
          </div>
          <button
            onClick={() => { setForm({ itemId: "", size: "s", quantity: 0 }); setAddOpen(true); }}
            className="h-10 inline-flex items-center justify-center rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-700"
          >
            + เพิ่ม Stock
          </button>
        </div>

        <div className="mt-6 grid grid-cols-4 gap-3">
          {[
            { label: "รายการทั้งหมด", value: stocks.length, color: "" },
            { label: "จำนวนรวม", value: totalQty.toLocaleString(), color: "text-emerald-600" },
            { label: "ใกล้หมด (≤15)", value: lowCount, color: "text-amber-600" },
            { label: "หมดสต็อก", value: outCount, color: "text-red-600" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-zinc-200 bg-white px-5 py-4 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">{s.label}</p>
              <p className={`mt-1 text-2xl font-bold text-zinc-900 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาสินค้า..."
            className="flex-1 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-900 placeholder-zinc-400 shadow-sm outline-none focus:border-zinc-400"
          />
          <select
            value={filterSize}
            onChange={(e) => setFilterSize(e.target.value)}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none"
          >
            <option value="all">ทุกขนาด</option>
            {SIZES.map((s) => <option key={s} value={s}>{s.toUpperCase()}</option>)}
          </select>
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
          <div className="grid grid-cols-12 gap-3 border-b border-zinc-200 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            <div className="col-span-1">ID</div>
            <div className="col-span-4">สินค้า</div>
            <div className="col-span-1">Size</div>
            <div className="col-span-2 text-right">จำนวน</div>
            <div className="col-span-2">สถานะ</div>
            <div className="col-span-2 text-right">จัดการ</div>
          </div>

          {filtered.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-zinc-600">ไม่พบข้อมูล</div>
          ) : (
            <ul className="divide-y divide-zinc-200">
              {filtered.map((stock) => (
                <li key={stock.id} className="grid grid-cols-12 items-center gap-3 px-4 py-3 text-sm hover:bg-zinc-50">
                  <div className="col-span-1 text-zinc-400">#{stock.id}</div>
                  <div className="col-span-4 font-medium text-zinc-900">{stock.itemName}</div>
                  <div className="col-span-1">
                    <span className="rounded border border-zinc-200 px-1.5 py-0.5 text-[11px] font-semibold uppercase text-zinc-600">
                      {stock.size}
                    </span>
                  </div>
                  <div className="col-span-2 text-right font-medium text-zinc-900">
                    {stock.quantity.toLocaleString()}
                  </div>
                  <div className="col-span-2"><StatusBadge quantity={stock.quantity} /></div>
                  <div className="col-span-2 flex justify-end gap-2">
                    <button onClick={() => openEdit(stock)} className="rounded-lg border border-zinc-200 px-3 py-1 text-xs font-medium text-zinc-700 hover:border-zinc-400 hover:text-zinc-900">
                      แก้ไข
                    </button>
                    <button onClick={() => setDeleteTarget(stock)} className="rounded-lg border border-red-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50">
                      ลบ
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>

      {addOpen && (
        <Modal title="เพิ่ม Stock ใหม่" onClose={() => setAddOpen(false)}>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-600">สินค้า</label>
              <select
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-400"
                value={form.itemId}
                onChange={(e) => setForm({ ...form, itemId: e.target.value })}
              >
                <option value="">-- เลือกสินค้า --</option>
                {items.map((item) => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-600">ขนาด (Size)</label>
              <select
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-400"
                value={form.size}
                onChange={(e) => setForm({ ...form, size: e.target.value })}
              >
                {SIZES.map((s) => <option key={s} value={s}>{s.toUpperCase()}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-600">จำนวน</label>
              <input
                type="number" min={0}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-400"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setAddOpen(false)} className="rounded-lg border border-zinc-200 px-4 py-2 text-sm text-zinc-700 hover:border-zinc-400">
                ยกเลิก
              </button>
              <button disabled={busy} onClick={handleAdd} className="h-9 inline-flex items-center justify-center rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50">
                {busy ? "กำลังบันทึก..." : "เพิ่ม Stock"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {editTarget && (
        <Modal title="แก้ไข Stock" onClose={() => setEditTarget(null)}>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-600">สินค้า</label>
              <input disabled value={editTarget.itemName}
                className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-500" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-600">ขนาด</label>
              <input disabled value={editTarget.size.toUpperCase()}
                className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-500" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-600">จำนวนใหม่</label>
              <input
                type="number" min={0}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-400"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setEditTarget(null)} className="rounded-lg border border-zinc-200 px-4 py-2 text-sm text-zinc-700 hover:border-zinc-400">
                ยกเลิก
              </button>
              <button disabled={busy} onClick={handleEdit} className="h-9 inline-flex items-center justify-center rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50">
                {busy ? "กำลังบันทึก..." : "บันทึก"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {deleteTarget && (
        <Modal title="ยืนยันการลบ" onClose={() => setDeleteTarget(null)}>
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm">
            <div className="flex justify-between py-1">
              <span className="text-zinc-500">สินค้า</span>
              <span className="font-medium text-zinc-900">{deleteTarget.itemName}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-zinc-500">ขนาด</span>
              <span className="font-medium text-zinc-900">{deleteTarget.size.toUpperCase()}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-zinc-500">จำนวน</span>
              <span className="font-medium text-zinc-900">{deleteTarget.quantity}</span>
            </div>
          </div>
          <p className="mt-3 text-xs text-red-500">⚠ การลบนี้ไม่สามารถย้อนกลับได้</p>
          <div className="mt-4 flex justify-end gap-2">
            <button onClick={() => setDeleteTarget(null)} className="rounded-lg border border-zinc-200 px-4 py-2 text-sm text-zinc-700 hover:border-zinc-400">
              ยกเลิก
            </button>
            <button disabled={busy} onClick={handleDelete} className="h-9 inline-flex items-center justify-center rounded-lg bg-red-600 px-4 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">
              {busy ? "กำลังลบ..." : "ลบ"}
            </button>
          </div>
        </Modal>
      )}

      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl border px-4 py-3 text-sm shadow-lg ${
          toast.ok
            ? "border-emerald-200 bg-white text-emerald-700"
            : "border-red-200 bg-white text-red-600"
        }`}>
          <span>{toast.ok ? "✓" : "✕"}</span>
          {toast.msg}
        </div>
      )}
    </div>
  );
}