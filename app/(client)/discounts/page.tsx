"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { Ticket, Loader2, MapPin, Copy, CheckCircle2, ArrowRight, Clock, Zap, Heart } from 'lucide-react';
import { apiRequest } from '@/app/lib/api';
import { useRouter } from 'next/navigation';

const VoucherCard = ({ voucher }: { voucher: any }) => {
  const [copied, setCopied] = useState(false);
  const router = useRouter();

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
    <div className="group relative bg-[#0c0c0e] border border-zinc-900 rounded-[2rem] p-1 transition-all duration-300 hover:scale-[1.01] hover:border-red-600/30 hover:shadow-[0_15px_30px_rgba(220,38,38,0.1)]">
      <div className="relative flex flex-col sm:flex-row items-center gap-4 bg-[#0c0c0e] rounded-[1.9rem] p-4 z-10 overflow-hidden">
        
        {/* Khối Trái: Vé xem phim mini dáng tròn trịa, tone Đỏ - Đen cá tính */}
        <div className="relative shrink-0 w-full sm:w-32 h-24 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black rounded-2xl flex flex-col items-center justify-center border border-zinc-800 shadow-sm">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-red-900" />
          
          <div className="flex flex-col items-center justify-center">
             <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider mb-0.5">Giảm liền</span>
             <div className="flex items-start">
                <span className="text-3xl font-[1000] text-white tracking-tighter leading-none italic">
                    {formatDiscount(voucher.discountValue)}
                </span>
                <span className="text-[10px] font-bold text-red-500 mt-0.5 ml-0.5">đ</span>
             </div>
          </div>

          {/* Vết cắt lượn sóng nhỏ xinh tiệp màu nền rạp phim */}
          <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#050505] rounded-full border border-zinc-900" />
          <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#050505] rounded-full border border-zinc-900" />
        </div>

        {/* Khối Giữa: Thông tin chữ nhỏ nhắn, gọn gàng, trắng sạch sẽ */}
        <div className="flex-1 min-w-0 text-center sm:text-left space-y-1">
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-red-600/10 rounded-full border border-red-600/20">
            <Zap size={10} className="text-red-500 fill-red-500" />
            <span className="text-[9px] font-bold text-red-400 uppercase tracking-wider">Mã Thành Viên</span>
          </div>
          
          <h3 className="text-base font-black text-white uppercase italic truncate leading-tight flex items-center justify-center sm:justify-start gap-1">
            {voucher.title}
          </h3>
          
          <div className="flex flex-col gap-0.5 pt-0.5 text-zinc-500">
            <div className="flex items-center justify-center sm:justify-start gap-1">
              <MapPin size={12} className="text-red-500/80" />
              <span className="text-[11px] font-bold uppercase truncate text-zinc-400">{voucher.cinemaItem?.name || "Hệ thống A&K Cinema"}</span>
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-1">
              <Clock size={12} className="text-zinc-600" />
              <span className="text-[11px] font-medium text-zinc-500">Hạn dùng: {new Date(voucher.endDate).toLocaleDateString('vi-VN')}</span>
            </div>
          </div>
        </div>

        {/* Khối Phải: Nút bấm Đỏ - Trắng - Đen nhỏ gọn xink iu */}
        <div className="flex flex-row sm:flex-col items-center gap-2 w-full sm:w-auto sm:pl-4 sm:border-l sm:border-zinc-900">
          <div 
            onClick={() => handleCopy(voucher.code)}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl border transition-all cursor-pointer active:scale-95 text-xs font-mono font-bold ${
                copied ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-black border-zinc-800 hover:border-red-600/30 text-zinc-300 hover:text-red-500'
            }`}
          >
            <span>{voucher.code}</span>
            {copied ? <CheckCircle2 size={13} /> : <Copy size={13} className="text-zinc-600" />}
          </div>
          
          <button 
            onClick={() => router.push('/movies/now')}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-5 py-2 bg-red-600 text-white rounded-xl transition-all duration-300 active:scale-95 font-black uppercase italic text-[11px] tracking-wide hover:bg-white hover:text-black shadow-sm shadow-red-600/10"
          >
            Dùng luôn
            <ArrowRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default function MyVoucherWallet() {
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem('token_user') : null;
        const res = await apiRequest('/api/v1/vouchers/my-vouchers', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await res.json();
        setVouchers(result.data || []);
      } catch (e) { 
        console.error(e); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchVouchers();
  }, []);

  const activeVouchers = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return vouchers.filter(v => {
      const expiryDate = new Date(v.endDate);
      return expiryDate >= now;
    });
  }, [vouchers]);

  if (loading) return (
    <div className="h-screen bg-[#050505] flex flex-col items-center justify-center gap-2">
      <Loader2 className="animate-spin text-red-600" size={32} strokeWidth={3} />
      <span className="text-[11px] font-black uppercase tracking-widest text-zinc-600 animate-pulse">Đang kiểm tra ví...</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-400 pb-20 font-sans antialiased selection:bg-red-600/20 selection:text-red-500">
      <div className="pt-10 px-4 sm:px-6">
        {/* Khung nhỏ gọn vừa vặn max-w-3xl chuẩn dáng xink iu */}
        <div className="max-w-3xl mx-auto">
          
          {/* Header nhỏ gọn tinh tế, điểm chút xíu hồng cam ở tim nhỏ */}
          <div className="flex flex-row items-center justify-between gap-4 mb-8 border-b border-zinc-900 pb-6">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 bg-gradient-to-tr from-red-600 to-red-900 rounded-2xl flex items-center justify-center shadow-md shadow-red-900/10 rotate-2">
                <Ticket className="text-white -rotate-6" size={24} strokeWidth={2.5} />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  {/* Nhấn chút xíu hồng cam cực nhẹ ở icon nhỏ đáng yêu này */}
                  <Heart size={10} className="text-pink-400 fill-pink-500 animate-pulse" />
                  <span className="text-[9px] font-black uppercase tracking-wider text-zinc-500">Túi đồ cá nhân</span>
                </div>
                <h2 className="text-2xl font-black text-white uppercase italic tracking-tight">
                  Voucher <span className="text-red-500 italic">Box</span>
                </h2>
              </div>
            </div>
            
            {/* Tag đếm số lượng tròn trịa nhỏ gọn */}
            <div className="bg-[#0c0c0e] border border-zinc-900 px-4 py-2 rounded-2xl flex items-center gap-1.5 shadow-sm">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">Đang có</span>
                <span className="text-xl font-black text-red-500 leading-none italic">{activeVouchers.length}</span>
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">mã</span>
            </div>
          </div>

          {/* Danh sách Voucher dáng mini gọn gàng */}
          {activeVouchers.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 animate-in fade-in slide-in-from-bottom-3 duration-500">
              {activeVouchers.map((v, i) => (
                <VoucherCard key={v.id || i} voucher={v} />
              ))}
            </div>
          ) : (
            <div className="py-24 flex flex-col items-center justify-center bg-[#0c0c0e]/30 rounded-[2.5rem] border border-dashed border-zinc-900">
              <Ticket size={40} className="text-zinc-800 mb-4" />
              <p className="text-zinc-500 text-xs font-black uppercase tracking-widest text-center px-6 leading-relaxed">
                Túi đồ của bạn hiện tại chưa có mã nào nè~
              </p>
              <button 
                onClick={() => router.push('/')}
                className="mt-5 px-5 py-2 rounded-full bg-black border border-zinc-800 text-zinc-300 text-xs font-bold shadow-sm hover:border-red-600/40 hover:text-red-500 transition-all active:scale-95"
              >
                Đi gom mã ngay nha 🎬
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}