"use client";
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { apiSuperAdminRequest } from '@/app/lib/api';
import { 
  Loader2, Film, ChevronRight, 
  X, Building2, ShieldCheck, 
  Calendar as CalendarIcon, ArrowUpRight
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import weekOfYear from 'dayjs/plugin/weekOfYear';

dayjs.extend(isSameOrAfter);
dayjs.extend(weekOfYear);
dayjs.locale('vi');

export default function CinemaManagementPage() {
  const router = useRouter();
  const [showtimes, setShowtimes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'UPCOMING' | 'PAST'>('ALL');
  const [timeView, setTimeView] = useState<'WEEK' | 'MONTH' | 'ALL'>('MONTH');
  const [selectedMonth, setSelectedMonth] = useState(dayjs().month());

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<any>(null);

  useEffect(() => { fetchShowtimes(); }, []);

  const fetchShowtimes = async () => {
    try {
      setLoading(true);
      const res = await apiSuperAdminRequest('/api/v1/showtimes');
      const responseData = await res.json();
      setShowtimes(responseData.data || []);
    } catch (err) { 
      toast.error("Lỗi đồng bộ dữ liệu hệ thống!"); 
    } finally { 
      setLoading(false); 
    }
  };

  const filteredShowtimes = useMemo(() => {
    const now = dayjs();
    return showtimes.filter(show => {
      const showTime = dayjs(show.startTime);
      if (filterStatus === 'UPCOMING' && !showTime.isAfter(now)) return false;
      if (filterStatus === 'PAST' && showTime.isAfter(now)) return false;
      if (timeView === 'WEEK') return showTime.isSame(now, 'week');
      if (timeView === 'MONTH') {
        return showTime.month() === selectedMonth && showTime.isSame(now, 'year');
      }
      return true;
    });
  }, [showtimes, filterStatus, timeView, selectedMonth]);

  const cinemaMap = useMemo(() => {
    return filteredShowtimes.reduce((acc: any, curr: any) => {
      const cinemaName = curr.cinemaItem?.cinema?.name || "Hệ thống rạp";
      const branchId = curr.cinemaItem?.id;
      if (!acc[cinemaName]) acc[cinemaName] = {};
      if (!acc[cinemaName][branchId]) acc[cinemaName][branchId] = { info: curr.cinemaItem, shows: [] };
      acc[cinemaName][branchId].shows.push(curr);
      return acc;
    }, {});
  }, [filteredShowtimes]);

  if (loading) return (
    <div className="min-h-screen bg-[#020202] flex flex-col items-center justify-center gap-3">
      <Loader2 className="animate-spin text-red-600 opacity-80" size={32} />
      <p className="text-zinc-600 font-bold text-[10px] uppercase tracking-widest animate-pulse">Đang đồng bộ trục thời gian...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020202] text-zinc-400 p-6 md:p-12 font-sans antialiased select-none">
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#060608',
            color: '#fff',
            border: '1px solid #18181b',
            borderRadius: '0.75rem',
            fontSize: '13px'
          },
        }} 
      />
      
      <div className="max-w-7xl mx-auto space-y-10">
        {/* HEADER BLOCK */}
        <header className="space-y-6 border-b border-zinc-900 pb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-red-600 font-bold text-[10px] uppercase tracking-widest">
                <ShieldCheck size={14} />
                <span>Phân hệ quản trị cao cấp</span>
              </div>
              <h1 className="text-2xl font-black uppercase tracking-tight text-white">
                Tổng lịch chiếu phim
              </h1>
            </div>

            {/* STATUS FILTER */}
            <div className="flex bg-[#060608] p-1 rounded-lg border border-zinc-900 shadow-md">
              {(['ALL', 'UPCOMING', 'PAST'] as const).map((s) => (
                <button 
                  key={s} 
                  onClick={() => setFilterStatus(s)}
                  className={`px-5 py-2 rounded-md text-[10px] font-bold uppercase transition-all duration-150 ${
                    filterStatus === s 
                      ? 'bg-zinc-900 text-white border border-zinc-800' 
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {s === 'ALL' ? 'Tất cả' : s === 'UPCOMING' ? 'Sắp chiếu' : 'Lịch sử'}
                </button>
              ))}
            </div>
          </div>

          {/* TIME FILTER & MONTH SELECTOR */}
          <div className="flex flex-col md:flex-row items-center gap-4 bg-[#060608]/50 p-3 rounded-xl border border-zinc-900">
             <div className="flex items-center gap-3 px-3 border-r border-zinc-900 shrink-0">
                <CalendarIcon size={16} className="text-zinc-500" />
                <div className="flex bg-[#020202] p-1 rounded-md border border-zinc-900">
                   {(['WEEK', 'MONTH', 'ALL'] as const).map((v) => (
                      <button 
                        key={v} 
                        onClick={() => setTimeView(v)}
                        className={`px-3 py-1 rounded text-[9px] font-bold uppercase transition-all ${
                          timeView === v ? 'bg-zinc-800 text-white' : 'text-zinc-600 hover:text-zinc-400'
                        }`}
                      >
                        {v === 'WEEK' ? 'Tuần' : v === 'MONTH' ? 'Tháng' : 'Tất cả'}
                      </button>
                   ))}
                </div>
             </div>

             {/* 12 MONTH BUTTONS */}
             <div className="flex-1 flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-1">
                {Array.from({ length: 12 }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => { setSelectedMonth(i); setTimeView('MONTH'); }}
                    className={`min-w-[42px] h-[42px] rounded-lg flex flex-col items-center justify-center transition-all border ${
                      selectedMonth === i && timeView === 'MONTH'
                        ? 'bg-red-600 border-transparent text-white shadow-md font-black' 
                        : 'border-zinc-900 bg-zinc-950/40 text-zinc-500 hover:border-zinc-700'
                    }`}
                  >
                    <span className="text-[7px] font-bold uppercase opacity-50 leading-none mb-0.5">Thg</span>
                    <span className="text-xs font-bold leading-none">{i + 1}</span>
                  </button>
                ))}
             </div>
          </div>
        </header>

        {/* CINEMA GROUPS LIST */}
        <div className="space-y-12">
          {Object.keys(cinemaMap).map((cinemaName) => (
            <div key={cinemaName} className="space-y-6">
              <div className="flex items-center gap-4">
                <h2 className="text-base font-black uppercase tracking-tight text-zinc-200">
                  {cinemaName}
                </h2>
                <div className="h-[1px] flex-1 bg-zinc-900" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.values(cinemaMap[cinemaName]).map((branch: any) => (
                  <div 
                    key={branch.info.id}
                    onClick={() => { setSelectedBranch(branch); setIsModalOpen(true); }}
                    className="group/card bg-[#060608] border border-zinc-900 rounded-xl p-6 hover:border-zinc-800 transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-6">
                         <div className="w-11 h-11 bg-zinc-950 border border-zinc-900 rounded-lg flex items-center justify-center text-zinc-500 group-hover/card:bg-zinc-900 group-hover/card:text-white transition-all">
                            <Building2 size={18} />
                         </div>
                         <div className="text-right">
                            <span className="block text-2xl font-black text-zinc-800 group-hover/card:text-red-600/30 transition-colors leading-none tracking-tight">
                               {String(branch.shows.length).padStart(2, '0')}
                            </span>
                            <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">Suất chiếu</span>
                         </div>
                      </div>
                      
                      <h3 className="text-sm font-bold uppercase text-zinc-200 group-hover/card:text-white transition-colors mb-1 truncate">
                        {branch.info.name}
                      </h3>
                      <p className="text-[10px] text-zinc-500 border-l border-zinc-800 pl-2.5 truncate mb-6">
                        {branch.info.address}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-zinc-900/60 flex items-center justify-between">
                       <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-wide group-hover/card:text-zinc-400 transition-colors flex items-center gap-1">
                         Xem chi tiết danh sách <ChevronRight size={12} />
                       </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {Object.keys(cinemaMap).length === 0 && (
            <div className="py-24 text-center border border-zinc-900 border-dashed bg-zinc-950/20 rounded-xl">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Không tìm thấy suất chiếu nào trong giai đoạn này</p>
            </div>
          )}
        </div>
      </div>

      {/* DETAILED MODAL */}
      {isModalOpen && selectedBranch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-[#060608] border border-zinc-900 w-full max-w-3xl max-h-[80vh] rounded-xl overflow-hidden flex flex-col shadow-2xl transition-all">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-zinc-900 flex justify-between items-center bg-zinc-950/40">
              <div className="space-y-0.5">
                <h2 className="text-base font-black uppercase tracking-tight text-white">{selectedBranch.info.name}</h2>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Điều hành và cấu hình chi tiết phân bổ ghế</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="w-8 h-8 flex items-center justify-center bg-zinc-900 border border-zinc-800 hover:text-white rounded-md transition-all"
              >
                <X size={16}/>
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-3 flex-1 [scrollbar-width:thin] border-zinc-900">
              {selectedBranch.shows.sort((a: any, b: any) => dayjs(a.startTime).unix() - dayjs(b.startTime).unix()).map((show: any) => (
                <div 
                  key={show.id} 
                  onClick={() => router.push(`/super-admin/showtime/${show.id}`)}
                  className="group/item flex items-center justify-between p-4 bg-zinc-950/50 border border-zinc-900/60 rounded-lg hover:bg-zinc-900/40 hover:border-zinc-800 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-center text-zinc-500 group-hover/item:text-white group-hover/item:bg-red-600 group-hover/item:border-transparent shrink-0 transition-all">
                      <Film size={16} />
                    </div>
                    <div className="min-w-0 space-y-0.5">
                       <span className="inline-block px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 text-[8px] font-bold text-zinc-500 rounded uppercase">
                         Phòng {show.room?.name}
                       </span>
                       <h4 className="text-sm font-bold uppercase text-zinc-200 group-hover/item:text-white transition-colors truncate tracking-tight">
                         {show.movie?.title}
                       </h4>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 shrink-0 text-right">
                     <div>
                        <span className="text-xl font-black text-white tracking-tight leading-none block">
                           {dayjs(show.startTime).format('HH:mm')}
                        </span>
                        <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-wider">
                          {dayjs(show.startTime).format('DD/MM/YYYY')}
                        </span>
                     </div>
                     <div className="w-7 h-7 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 group-hover/item:bg-white group-hover/item:text-black group-hover/item:border-transparent transition-all">
                        <ArrowUpRight size={14} />
                     </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}