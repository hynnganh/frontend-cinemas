"use client";
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { apiRequest } from '@/app/lib/api';
import { 
  Loader2, ArrowLeft, Armchair, 
  ShieldCheck, Zap, Monitor, 
  TrendingUp, MapPin, Heart
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

// --- COMPONENT CON CHO UI SẠCH SẼ ---
const LegendItem = ({ dot, label }: { dot: string; label: string }) => (
  <div className="flex items-center gap-2 px-3 border-r border-white/5 last:border-none">
    <div className={`w-1.5 h-1.5 rounded-full ${dot}`} />
    <span className="text-[7px] font-black text-zinc-500 uppercase tracking-tighter">{label}</span>
  </div>
);

const StatCard = ({ icon, label, value, subIcon }: any) => (
  <div className="p-5 bg-[#0a0a0a] border border-white/5 rounded-2xl relative overflow-hidden group hover:border-white/10 transition-all">
    <div className="relative z-10">
      {icon}
      <p className="text-[7px] text-zinc-600 font-black uppercase mb-1 mt-3 tracking-widest">{label}</p>
      <p className="text-xl font-black italic text-zinc-200">{value}</p>
    </div>
    {subIcon && (
      <div className="absolute -bottom-2 -right-2 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity text-white">
        {subIcon}
      </div>
    )}
  </div>
);

function SeatContent() {
  const params = useParams();
  const router = useRouter();
  const roomId = params?.id; 

  const [seats, setSeats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSeats = async () => {
      if (!roomId) return;
      try {
        setLoading(true);
        const res = await apiRequest(`/api/v1/seats/room/${roomId}`);
        if (!res.ok) throw new Error();

        const responseData = await res.json();
        const rawSeats = responseData.data || [];
        
        const sortedSeats = [...rawSeats].sort((a: any, b: any) => {
          if (a.seatRow < b.seatRow) return -1;
          if (a.seatRow > b.seatRow) return 1;
          return parseInt(a.seatNumber) - parseInt(b.seatNumber);
        });
        
        setSeats(sortedSeats);
      } catch (err) {
        toast.error("Lỗi đồng bộ sơ đồ (403/500)");
      } finally {
        setLoading(false);
      }
    };
    fetchSeats();
  }, [roomId]);

  // LOGIC THỐNG KÊ
  const totalSeats = seats.length;
  const normalSeats = seats.filter(s => s.seatType?.toUpperCase() === 'NORMAL').length;
  const vipSeats = seats.filter(s => s.seatType?.toUpperCase() === 'VIP').length;
  const sweetboxSeats = seats.filter(s => s.seatType?.toUpperCase() === 'SWEETBOX').length;
  const soldSeats = seats.filter(s => s.status?.toUpperCase() === 'SOLD' || s.status === false).length;
  
  const roomData = seats[0]?.room || {};
  const cinemaData = roomData?.cinemaItem || {};

  const renderSeatGrid = () => {
    const rows: { [key: string]: any[] } = {};
    seats.forEach(seat => {
      const rowName = seat.seatRow;
      if (!rows[rowName]) rows[rowName] = [];
      rows[rowName].push(seat);
    });

    return Object.keys(rows).sort().map((row) => (
      <div key={row} className="flex gap-3 justify-center items-center mb-3">
        <div className="w-8 text-[10px] font-black text-zinc-800 uppercase text-center italic">{row}</div>
        
        <div className="flex gap-2">
          {rows[row].map((seat: any) => {
            const type = seat.seatType?.toUpperCase();
            const isSold = seat.status?.toUpperCase() === 'SOLD' || seat.status === false;
            const isSweet = type === 'SWEETBOX';
            const isVip = type === 'VIP';
            
            // Style & Kích thước: w-7 = 28px. Ghế đôi = 28*2 + gap(8) = 64px
            let seatStyle = "bg-white/5 border-white/10 text-zinc-500"; 
            let widthClass = "w-7"; 

            if (isSold) {
              seatStyle = "bg-zinc-900 border-transparent opacity-20 cursor-not-allowed";
            } else if (isVip) {
              seatStyle = "bg-amber-500/10 border-amber-500/30 text-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.05)]";
            } else if (isSweet) {
              seatStyle = "bg-pink-500/10 border-pink-500/30 text-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.05)]";
              widthClass = "w-[64px]"; 
            }

            return (
              <div
                key={seat.id}
                title={`${seat.name} (${type})`}
                className={`h-7 rounded-lg flex flex-col items-center justify-center transition-all border shrink-0 group/seat ${widthClass} ${seatStyle}`}
              >
                {isSweet ? (
                  <Heart size={10} className="mb-0.5 opacity-60 group-hover/seat:scale-110 transition-transform" />
                ) : (
                  <Armchair size={10} className="mb-0.5 opacity-30" />
                )}
                <span className="text-[6px] font-black leading-none uppercase tracking-tighter">
                  {seat.seatRow}{seat.seatNumber}
                </span>
              </div>
            );
          })}
        </div>

        <div className="w-8 text-[10px] font-black text-zinc-800 uppercase text-center italic">{row}</div>
      </div>
    ));
  };

  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center">
      <Loader2 className="animate-spin text-red-600 mb-4" size={32} />
      <p className="text-[10px] text-zinc-700 font-black uppercase tracking-[0.3em] animate-pulse">Syncing Map...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020202] text-white p-3 md:p-6 font-sans relative overflow-hidden">
      <Toaster position="top-right" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* TOP NAV */}
        <div className="flex justify-between items-start mb-4">
          <button 
            onClick={() => router.back()} 
            className="group flex items-center gap-3 text-zinc-600 hover:text-white transition-all text-[9px] font-[1000] uppercase tracking-widest"
          >
            <div className="w-8 h-8 flex items-center justify-center border border-white/5 rounded-full group-hover:border-red-600/50 group-hover:bg-red-600/5 transition-all">
              <ArrowLeft size={12} />
            </div>
            Trở lại
          </button>

          <div className="flex bg-[#0a0a0a] border border-white/5 rounded-2xl p-1.5 shadow-2xl">
             <LegendItem dot="bg-zinc-600" label={`Normal (${normalSeats})`} />
             <LegendItem dot="bg-amber-500" label={`VIP (${vipSeats})`} />
             <LegendItem dot="bg-pink-500" label={`Sweetbox (${sweetboxSeats})`} />
          </div>
        </div>

        {/* HEADER */}
        <header className="mb-16">
            <div className="flex items-center gap-3 text-red-600 font-black text-[10px] uppercase tracking-[0.4em] mb-4">
              <ShieldCheck size={16} /> {cinemaData.name || "A&K Admin"}
            </div>
            <h1 className="text-5xl font-[1000] italic uppercase tracking-tighter text-white">
              {roomData.name || "Seat Layout"}
            </h1>
        </header>

        {/* SCREEN SECTION */}
        <div className="w-full mb-20 text-center relative">
          <div className="w-[70%] h-[1px] bg-gradient-to-r from-transparent via-zinc-800 to-transparent mx-auto" />
          <div className="w-[40%] h-[4px] bg-red-600/10 mx-auto blur-xl absolute top-0 left-1/2 -translate-x-1/2" />
          <p className="text-[7px] font-black tracking-[2em] text-zinc-800 uppercase mt-6 ml-[2em]">Main Screen Area</p>
        </div>

        {/* GRID LAYOUT */}
        <div className="overflow-x-auto pb-24 custom-scrollbar flex justify-center">
          <div className="min-w-max px-12 py-8 bg-[#050505]/50 border border-white/[0.02] rounded-[4rem]">
            {renderSeatGrid()}
          </div>
        </div>

        {/* DASHBOARD STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
            <StatCard 
              icon={<Zap size={18} className="text-red-600"/>} 
              label="Quy mô phòng" 
              value={`${totalSeats} Seats`} 
              subIcon={<Monitor size={80}/>}
            />
            <StatCard 
              icon={<TrendingUp size={18} className="text-amber-500"/>} 
              label="Hạng thượng lưu" 
              value={`${vipSeats} VIP`} 
            />
            <StatCard 
              icon={<Heart size={18} className="text-pink-500"/>} 
              label="Hạng đôi tình nhân" 
              value={`${sweetboxSeats} Sweetbox`} 
            />
            <StatCard 
              icon={<MapPin size={18} className="text-zinc-500"/>} 
              label="Công suất lấp đầy" 
              value={`${totalSeats > 0 ? Math.round((soldSeats/totalSeats)*100) : 0}%`} 
            />
        </div>
      </div>

      {/* BACKGROUND DECOR */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600/5 blur-[150px] -z-10 rounded-full" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-pink-600/5 blur-[120px] -z-10 rounded-full" />
    </div>
  );
}

// WRAPPER CHO NEXT.JS NAVIGATION
export default function SuperAdminSeatPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center font-black text-white uppercase tracking-widest">
        Loading...
      </div>
    }>
      <SeatContent />
    </Suspense>
  );
}