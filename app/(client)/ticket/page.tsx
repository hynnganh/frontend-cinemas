"use client";

import React, { useState, useEffect } from 'react';
import { MapPin, Loader2, Film, X, Calendar, Armchair, CheckCircle, Ticket as TicketIcon } from 'lucide-react';
import { apiRequest, getImageUrl } from '@/app/lib/api'; 
import { QRCodeSVG } from 'qrcode.react';

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

  const moviePoster = getImageUrl(ticket.showtime?.movie?.posterUrl);

  return (
    <>
      <div 
        onClick={() => !isPast && setShowQR(true)}
        className={`relative group flex items-stretch transition-all duration-500 h-32 mb-4 rounded-3xl border overflow-hidden ${
          isPast 
          ? 'bg-zinc-900/40 border-white/5 cursor-default' 
          : 'bg-gradient-to-r from-zinc-900 via-zinc-900 to-red-950/20 border-white/10 hover:border-red-500/50 cursor-pointer hover:translate-x-1'
        }`}
      >
        {/* NHÃN TRẠNG THÁI (STAMP) */}
        {isPast && (
          <div className="absolute top-2 right-36 z-10 rotate-12 opacity-30">
            <div className="border-2 border-zinc-500 px-2 py-0.5 rounded text-[10px] font-black text-zinc-500 uppercase tracking-widest">
              Đã sử dụng
            </div>
          </div>
        )}

        {/* POSTER */}
        <div className="relative w-24 h-full shrink-0 overflow-hidden">
          <img src={moviePoster} className={`w-full h-full object-cover transition-transform duration-700 ${!isPast && 'group-hover:scale-110'}`} alt="p" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-zinc-950/80" />
        </div>

        {/* THÔNG TIN */}
        <div className="flex-1 flex flex-col justify-center px-5 min-w-0">
          <div className="flex items-center gap-3 mb-1.5">
            <span className={`text-[9px] font-black uppercase tracking-widest ${isPast ? 'text-zinc-500' : 'text-red-500'}`}>
              #{ticket.bookingCode}
            </span>
            <div className={`h-1 w-1 rounded-full ${isPast ? 'bg-zinc-700' : 'bg-green-500 animate-pulse'}`} />
          </div>
          
          <h4 className={`text-lg font-bold truncate uppercase tracking-tight ${isPast ? 'text-zinc-400' : 'text-white'}`}>
            {ticket.showtime?.movie?.title}
          </h4>
          
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1.5 text-[10px] font-medium text-zinc-500">
              <Calendar size={12} className={isPast ? 'text-zinc-700' : 'text-red-600'} />
              {new Date(ticket.showtime?.startTime).toLocaleDateString('vi-VN')}
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-medium text-zinc-500">
              <Film size={12} className={isPast ? 'text-zinc-700' : 'text-red-600'} />
              {loading ? "..." : showtimeData?.cinemaItem?.name}
            </div>
          </div>
        </div>

        {/* ĐƯỜNG RĂNG CƯA NGHỆ THUẬT */}
        <div className="relative w-8 flex flex-col items-center justify-between py-2 opacity-20">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="w-1 h-1 rounded-full bg-white" />
          ))}
        </div>

        {/* CUỐNG VÉ (GHẾ) */}
        <div className={`w-28 flex flex-col items-center justify-center border-l border-white/5 ${isPast ? 'bg-zinc-950/50' : 'bg-red-600/5'}`}>
          <span className="text-[8px] font-black text-zinc-600 uppercase mb-1 tracking-widest">Ghế</span>
          <div className={`text-2xl font-black italic ${isPast ? 'text-zinc-500' : 'text-white'}`}>
            {ticket.seat?.seatRow}<span className={isPast ? 'text-zinc-600' : 'text-red-500'}>{ticket.seat?.seatNumber}</span>
          </div>
        </div>
      </div>

      {/* QR MODAL */}
      {showQR && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setShowQR(false)} />
          <div className="relative bg-[#111] border border-white/10 rounded-[2rem] w-full max-w-[300px] shadow-2xl overflow-hidden">
            <div className="p-6 text-center">
              <div className="flex justify-between items-center mb-6">
                <TicketIcon size={20} className="text-red-600" />
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">E-Ticket</span>
                <button onClick={() => setShowQR(false)} className="text-zinc-500 hover:text-white"><X size={20}/></button>
              </div>

              <div className="bg-white p-3 rounded-2xl inline-block mb-6 shadow-xl">
                <QRCodeSVG value={ticket.bookingCode} size={160} level="H" />
              </div>

              <div className="space-y-4 text-left">
                <div>
                  <p className="text-[8px] text-zinc-500 font-bold uppercase mb-1">Phim</p>
                  <p className="text-sm font-bold text-white uppercase truncate">{ticket.showtime?.movie?.title}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
                  <div>
                    <p className="text-[8px] text-zinc-500 font-bold uppercase">Phòng</p>
                    <p className="text-xs font-bold text-white uppercase">{showtimeData?.room?.name}</p>
                  </div>
                  <div>
                    <p className="text-[8px] text-zinc-500 font-bold uppercase">Vị trí</p>
                    <p className="text-xs font-bold text-red-500 uppercase">{ticket.seat?.seatRow}{ticket.seat?.seatNumber}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-red-600 py-3 text-center">
               <p className="text-[9px] font-black text-white uppercase tracking-[0.3em]">Enjoy your movie</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

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
    <div className="px-6 lg:px-64 py-12 bg-[#050505] text-white min-h-screen">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
        <div>
           <h2 className="text-3xl font-black uppercase italic tracking-tighter">Vé <span className="text-red-600">của tôi</span></h2>
           <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">Lưu giữ từng khoảnh khắc điện ảnh</p>
        </div>

        <div className="flex gap-2">
          {['all', 'upcoming', 'done'].map((f) => (
            <button 
              key={f} 
              onClick={() => setActiveFilter(f)} 
              className={`px-5 py-2 rounded-full text-[9px] font-black uppercase transition-all ${
                activeFilter === f ? 'bg-white text-black' : 'text-zinc-500 border border-white/10 hover:border-white/30'
              }`}
            >
              {f === 'all' ? 'Tất cả' : f === 'upcoming' ? 'Vé sắp tới' : 'Vé đã xem'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-red-600" /></div>
      ) : (
        <div className="grid grid-cols-1 gap-1 max-h-[70vh] overflow-y-auto no-scrollbar pb-20">
          {filtered.map((ticket) => (
            <TicketItem key={ticket.id} ticket={ticket} isPast={new Date(ticket.showtime.startTime) < new Date()} />
          ))}
        </div>
      )}

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}