"use client";

import React from 'react';
import { Calendar, Check, Clock, Coffee, ChevronRight, MapPin, AlertTriangle } from 'lucide-react';

const checkIsExpired = (dateStr: string, timeStr: string) => {
  if (!dateStr || !timeStr) return false;
  const [day, month, year] = dateStr.split('/').map(Number);
  const startTime = timeStr.split('-')[0].trim(); 
  const [hours, minutes] = startTime.split(':').map(Number);
  const movieTime = new Date(year, month - 1, day, hours, minutes);
  return movieTime < new Date();
};

interface OrderTicketItemProps {
  order: any;
  onOpenDetail: (order: any) => void;
}

export default function OrderTicketItem({ order, onOpenDetail }: OrderTicketItemProps) {
  const isExpired = order.status === 'PAID' && checkIsExpired(order.date, order.time);
  const isUsed = order.status === 'USED';
  const isCancelled = order.status === 'CANCELLED';

  const tickets = order.orderDetails?.filter((d: any) => d.itemType === 'TICKET') || [];
  const combos = order.orderDetails?.filter((d: any) => d.itemType === 'COMBO') || [];

  const seatNames = tickets.map((t: any) => {
    const match = t.itemName.match(/Ghế\s+([A-Z0-9]+)/i);
    return match ? match[1] : "...";
  }).sort().join(", ");

  return (
    <div 
      onClick={() => !isCancelled && onOpenDetail(order)} 
      className={`relative group flex items-stretch transition-all duration-500 h-28 mb-3.5 rounded-2xl border overflow-hidden select-none ${
        isCancelled 
          ? 'bg-zinc-950/20 border-zinc-900/50 opacity-40 cursor-not-allowed' 
          : (isUsed || isExpired)
            ? 'bg-zinc-900/40 border-zinc-800/60 opacity-80 hover:opacity-100 hover:border-zinc-600 cursor-pointer shadow-md'
            : 'bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 border-white/5 hover:border-red-500/40 cursor-pointer hover:translate-x-1 shadow-xl shadow-black/40'
      }`}
    >
      {/* CON DẤU TRẠNG THÁI */}
      {(isUsed || isExpired) && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none rotate-[-15deg] scale-110">
          <div className={`border-[2px] backdrop-blur-md px-4 py-1.5 rounded-xl flex items-center gap-1.5 shadow-2xl shadow-black ${
            isExpired ? 'border-amber-500/60 bg-amber-950/90' : 'border-emerald-500/60 bg-emerald-950/90'
          }`}>
            {isExpired ? <AlertTriangle size={14} className="text-amber-400 stroke-[3]" /> : <Check size={14} className="text-emerald-400 stroke-[3]" />}
            <span className={`text-[11px] font-black uppercase tracking-[0.3em] ${isExpired ? 'text-amber-400' : 'text-emerald-400'}`}>
              {isExpired ? 'HẾT HẠN' : 'ĐÃ SOÁT VÉ'}
            </span>
          </div>
        </div>
      )}

      {/* ĐÈN LED CHỈ THỊ TRẠNG THÁI */}
      <div className={`w-2.5 shrink-0 transition-colors duration-500 ${
        isUsed ? 'bg-emerald-600/50' : isExpired ? 'bg-amber-600/50' : isCancelled ? 'bg-zinc-900' : 'bg-red-600 group-hover:bg-red-500'
      }`} />

      {/* THÔNG TIN VÉ */}
      <div className={`flex-1 flex flex-col justify-center px-5 min-w-0 transition-all duration-300 ${
        (isUsed || isExpired) ? 'blur-[0.5px] grayscale group-hover:blur-0 group-hover:grayscale-0' : ''
      }`}>
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-[8px] font-black tracking-widest uppercase px-1.5 py-0.5 rounded bg-zinc-950 border border-white/5 ${
            (isUsed || isExpired) ? 'text-zinc-500' : 'text-red-500'
          }`}>
            ĐƠN: #{order.id}
          </span>
          <div className="flex items-center gap-1 text-[9px] text-zinc-500 font-bold">
            <Clock size={10} />
            {order.time || "N/A"}
          </div>
        </div>
        
        <h4 className={`text-sm font-black truncate uppercase tracking-tight transition-colors ${
          (isUsed || isExpired) ? 'text-zinc-400 group-hover:text-white' : 'text-white group-hover:text-red-400'
        }`}>
          {order.movieTitle || "Vé Xem Phim"}
        </h4>
        
        <div className="flex items-center gap-4 mt-1.5 h-5">
          <div className="flex items-center gap-1 text-[10px] font-bold text-zinc-400 shrink-0">
            <Calendar size={11} className="text-zinc-600" />
            {order.date || "Hôm nay"}
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-zinc-400 truncate">
            <MapPin size={11} className="text-zinc-600" />
            <span className="truncate max-w-[120px]">{order.cinemaName}</span>
          </div>
          {combos.length > 0 && (
            <div className="flex items-center gap-1 text-[8px] font-black text-pink-500 bg-pink-950/20 border border-pink-900/30 px-1.5 py-0.5 rounded-md uppercase shrink-0">
              <Coffee size={10} />
              <span>+{combos.length} Combo</span>
            </div>
          )}
        </div>
      </div>

      {/* ĐƯỜNG RĂNG CƯA */}
      <div className="relative w-6 flex flex-col justify-between py-3 opacity-20 pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="w-1 h-1 rounded-full bg-black -mx-0.5" />
        ))}
      </div>

      {/* CUỐNG VÉ PHẢI */}
      <div className={`w-28 shrink-0 flex flex-col items-center justify-center border-l border-white/5 relative group-hover:bg-white/[0.03] transition-all ${
        (isUsed || isExpired) ? 'bg-zinc-900/50' : 'bg-red-600/[0.02]'
      }`}>
        <span className="text-[8px] font-black text-zinc-600 uppercase mb-0.5 tracking-widest">Vị trí ghế</span>
        <div className="px-2 w-full text-center truncate">
          <p className={`text-xs font-black tracking-tight uppercase transition-colors ${
            (isUsed || isExpired) ? 'text-zinc-500 group-hover:text-zinc-300' : 'text-white group-hover:text-red-400'
          }`}>
            {seatNames || "Combo"}
          </p>
        </div>
        <ChevronRight size={13} className={`transition-colors mt-1 ${
          (isUsed || isExpired) ? 'text-zinc-600 group-hover:text-zinc-400' : 'text-zinc-600 group-hover:text-red-500'
        }`} />
      </div>
    </div>
  );
}