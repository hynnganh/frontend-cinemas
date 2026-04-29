"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, Ticket, CreditCard, Clock, Hash, 
  MapPin, ShoppingBag, Receipt, Zap, Calendar, 
  CheckCircle2, QrCode, Download, AlertCircle
} from 'lucide-react';
import { apiRequest } from '@/app/lib/api';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        const res = await apiRequest(`/api/v1/orders/${params.id}`);
        if (res.ok) {
          const json = await res.json();
          setOrder(json.data);
        }
      } catch (e) {
        console.error("Lỗi:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchOrderDetail();
  }, [params.id]);

  // Hàm chuyển đổi trạng thái sang tiếng Việt
  const getStatusLabel = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'SUCCESS': return { label: 'Giao dịch thành công', color: 'text-emerald-500', icon: <CheckCircle2 size={16} /> };
      case 'PENDING': return { label: 'Đang chờ xử lý', color: 'text-amber-500', icon: <Clock size={16} /> };
      case 'FAILED': return { label: 'Giao dịch thất bại', color: 'text-red-500', icon: <AlertCircle size={16} /> };
      default: return { label: status, color: 'text-zinc-400', icon: <Zap size={16} /> };
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <Zap className="text-red-600 animate-pulse" size={40} />
    </div>
  );

  if (!order) return <div className="p-20 text-center text-red-600 font-black uppercase tracking-widest italic">Hệ thống: Không tìm thấy dữ liệu</div>;

  const statusInfo = getStatusLabel(order.status);

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-8 font-sans selection:bg-red-600">
      
      {/* THANH ĐIỀU HƯỚNG */}
      <div className="max-w-5xl mx-auto flex justify-between items-center mb-8">
        <button 
          onClick={() => router.back()} 
          className="flex items-center gap-2 text-zinc-500 hover:text-white transition-all bg-zinc-900/50 px-4 py-2 rounded-xl border border-white/5"
        >
          <ArrowLeft size={16} />
          <span className="text-[10px] font-[1000] uppercase tracking-tighter">Trở lại bảng điều khiển</span>
        </button>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest italic">Máy chủ: HCM_D01</span>
          <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
        </div>
      </div>

      <main className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-4">
        
        {/* Ô 1: THÔNG TIN TỔNG QUÁT */}
        <div className="md:col-span-7 bg-zinc-950 border border-white/5 rounded-[2.5rem] p-8 relative overflow-hidden flex flex-col justify-between min-h-[300px]">
          <div className="relative z-10">
            <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.4em] mb-3 italic underline decoration-2 underline-offset-4">Hồ sơ giao dịch</p>
            <h1 className="text-6xl font-[1000] italic tracking-tighter uppercase leading-[0.8] mb-2">
              Chi tiết <br /> <span className="text-white/20">đơn hàng</span>
            </h1>
          </div>
          
          <div className="mt-8 flex items-end justify-between relative z-10">
            <div>
              <p className="text-[9px] font-black text-zinc-600 uppercase mb-1 italic tracking-widest">Mã số hóa đơn</p>
              <p className="text-3xl font-black italic tracking-tighter text-white">#{order.id}</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-black text-zinc-600 uppercase mb-1 italic tracking-widest">Tổng tiền quyết toán</p>
              <p className="text-5xl font-[1000] italic text-red-600 tracking-tighter leading-none">
                {order.totalAmount?.toLocaleString('vi-VN')}đ
              </p>
            </div>
          </div>
          <Hash className="absolute -bottom-12 -right-12 text-white/[0.02]" size={280} />
        </div>

        {/* Ô 2: TRẠNG THÁI & THỜI GIAN */}
        <div className="md:col-span-5 grid grid-cols-1 gap-4">
          <div className="bg-zinc-900/30 border border-white/5 rounded-[2.5rem] p-7 flex items-center justify-between group hover:border-white/10 transition-colors">
             <div>
                <p className="text-[9px] font-black text-zinc-600 uppercase mb-2 italic tracking-[0.2em]">Trạng thái hệ thống</p>
                <div className={`flex items-center gap-2 ${statusInfo.color}`}>
                   {statusInfo.icon}
                   <span className="font-[1000] italic uppercase text-sm tracking-tight">{statusInfo.label}</span>
                </div>
             </div>
             <QrCode size={40} className="text-white/5 group-hover:text-white/20 transition-all" />
          </div>
          
          <div className="bg-zinc-900/30 border border-white/5 rounded-[2.5rem] p-7">
             <p className="text-[9px] font-black text-zinc-600 uppercase mb-4 italic tracking-[0.2em]">Thời gian ghi nhận</p>
             <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-black rounded-lg border border-white/5 text-zinc-500"><Calendar size={14} /></div>
                   <span className="text-xs font-black uppercase italic text-zinc-300">Ngày: {new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-black rounded-lg border border-white/5 text-red-600"><Clock size={14} /></div>
                   <span className="text-xs font-[1000] italic text-white uppercase">Giờ: {new Date(order.createdAt).toLocaleTimeString('vi-VN')}</span>
                </div>
             </div>
          </div>
        </div>

        {/* Ô 3: DANH SÁCH MỤC HÀNG */}
        <div className="md:col-span-8 bg-zinc-950 border border-white/5 rounded-[2.5rem] p-8 md:p-10">
          <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-600/10 rounded-lg text-red-600"><ShoppingBag size={18} /></div>
              <h3 className="text-[11px] font-[1000] uppercase tracking-[0.3em] italic text-zinc-400">Danh mục sản phẩm</h3>
            </div>
            <span className="text-[10px] font-black px-3 py-1 bg-white/5 rounded-full border border-white/10 italic text-zinc-500">
              {order.orderDetails?.length || 0} mục hàng
            </span>
          </div>
          
          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-3 custom-scrollbar">
            {order.orderDetails?.map((item: any) => (
              <div key={item.id} className="flex justify-between items-center p-6 bg-zinc-900/10 border border-white/5 rounded-3xl group hover:border-red-600/30 transition-all">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center border border-white/5 text-red-600 group-hover:scale-105 transition-all">
                    <Ticket size={24} />
                  </div>
                  <div>
                    <p className="text-base font-[1000] italic uppercase tracking-tighter leading-none mb-2">{item.itemType}</p>
                    <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest italic">
                      Đơn giá: {item.price?.toLocaleString('vi-VN')}đ
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-zinc-500 mb-1 uppercase tracking-tighter italic">Số lượng: {item.quantity}</p>
                  <p className="text-xl font-[1000] italic text-white tracking-tighter">{(item.price * item.quantity).toLocaleString('vi-VN')}đ</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ô 4: ĐỊA ĐIỂM & THANH TOÁN */}
        <div className="md:col-span-4 space-y-4">
          <div className="bg-red-600 rounded-[2.5rem] p-9 text-black relative overflow-hidden group shadow-2xl shadow-red-600/10">
            <MapPin className="absolute -top-6 -right-6 text-black/10 group-hover:scale-110 transition-transform duration-700" size={140} />
            <p className="text-[9px] font-black uppercase mb-3 opacity-60 italic tracking-widest leading-none">Địa điểm thực hiện</p>
            <h4 className="text-2xl font-[1000] italic uppercase leading-[0.9] tracking-tighter mb-5">{order.cinemaName}</h4>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-black text-white text-[8px] font-black rounded-lg uppercase italic border border-white/10">
              <Hash size={10} className="text-red-600" /> ID: {order.cinemaItemId}
            </div>
          </div>

          <div className="bg-zinc-950/50 border border-white/5 rounded-[2.5rem] p-9">
            <p className="text-[9px] font-black text-zinc-600 uppercase mb-6 italic tracking-widest">Hình thức thanh toán</p>
            <div className="flex items-center gap-4 p-5 bg-black rounded-3xl border border-white/5 hover:border-white/10 transition-colors">
              <div className="p-3 bg-zinc-900 rounded-xl text-red-600"><CreditCard size={20} /></div>
              <div>
                 <p className="text-sm font-[1000] italic uppercase tracking-tighter leading-none mb-1">{order.paymentMethod}</p>
                 <p className="text-[8px] font-black text-emerald-500 uppercase italic tracking-widest">Đã bảo mật</p>
              </div>
            </div>
            <button className="w-full mt-6 py-5 bg-white text-black rounded-3xl text-[11px] font-[1000] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-red-600 hover:text-white transition-all active:scale-95 shadow-xl shadow-white/5">
              <Download size={16} /> Xuất hóa đơn số
            </button>
          </div>
        </div>

      </main>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #27272a; border-radius: 10px; border: 1px solid rgba(255,255,255,0.05); }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #ef4444; }
      `}</style>
    </div>
  );
}