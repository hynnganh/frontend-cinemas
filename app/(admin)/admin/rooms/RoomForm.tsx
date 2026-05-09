"use client";

import React from 'react';
import { X, Check, Armchair, Monitor } from 'lucide-react';

interface PropsForm {
  dangSuaId: number | null;
  duLieuForm: { name: string; totalSeats: number };
  setDuLieuForm: (data: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  onDong: () => void;
}

export default function FormPhongChieu({ dangSuaId, duLieuForm, setDuLieuForm, onSubmit, onDong }: PropsForm) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onDong}></div>
      
      <div className="relative bg-[#0c0c0e] border border-white/10 rounded-[2rem] w-full max-w-[340px] overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="h-1 w-full bg-gradient-to-r from-transparent via-red-600 to-transparent"></div>

        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-sm font-black uppercase italic tracking-tighter text-white">
                {dangSuaId ? 'Cập nhật' : 'Thêm mới'}
              </h2>
              <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest mt-1">Hệ thống phòng</p>
            </div>
            <button onClick={onDong} className="p-2 bg-zinc-900 rounded-full text-zinc-500 hover:text-white transition-all">
              <X size={16}/>
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase text-zinc-600 ml-1 tracking-[0.2em]">Định danh phòng</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-red-600 transition-colors">
                  <Monitor size={14} />
                </div>
                <input 
                  required
                  className="w-full bg-zinc-900/50 border border-white/5 rounded-xl py-3.5 pl-11 pr-4 text-[11px] font-bold outline-none focus:border-red-600/30 text-white transition-all"
                  value={duLieuForm.name}
                  onChange={(e) => setDuLieuForm({...duLieuForm, name: e.target.value})}
                  placeholder="VD: Phòng chiếu 01..."
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase text-zinc-600 ml-1 tracking-[0.2em]">Sức chứa (Ghế)</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-red-600 transition-colors">
                  <Armchair size={14} />
                </div>
                <input 
                  type="number"
                  required
                  className="w-full bg-zinc-900/50 border border-white/5 rounded-xl py-3.5 pl-11 pr-4 text-[11px] font-bold outline-none focus:border-red-600/30 text-white transition-all"
                  value={duLieuForm.totalSeats}
                  onChange={(e) => setDuLieuForm({...duLieuForm, totalSeats: parseInt(e.target.value) || 0})}
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full bg-white text-black py-4 mt-2 rounded-xl font-[1000] uppercase text-[10px] tracking-[0.2em] hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              Lưu dữ liệu <Check size={14} strokeWidth={3}/>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}