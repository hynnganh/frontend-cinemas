"use client";

import React, { useState } from 'react';
import { 
  Edit3, Save, X, Plus, 
  Loader2, Trash2, Armchair,
  Gem, Heart, Circle
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

// 1. DỮ LIỆU GIẢ (MOCK DATA)
const MOCK_PRICES = [
  { id: 1, name: "Ghế Standard", type: "NORMAL", price: 65000, description: "Ghế tiêu chuẩn, tầm nhìn tốt" },
  { id: 2, name: "Ghế VIP", type: "VIP", price: 95000, description: "Ghế da cao cấp, ngả lưng thoải mái" },
  { id: 3, name: "Ghế Sweetbox", type: "COUPLE", price: 210000, description: "Ghế đôi riêng tư, có vách ngăn" },
];

export default function PriceManagementPage() {
  const [prices, setPrices] = useState<any[]>(MOCK_PRICES);
  const [loading] = useState(false);
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<number>(0);

  const handleUpdatePrice = (id: number) => {
    if (editValue <= 0) return toast.error("Giá không hợp lệ!");
    
    // Cập nhật vào state tạm thời (vì chưa có BE)
    setPrices(prev => prev.map(p => p.id === id ? { ...p, price: editValue } : p));
    toast.success("Đã cập nhật giá (Local)!");
    setIsEditing(null);
  };

  const getSeatStyle = (type: string) => {
    switch (type) {
      case 'VIP': return { color: 'text-amber-500', bg: 'bg-amber-500/5', border: 'border-amber-500/10', icon: <Gem size={24} /> };
      case 'COUPLE': return { color: 'text-pink-500', bg: 'bg-pink-500/5', border: 'border-pink-500/10', icon: <Heart size={24} /> };
      default: return { color: 'text-blue-400', bg: 'bg-blue-400/5', border: 'border-blue-400/10', icon: <Circle size={24} /> };
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-10 font-sans tracking-tight">
      <Toaster position="top-right" />

      {/* HEADER NHỎ NHẮN */}
      <div className="flex justify-between items-end mb-12 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-2xl font-black uppercase italic tracking-tighter">
            Giá <span className="text-red-600">Ghế Ngồi</span>
          </h1>
          <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.3em] mt-1">Cấu hình biểu phí hệ thống</p>
        </div>
        <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-white text-black px-5 py-2.5 rounded-full hover:bg-red-600 hover:text-white transition-all">
          <Plus size={14} /> Thêm loại
        </button>
      </div>

      {/* GRID DANH SÁCH */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {prices.map((item) => {
          const style = getSeatStyle(item.type);
          const editing = isEditing === item.id;

          return (
            <div key={item.id} className={`group relative p-8 rounded-[2.5rem] border ${style.border} ${style.bg} transition-all duration-500 hover:bg-white/[0.03]`}>
              
              <div className="flex justify-between items-start mb-8">
                <div className={`p-4 rounded-2xl bg-black/40 border border-white/5 ${style.color}`}>
                  {style.icon}
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setIsEditing(item.id); setEditValue(item.price); }} className="p-2 hover:text-white text-zinc-600"><Edit3 size={14} /></button>
                  <button className="p-2 hover:text-red-500 text-zinc-600"><Trash2 size={14} /></button>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-lg font-black uppercase italic mb-1">{item.name}</h3>
                <p className="text-[10px] text-zinc-500 font-bold uppercase leading-relaxed">{item.description}</p>
              </div>

              <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                {editing ? (
                  <div className="flex items-center gap-2 w-full animate-in fade-in zoom-in duration-300">
                    <input 
                      type="number" 
                      value={editValue}
                      onChange={(e) => setEditValue(Number(e.target.value))}
                      className="w-full bg-black border border-red-600 rounded-xl py-2 px-3 font-black text-red-600 text-sm outline-none"
                      autoFocus
                    />
                    <button onClick={() => handleUpdatePrice(item.id)} className="p-2 bg-red-600 rounded-lg"><Save size={14} /></button>
                    <button onClick={() => setIsEditing(null)} className="p-2 bg-zinc-800 rounded-lg"><X size={14} /></button>
                  </div>
                ) : (
                  <>
                    <div>
                      <p className="text-[8px] font-black text-zinc-600 uppercase mb-1">Đơn giá</p>
                      <p className={`text-2xl font-[1000] italic ${style.color}`}>
                        {item.price.toLocaleString()}<span className="text-xs ml-0.5">đ</span>
                      </p>
                    </div>
                    <Armchair size={20} className="text-white/5 group-hover:text-white/10 transition-colors" />
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-20 text-center">
        <p className="text-[9px] font-black uppercase text-zinc-800 tracking-[0.4em] italic">
          * Dữ liệu đang hiển thị ở chế độ Demo (Local State)
        </p>
      </div>
    </div>
  );
}