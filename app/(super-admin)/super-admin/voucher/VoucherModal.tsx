"use client";

import React, { useEffect, useState } from "react";
import { X, Save, Loader2, AlertCircle, Tag, Percent, DollarSign, Gift, Coins } from "lucide-react";
import { apiSuperAdminRequest } from "@/app/lib/api";

export default function VoucherModal({ isOpen, onClose, onSubmit, initialData, isSubmitting }: any) {
  const [promotions, setPromotions] = useState<any[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    code: "", title: "", description: "", discountValue: 0, minOrderAmount: 0,
    usageLimit: 1, startDate: "", endDate: "", promotionId: "",
    voucherType: "EVENT", costPoints: 0
  });

  useEffect(() => {
    if (isOpen) {
      apiSuperAdminRequest('/api/v1/promotions').then(r => r.json()).then(d => setPromotions(d.data || []));
      if (initialData) {
        setFormData({
          ...initialData,
          startDate: initialData.startDate ? new Date(initialData.startDate).toISOString().slice(0, 16) : "",
          endDate: initialData.endDate ? new Date(initialData.endDate).toISOString().slice(0, 16) : "",
          promotionId: initialData.promotionId || ""
        });
      }
    }
  }, [isOpen, initialData]);

  const validate = () => {
    const newErrors = [];
    if (!formData.code || formData.code.length < 3) newErrors.push("Mã code phải từ 3 ký tự.");
    if (formData.discountValue >= formData.minOrderAmount) newErrors.push("Giá trị giảm phải nhỏ hơn đơn tối thiểu.");
    if (formData.voucherType === "EVENT" && !formData.promotionId) newErrors.push("Vui lòng chọn sự kiện.");
    if (formData.voucherType === "REDEEM" && formData.costPoints <= 0) newErrors.push("Số điểm đổi phải lớn hơn 0.");
    setErrors(newErrors);
    return newErrors.length === 0;
  };

const handleChange = (e: any) => {
  const { name, value, type } = e.target;

  let finalValue: any =
    type === "number" ? Number(value) : value;

  // FORCE UPPERCASE CODE
  if (name === "code") {
    finalValue = String(value)
      .toUpperCase()
      .replace(/\s+/g, "");
  }

  setFormData((prev) => ({
    ...prev,
    [name]: finalValue,
  }));
};

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-[#060608] border border-zinc-900 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-5 border-b border-zinc-900">
          <h2 className="text-xs font-black text-white uppercase tracking-widest">
            {initialData ? "Cập nhật" : "Thiết lập"} Voucher
          </h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white"><X size={16} /></button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 [&::-webkit-scrollbar]:hidden">
          <form id="voucher-form" onSubmit={(e) => { e.preventDefault(); if (validate()) onSubmit(formData); }} className="space-y-6">
            
            {/* Loại Voucher & Code */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Mã Code</label>
<input
  name="code"
  value={formData.code}
  onChange={handleChange}
  placeholder="VD: SALE2026"
  className="w-full bg-zinc-950 border border-zinc-800 p-3 rounded-lg text-white font-bold text-xs uppercase"
/>              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Hình thức</label>
                <select name="voucherType" value={formData.voucherType} onChange={handleChange} className="w-full bg-zinc-950 border border-zinc-800 p-3 rounded-lg text-white font-bold text-xs">
                  <option value="EVENT">Voucher sự kiện</option>
                  <option value="REDEEM">Voucher đổi điểm</option>
                </select>
              </div>
            </div>

            {/* Điều kiện loại */}
            {formData.voucherType === "EVENT" ? (
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase flex items-center gap-1"><Gift size={12}/> Sự kiện áp dụng</label>
                <select name="promotionId" value={formData.promotionId} onChange={handleChange} className="w-full bg-zinc-950 border border-zinc-800 p-3 rounded-lg text-white font-bold text-xs">
                  <option value="">Chọn sự kiện...</option>
                  {promotions.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-amber-500 uppercase flex items-center gap-1"><Coins size={12}/> Điểm đổi (PTS)</label>
                <input name="costPoints" type="number" value={formData.costPoints} onChange={handleChange} className="w-full bg-zinc-950 border border-amber-900/30 p-3 rounded-lg text-amber-500 font-bold text-xs" />
              </div>
            )}

            {/* Cấu hình giá trị (Đã làm rõ) */}
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-zinc-500 uppercase flex items-center gap-2"><Tag size={12} /> Cấu hình giá trị</label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <p className="text-[9px] text-zinc-400">Số tiền giảm</p>
                  <div className="relative"><input name="discountValue" type="number" value={formData.discountValue} onChange={handleChange} className="w-full bg-zinc-950 border border-zinc-800 p-3 rounded-lg text-white font-bold text-xs pl-8" /><Percent className="absolute left-3 top-3.5 text-zinc-600" size={12} /></div>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] text-zinc-400">Đơn tối thiểu</p>
                  <div className="relative"><input name="minOrderAmount" type="number" value={formData.minOrderAmount} onChange={handleChange} className="w-full bg-zinc-950 border border-zinc-800 p-3 rounded-lg text-white font-bold text-xs pl-8" /><DollarSign className="absolute left-3 top-3.5 text-zinc-600" size={12} /></div>
                </div>
              </div>
              <p className="text-[9px] text-zinc-600 italic">
                * Áp dụng giảm {formData.discountValue.toLocaleString()}đ cho đơn từ {formData.minOrderAmount.toLocaleString()}đ.
              </p>
            </div>

            {errors.length > 0 && (
              <div className="bg-red-950/20 border border-red-900/50 p-3 rounded-lg">
                {errors.map((err, i) => <p key={i} className="text-[10px] text-red-500 font-bold flex items-center gap-2"><AlertCircle size={12} /> {err}</p>)}
              </div>
            )}
          </form>
        </div>

        <div className="p-5 border-t border-zinc-900 bg-zinc-950/50">
          <button type="submit" form="voucher-form" disabled={isSubmitting} className="w-full h-12 bg-red-600 hover:bg-red-700 rounded-xl text-white font-black uppercase text-xs flex items-center justify-center gap-2">
            {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : "Lưu cấu hình"}
          </button>
        </div>
      </div>
    </div>
  );
}