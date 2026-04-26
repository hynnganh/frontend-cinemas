"use client";
import React, { useState, useEffect } from 'react';
import { Ticket, Loader2, MapPin, Copy, CheckCircle2, ArrowRight, Wallet, Sparkles, Clock } from 'lucide-react';
import { apiRequest } from '@/app/lib/api';
import { useRouter } from 'next/navigation';

const VoucherCard = ({ voucher }: { voucher: any }) => {
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative bg-[#0f0f11] border border-white/5 rounded-3xl p-5 transition-all duration-300 hover:border-red-600/30 hover:bg-[#141416] hover:shadow-2xl hover:shadow-red-600/5">
      <div className="flex items-center gap-5">
        {/* Khối Trái: Icon & % Giảm */}
        <div className="relative w-20 h-20 shrink-0 bg-zinc-900 rounded-2xl flex flex-col items-center justify-center border border-white/5 overflow-hidden group-hover:border-red-600/20 transition-colors">
          <div className="absolute top-0 left-0 w-full h-1 bg-red-600 opacity-50" />
          <span className="text-2xl font-[1000] text-white italic leading-none">{Math.round(voucher.discountValue * 100)}%</span>
          <span className="text-[8px] font-black text-zinc-500 uppercase tracking-tighter mt-1">OFF</span>
          <Ticket size={14} className="absolute -bottom-1 -right-1 text-white/5 -rotate-12" />
        </div>

        {/* Khối Giữa: Nội dung */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <h3 className="text-sm font-[1000] text-white uppercase italic tracking-tight truncate">
              {voucher.title}
            </h3>
          </div>
          
          <div className="grid grid-cols-1 gap-1.5">
            <div className="flex items-center gap-2 text-zinc-500">
              <MapPin size={12} className="text-red-600" />
              <span className="text-[10px] font-bold truncate uppercase opacity-80">{voucher.cinemaItem?.name || "Ngọc Anh Cinema"}</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-500">
              <Clock size={12} className="text-zinc-600" />
              <span className="text-[10px] font-bold uppercase opacity-60">Hết hạn: {new Date(voucher.endDate).toLocaleDateString('vi-VN')}</span>
            </div>
          </div>
        </div>

        {/* Khối Phải: Code & Nút */}
        <div className="flex flex-col items-end gap-3 pl-5 border-l border-white/5">
          <div 
            className="flex items-center gap-2 px-3 py-1.5 bg-black rounded-xl border border-white/5 cursor-pointer active:scale-95 transition-all group/copy"
            onClick={() => handleCopy(voucher.code)}
          >
            <span className="text-[10px] font-black text-red-500 tracking-widest">{voucher.code}</span>
            {copied ? <CheckCircle2 size={12} className="text-green-500" /> : <Copy size={12} className="text-zinc-700 group-hover/copy:text-white" />}
          </div>
          
          <button 
            onClick={() => router.push('/movies/now')}
            className="flex items-center gap-2 px-4 py-2 bg-white text-black hover:bg-red-600 hover:text-white rounded-xl transition-all active:scale-90 group/btn"
          >
            <span className="text-[9px] font-black uppercase italic tracking-widest">Dùng</span>
            <ArrowRight size={12} className="group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default function MyVoucherWallet() {
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await apiRequest('/api/v1/vouchers/my-vouchers', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await res.json();
        setVouchers(result.data || []);
      } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    fetchVouchers();
  }, []);

  if (loading) return (
    <div className="h-screen bg-[#050505] flex items-center justify-center">
      <Loader2 className="animate-spin text-red-600" size={28} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] pt-28 pb-20 px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header: Cân đối & Hiện đại */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-white/5 pb-8">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-zinc-900 border border-white/10 rounded-2xl flex items-center justify-center shadow-xl shadow-red-600/5">
              <Wallet className="text-red-600" size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles size={12} className="text-red-600 animate-pulse" />
                <span className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em]">Personal Collection</span>
              </div>
              <h2 className="text-3xl font-[1000] text-white uppercase italic tracking-tighter">Ví Voucher</h2>
            </div>
          </div>
          
          <div className="bg-zinc-900/50 px-6 py-3 rounded-2xl border border-white/5">
            <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest block mb-1 text-center">Đang sở hữu</span>
            <p className="text-2xl font-[1000] text-white italic leading-none text-center">{vouchers.length}</p>
          </div>
        </div>

        {/* Danh sách: Grid 1 cột thoáng đãng */}
        {vouchers.length > 0 ? (
          <div className="grid grid-cols-1 gap-5">
            {vouchers.map((v, i) => (
              <VoucherCard key={v.id || i} voucher={v} />
            ))}
          </div>
        ) : (
          <div className="py-24 flex flex-col items-center justify-center bg-zinc-900/5 rounded-[3rem] border border-dashed border-white/5">
            <Ticket size={40} className="text-zinc-800 mb-4" />
            <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest italic text-center">
              Chưa có voucher nào trong ví của bặn.
            </p>
          </div>
        )}
      </div>

      <style jsx global>{`
        body { background-color: #050505; color: white; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #222; border-radius: 10px; }
      `}</style>
    </div>
  );
}