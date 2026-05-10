"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ChevronLeft, Ticket, Coffee, Calendar, CreditCard, 
  CheckCircle2, XCircle, Loader2, Building2, Clock, Sparkles, AlertTriangle
} from 'lucide-react';
import { apiRequest } from '@/app/lib/api';
import toast, { Toaster } from 'react-hot-toast';

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  // State cho Modal xác nhận
  const [confirmModal, setConfirmModal] = useState<{show: boolean, status: string, title: string}>({
    show: false,
    status: '',
    title: ''
  });

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const res = await apiRequest(`/api/v1/orders/${id}`);
      const result = await res.json();
      if (result?.data) setOrder(result.data);
    } catch (err) {
      toast.error("Không tải được thông tin hóa đơn");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (id) fetchOrderDetail(); }, [id]);

  const handleUpdateStatus = async () => {
    setConfirmModal({ ...confirmModal, show: false });
    setUpdating(true);
    try {
      const res = await apiRequest(`/api/v1/orders/${id}/status?status=${confirmModal.status}`, {
        method: 'PUT'
      });
      if (res.ok) {
        toast.success("Cập nhật trạng thái thành công");
        fetchOrderDetail();
      }
    } catch (err) {
      toast.error("Lỗi cập nhật hệ thống");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#0d0d0d]">
      <Loader2 className="animate-spin text-orange-400" size={24} />
    </div>
  );

  const statusLabel = order?.status === 'SUCCESS' ? 'Đã thanh toán' : order?.status === 'CANCELLED' ? 'Đã hủy đơn' : 'Chờ xử lý';

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-zinc-300 p-5 font-sans selection:bg-orange-500/20 relative">
      <Toaster position="top-right" />

      {/* --- CUSTOM MODAL XÁC NHẬN --- */}
      {confirmModal.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setConfirmModal({...confirmModal, show: false})} />
          <div className="relative bg-[#1a1a1a] border border-white/10 p-8 rounded-[2.5rem] max-w-sm w-full shadow-2xl text-center space-y-6 animate-in fade-in zoom-in duration-200">
            <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${confirmModal.status === 'SUCCESS' ? 'bg-green-500/10 text-green-400' : 'bg-rose-500/10 text-rose-400'}`}>
              {confirmModal.status === 'SUCCESS' ? <CheckCircle2 size={32} /> : <AlertTriangle size={32} />}
            </div>
            <div>
              <h3 className="text-white font-black text-lg uppercase italic tracking-tight">{confirmModal.title}</h3>
              <p className="text-zinc-500 text-xs mt-2 font-medium">Hành động này sẽ thay đổi trạng thái vĩnh viễn của hóa đơn này nha má.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button 
                onClick={() => setConfirmModal({...confirmModal, show: false})}
                className="py-3 px-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[11px] font-black uppercase text-zinc-400 transition-all"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={handleUpdateStatus}
                className={`py-3 px-4 rounded-2xl text-[11px] font-black uppercase text-white transition-all shadow-lg ${confirmModal.status === 'SUCCESS' ? 'bg-green-600 shadow-green-500/20' : 'bg-rose-600 shadow-rose-500/20'}`}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header điều hướng */}
        <div className="flex justify-between items-center px-2">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 hover:text-orange-400 transition-all">
            <ChevronLeft size={14} /> Quay lại
          </button>
          <span className="text-[10px] font-mono text-zinc-700 italic">MÃ ĐƠN: #{order?.id}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* CỘT TRÁI: DANH SÁCH MÓN */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-7 bg-gradient-to-br from-orange-500/[0.07] to-pink-500/[0.03] border border-white/5 rounded-[2.5rem]">
              <div className="flex items-center gap-3 mb-2 text-orange-400">
                <Building2 size={18} />
                <h1 className="text-xl font-black text-white tracking-tight uppercase italic">{order?.cinemaName}</h1>
              </div>
              <div className="flex gap-4 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                <span className="flex items-center gap-1.5"><Clock size={12}/> {new Date(order?.createdAt).toLocaleTimeString('vi-VN')}</span>
                <span className="flex items-center gap-1.5"><Calendar size={12}/> {new Date(order?.createdAt).toLocaleDateString('vi-VN')}</span>
              </div>
            </div>

            <div className="space-y-2">
              {order?.orderDetails?.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-5 bg-white/[0.02] border border-white/5 rounded-3xl group">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl ${item.itemType === 'TICKET' ? 'bg-orange-500/10 text-orange-400' : 'bg-pink-500/10 text-pink-400'}`}>
                      {item.itemType === 'TICKET' ? <Ticket size={20}/> : <Coffee size={20}/>}
                    </div>
                    <div>
                      <p className="text-[11px] font-black text-zinc-200 uppercase tracking-tight">{item.itemType === 'TICKET' ? 'Vé xem phim' : 'Bắp & Nước'}</p>
                      <p className="text-[10px] text-zinc-600 font-bold mt-0.5">Số lượng: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="text-sm font-black text-white tracking-tighter italic">{(item.price * item.quantity).toLocaleString()}đ</p>
                </div>
              ))}
            </div>
          </div>

          {/* CỘT PHẢI: THANH TOÁN */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-8 bg-[#121212] border border-white/5 rounded-[3rem] shadow-2xl relative overflow-hidden">
               <div className="absolute -top-10 -right-10 w-24 h-24 bg-orange-500/10 blur-[50px]" />

               <div className="relative z-10 space-y-8">
                  <div className="text-center space-y-1">
                    <span className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em]">Tổng hóa đơn</span>
                    <h2 className="text-4xl font-[1000] text-white italic tracking-tighter">
                      {order?.totalAmount.toLocaleString()}đ
                    </h2>
                  </div>

                  <div className="space-y-3 py-6 border-y border-white/[0.03] text-[10px] font-bold uppercase tracking-widest">
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-600 font-black">Hình thức:</span>
                      <span className="text-zinc-300 italic">{order?.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-zinc-600 font-black">Trạng thái:</span>
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black border ${
                        order?.status === 'SUCCESS' ? 'text-green-400 border-green-500/20 bg-green-500/5' : 
                        order?.status === 'CANCELLED' ? 'text-rose-400 border-rose-500/20 bg-rose-500/5' : 
                        'text-orange-400 border-orange-500/20 bg-orange-500/5'
                      }`}>
                        {statusLabel}
                      </span>
                    </div>
                  </div>

                  {/* ACTION BUTTONS SỬ DỤNG CUSTOM MODAL */}
                  {order?.status === 'PENDING' ? (
                    <div className="grid gap-3 pt-2">
                      <button 
                        disabled={updating}
                        onClick={() => setConfirmModal({show: true, status: 'SUCCESS', title: 'Xác nhận thanh toán'})}
                        className="w-full py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-[1.4rem] font-black text-[11px] uppercase shadow-lg shadow-orange-500/10 hover:brightness-110 active:scale-[0.97] transition-all flex items-center justify-center gap-2"
                      >
                        {updating ? <Loader2 size={16} className="animate-spin"/> : <CheckCircle2 size={16}/>}
                        Xác nhận thanh toán
                      </button>
                      <button 
                        disabled={updating}
                        onClick={() => setConfirmModal({show: true, status: 'CANCELLED', title: 'Xác nhận hủy đơn'})}
                        className="w-full py-3 text-zinc-600 hover:text-rose-400 font-black text-[10px] uppercase transition-colors"
                      >
                        Hủy đơn hàng
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-4 bg-white/[0.01] border border-dashed border-white/5 rounded-2xl">
                      <div className="flex items-center justify-center gap-2 text-zinc-700">
                        <Sparkles size={12}/>
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] italic">Hóa đơn đã đóng</p>
                      </div>
                    </div>
                  )}
               </div>
            </div>

            <div className="flex justify-center py-2">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-500/20 animate-pulse" />
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}