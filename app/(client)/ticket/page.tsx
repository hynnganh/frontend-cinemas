"use client";

import React, { useState, useEffect } from 'react';
import { Clock, MapPin, Ticket as TicketIcon, Loader2, CheckCircle2, Film, X, QrCode } from 'lucide-react';
import { apiRequest, getImageUrl } from '@/app/lib/api'; 
import { QRCodeSVG } from 'qrcode.react';

// --- COMPONENT CON: Từng mục vé ---
function TicketItem({ ticket, isPast }: { ticket: any, isPast: boolean }) {
  const [showtimeData, setShowtimeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    const fetchShowtimeDetail = async () => {
      try {
        const res = await apiRequest(`/api/v1/showtimes/${ticket.showtime.id}`);
        if (res.ok) {
          const result = await res.json();
          setShowtimeData(result.data);
        }
      } catch (err) { console.error(err); } 
      finally { setLoading(false); }
    };
    fetchShowtimeDetail();
  }, [ticket.showtime.id]);

  return (
    <>
      {/* VÉ: Làm to và dài hơn (h-28) */}
      <div 
        onClick={() => !isPast && setShowQR(true)}
        className={`group flex items-stretch transition-all duration-500 rounded-2xl border border-white/5 overflow-hidden h-28 cursor-pointer ${
          isPast ? 'opacity-20 grayscale cursor-not-allowed' : 'bg-zinc-900/30 hover:border-red-600/40 hover:bg-zinc-900/50 shadow-xl active:scale-[0.98]'
        }`}
      >
        {/* THÂN VÉ */}
        <div className="flex-1 p-4 flex gap-5 relative min-w-0">
          <div className="relative w-16 h-20 rounded-xl overflow-hidden shrink-0 border border-white/10 my-auto bg-zinc-800 shadow-2xl">
            <img src={getImageUrl(ticket.showtime?.movie?.posterUrl)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="p" />
          </div>

          <div className="flex flex-col justify-center min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
               <span className="text-[9px] font-black text-red-600 uppercase tracking-widest italic">#{ticket.bookingCode}</span>
               {!isPast && <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#22c55e]" />}
            </div>
            <h4 className="font-black text-base text-white truncate uppercase tracking-tight leading-tight group-hover:text-red-500 transition-colors">
              {ticket.showtime?.movie?.title}
            </h4>
            <div className="flex items-center gap-3 mt-2">
                <span className="text-[10px] font-bold text-zinc-300 uppercase flex items-center gap-1.5">
                  <Film size={12} className="text-red-600" /> {loading ? "..." : showtimeData?.cinemaItem?.name}
                </span>
                <span className="text-[10px] font-bold text-zinc-400 uppercase flex items-center gap-1.5 border-l border-white/10 pl-3">
                  <MapPin size={12} /> {loading ? "..." : showtimeData?.room?.name}
                </span>
            </div>
          </div>
        </div>

        {/* CUỐNG VÉ */}
        <div className="w-28 flex flex-col items-center justify-center border-l border-dashed border-white/10 bg-white/[0.02] relative">
          <div className="absolute -top-2 -left-2 w-4 h-4 bg-[#050505] rounded-full" />
          <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-[#050505] rounded-full" />
          
          <span className="text-[8px] font-black text-zinc-500 uppercase mb-1">HÀNG GHẾ</span>
          <div className="text-2xl font-[1000] text-white italic tracking-tighter">
             {ticket.seat?.seatRow}<span className="text-red-600">{ticket.seat?.seatNumber}</span>
          </div>
        </div>
      </div>

      {/* FORM QR: Làm nhỏ lại (max-w-[300px]) */}
      {showQR && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in zoom-in duration-300">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={() => setShowQR(false)} />
          <div className="relative bg-[#0d0d0d] border border-white/10 p-6 rounded-[2.5rem] w-full max-w-[280px] text-center shadow-2xl">
            <button onClick={() => setShowQR(false)} className="absolute top-5 right-5 text-zinc-600 hover:text-white transition-all active:scale-90">
              <X size={18}/>
            </button>
            
            <div className="mb-5">
               <h3 className="text-base font-[1000] uppercase italic text-white tracking-tighter italic">Vé Vào Cổng</h3>
               <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-[0.4em] mt-1 italic">Quét tại quầy soát vé</p>
            </div>

            <div className="bg-white p-3 rounded-2xl inline-block mb-5 shadow-[0_0_30px_rgba(220,38,38,0.2)]">
              <QRCodeSVG value={ticket.bookingCode} size={150} level="H" />
            </div>

            <div className="space-y-4">
               <div className="flex flex-col gap-0.5">
                  <span className="text-white font-black text-[11px] uppercase truncate px-2">{ticket.showtime?.movie?.title}</span>
                  <span className="text-red-600 font-bold text-[9px] uppercase tracking-wider">{showtimeData?.cinemaItem?.name}</span>
               </div>
               <div className="bg-zinc-900 py-2 rounded-xl border border-white/5 mx-2">
                  <p className="text-[14px] font-[1000] text-white italic">GHẾ: {ticket.seat?.seatRow}{ticket.seat?.seatNumber}</p>
               </div>
               <p className="text-[7px] text-zinc-600 font-bold uppercase tracking-widest leading-relaxed">Mã: {ticket.bookingCode}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// --- COMPONENT CHÍNH ---
export default function TicketsTab() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await apiRequest('/api/v1/tickets/my-history');
        if (res.ok) {
          const result = await res.json();
          setTickets(result.data || []);
        }
      } catch (err) { console.error(err); } 
      finally { setLoading(false); }
    };
    fetchHistory();
  }, []);

  const filtered = tickets.filter(t => {
    if (!t.showtime?.startTime) return false;
    const showDate = new Date(t.showtime.startTime);
    const now = new Date();
    if (activeFilter === 'upcoming') return showDate >= now;
    if (activeFilter === 'done') return showDate < now;
    return true; 
  });

  return (
    <div className="px-8 lg:px-48 py-10 space-y-8 bg-[#050505] text-white min-h-screen">
      {/* Header */}
      <div className="flex items-end justify-between border-b border-white/5 pb-6 mx-2">
        <div className="flex flex-col">
           <span className="text-[9px] font-black text-red-600 uppercase tracking-[0.6em] mb-1">Lịch sử</span>
           <h2 className="text-2xl font-[1000] uppercase italic tracking-tighter">Vé <span className="text-zinc-500">Của Bạn</span></h2>
        </div>
        <div className="flex gap-1 bg-zinc-900/50 p-1 rounded-xl border border-white/5">
          {['all', 'upcoming', 'done'].map((f) => (
            <button key={f} onClick={() => setActiveFilter(f)} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${activeFilter === f ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-zinc-600'}`}>
              {f === 'all' ? 'Tất cả' : f === 'upcoming' ? 'Sắp đi' : 'Đã đi'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-red-600" /></div>
      ) : (
        /* FIX: Ẩn thanh stroll (no-scrollbar) */
        <div className="grid gap-4 max-h-[600px] overflow-y-auto no-scrollbar px-2 pb-20">
          {filtered.map((ticket) => (
            <TicketItem key={ticket.id} ticket={ticket} isPast={new Date(ticket.showtime.startTime) < new Date()} />
          ))}
        </div>
      )}

      {/* CSS Ẩn thanh cuộn */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}