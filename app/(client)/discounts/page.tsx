"use client";
import React, { useState, useEffect } from 'react';
import { Ticket, Loader2, MapPin, Copy, CheckCircle2, ArrowRight, Wallet, Sparkles, Clock, Zap } from 'lucide-react';
import { apiRequest } from '@/app/lib/api';
import { useRouter } from 'next/navigation';
import router from 'next/router';

const VoucherCard = ({ voucher }: { voucher: any }) => {
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  // Hàm định dạng tiền tệ gọn (ví dụ 50000 -> 50K hoặc 50.000)
  const formatDiscount = (value: number) => {
    if (value >= 1000) {
      return (value / 1000).toLocaleString() + "K";
    }
    return value.toLocaleString();
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative bg-[#0f0f11] border border-white/5 rounded-[2rem] p-1 transition-all duration-500 hover:scale-[1.01] hover:shadow-[0_20px_50px_rgba(220,38,38,0.15)]">
      <div className="relative flex flex-col md:flex-row items-center gap-6 bg-[#0f0f11] rounded-[1.9rem] p-5 z-10 overflow-hidden">
        
        {/* Khối Trái: Visual Ticket (Hiển thị số tiền giảm) */}
        <div className="relative shrink-0 w-full md:w-36 h-28 bg-gradient-to-br from-zinc-800 to-black rounded-2xl flex flex-col items-center justify-center border border-white/10 shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-600 to-red-900" />
          
          <div className="flex flex-col items-center justify-center">
             <span className="text-sm font-black text-red-500 uppercase tracking-widest mb-1 italic">Giảm ngay</span>
             <div className="flex items-start">
                <span className="text-4xl font-[1000] text-white tracking-tighter italic leading-none">
                    {formatDiscount(voucher.discountValue)}
                </span>
                <span className="text-xs font-bold text-white mt-1 ml-0.5">đ</span>
             </div>
          </div>

          {/* Răng cưa vé rạp phim */}
          <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#050505] rounded-full border border-white/5 shadow-inner" />
          <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#050505] rounded-full border border-white/5 shadow-inner" />
          
          {/* Đường line đứt khúc trang trí */}
          <div className="absolute bottom-2 w-full flex justify-center gap-1 opacity-20">
            {[...Array(8)].map((_, i) => (
                <div key={i} className="w-1.5 h-0.5 bg-white rounded-full" />
            ))}
          </div>
        </div>

        {/* Khối Giữa: Nội dung chính */}
        <div className="flex-1 min-w-0 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full mb-3 border border-white/5">
            <Zap size={10} className="text-yellow-500 fill-yellow-500" />
            <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest italic">Ưu đãi tiền mặt</span>
          </div>
          
          <h3 className="text-xl font-black text-white uppercase italic tracking-tighter truncate leading-tight mb-3">
            {voucher.title}
          </h3>
          
          <div className="flex flex-wrap justify-center md:justify-start gap-y-2 gap-x-5">
            <div className="flex items-center gap-2 text-zinc-500">
              <MapPin size={14} className="text-red-600" />
              <span className="text-[10px] font-bold uppercase tracking-tight">{voucher.cinemaItem?.name || "Ngọc Anh Cinema"}</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-500">
              <Clock size={14} className="text-zinc-600" />
              <span className="text-[10px] font-bold uppercase tracking-tight">Hạn dùng: {new Date(voucher.endDate).toLocaleDateString('vi-VN')}</span>
            </div>
          </div>
        </div>

        {/* Khối Phải: Thao tác */}
        <div className="flex flex-row md:flex-col items-center gap-3 w-full md:w-auto md:pl-6 md:border-l md:border-white/5">
          <div 
            onClick={() => handleCopy(voucher.code)}
            className={`flex-1 md:flex-none flex items-center justify-center gap-3 px-5 py-3 rounded-2xl border transition-all cursor-pointer active:scale-95 group/copy ${
                copied ? 'bg-green-500/10 border-green-500/50 text-green-500' : 'bg-black border-white/10 hover:border-red-600/50'
            }`}
          >
            <span className={`text-xs font-black tracking-[0.2em] ${!copied && 'text-zinc-200'}`}>{voucher.code}</span>
            {copied ? <CheckCircle2 size={16} /> : <Copy size={16} className="text-zinc-600 group-hover/copy:text-red-500 transition-colors" />}
          </div>
          
          <button 
            onClick={() => router.push('/movies/now')}
            className="flex-1 md:flex-none flex items-center justify-center gap-3 px-8 py-3 bg-red-600 text-white hover:bg-white hover:text-black rounded-2xl transition-all duration-300 active:scale-90 font-black uppercase italic text-[10px] tracking-widest shadow-lg shadow-red-600/20"
          >
            Dùng ngay
            <ArrowRight size={14} />
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
    <div className="h-screen bg-[#050505] flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-red-600" size={40} strokeWidth={3} />
      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 animate-pulse">Đang kiểm tra túi đồ...</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] selection:bg-red-600/30">
      <div className="pt-12 pb-24 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 border-b border-white/5 pb-10">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-gradient-to-tr from-red-600 to-red-900 rounded-[2rem] flex items-center justify-center shadow-[0_0_40px_rgba(220,38,38,0.3)] rotate-3 group-hover:rotate-0 transition-transform">
                <Ticket className="text-white -rotate-12" size={36} strokeWidth={2} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-[2px] w-8 bg-red-600" />
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">Member Privilege</span>
                </div>
                <h2 className="text-5xl font-black text-white uppercase italic tracking-tighter leading-none">
                  Voucher <span className="text-red-600 italic">Box</span>
                </h2>
              </div>
            </div>
            
            <div className="bg-zinc-900/40 backdrop-blur-md px-10 py-5 rounded-3xl border border-white/5 flex flex-col items-center">
               <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Khả dụng</span>
               <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-[1000] text-white italic">{vouchers.length}</span>
                  <span className="text-[10px] font-bold text-red-600 uppercase italic">Mã</span>
               </div>
            </div>
          </div>

          {/* List */}
          {vouchers.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
              {vouchers.map((v, i) => (
                <VoucherCard key={v.id || i} voucher={v} />
              ))}
            </div>
          ) : (
            <div className="py-40 flex flex-col items-center justify-center bg-zinc-900/10 rounded-[4rem] border-2 border-dashed border-white/5">
              <Ticket size={48} className="text-zinc-800 mb-6" />
              <p className="text-zinc-500 text-xs font-black uppercase tracking-[0.3em] italic">Bạn chưa có mã giảm giá nào</p>
              <button 
                onClick={() => router.push('/')}
                className="mt-8 text-red-600 text-[10px] font-black uppercase tracking-[0.2em] hover:text-white transition-colors"
              >
                Quay lại trang chủ →
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        body { background-color: #050505; }
        .font-black { font-weight: 900; }
      `}</style>
    </div>
  );
}