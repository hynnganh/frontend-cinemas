"use client";

import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Loader2, 
  X, 
  Calendar, 
  Check,
  Ticket as TicketIcon, 
  Coffee, 
  ChevronRight, 
  Clock, 
  CreditCard 
} from 'lucide-react';
import { apiRequest } from '@/app/lib/api'; 
import { QRCodeSVG } from 'qrcode.react';
import { Toaster } from 'react-hot-toast';

// ============================================================================
// 1. COMPONENT THÀNH PHẦN: DÒNG ĐƠN HÀNG GOM GHẾ
// ============================================================================
function OrderTicketItem({ order, onOpenDetail }: { order: any; onOpenDetail: (order: any) => void }) {
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
          : isUsed 
            ? 'bg-zinc-900/40 border-zinc-800/60 opacity-80 hover:opacity-100 hover:border-zinc-600 cursor-pointer shadow-md'
            : 'bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 border-white/5 hover:border-red-500/40 cursor-pointer hover:translate-x-1 shadow-xl shadow-black/40'
      }`}
    >
      {/* CON DẤU ĐÃ SOÁT VÉ (BÊN NGOÀI ITEM) */}
      {isUsed && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none rotate-[-15deg] scale-110">
          <div className="border-[2px] border-emerald-500/60 bg-emerald-950/90 backdrop-blur-md px-4 py-1.5 rounded-xl flex items-center gap-1.5 shadow-2xl shadow-black">
            <Check size={14} className="text-emerald-400 stroke-[3]" />
            <span className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.3em]">ĐÃ SOÁT VÉ</span>
          </div>
        </div>
      )}

      {/* ĐƯỜNG ĐÈN CHỈ THỊ */}
      <div className={`w-2.5 shrink-0 transition-colors duration-500 ${isUsed ? 'bg-emerald-600/50' : isCancelled ? 'bg-zinc-900' : 'bg-red-600 group-hover:bg-red-500'}`} />

      {/* THÔNG TIN CHI TIẾT ĐƠN HÀNG */}
      <div className={`flex-1 flex flex-col justify-center px-5 min-w-0 transition-all duration-300 ${isUsed ? 'blur-[0.5px] grayscale group-hover:blur-0 group-hover:grayscale-0' : ''}`}>
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-[8px] font-black tracking-widest uppercase px-1.5 py-0.5 rounded bg-zinc-950 border border-white/5 ${isUsed ? 'text-zinc-500' : 'text-red-500'}`}>
            ĐƠN: #{order.id}
          </span>
          <div className="flex items-center gap-1 text-[9px] text-zinc-500 font-bold">
            <Clock size={10} />
            {order.time || "N/A"}
          </div>
        </div>
        
        <h4 className={`text-sm font-black truncate uppercase tracking-tight transition-colors ${isUsed ? 'text-zinc-400 group-hover:text-white' : 'text-white group-hover:text-red-400'}`}>
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

      {/* ĐƯỜNG RĂNG CƯA NGHỆ THUẬT */}
      <div className="relative w-6 flex flex-col justify-between py-3 opacity-20 pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="w-1 h-1 rounded-full bg-black -mx-0.5" />
        ))}
      </div>

      {/* CUỐNG VÉ BÊN PHẢI */}
      <div className={`w-28 shrink-0 flex flex-col items-center justify-center border-l border-white/5 relative group-hover:bg-white/[0.03] transition-all ${isUsed ? 'bg-zinc-900/50' : 'bg-red-600/[0.02]'}`}>
        <span className="text-[8px] font-black text-zinc-600 uppercase mb-0.5 tracking-widest">Vị trí ghế</span>
        <div className="px-2 w-full text-center truncate">
          <p className={`text-xs font-black tracking-tight uppercase transition-colors ${isUsed ? 'text-zinc-500 group-hover:text-zinc-300' : 'text-white group-hover:text-red-400'}`}>
            {seatNames || "Combo"}
          </p>
        </div>
        <ChevronRight size={13} className={`transition-colors mt-1 ${isUsed ? 'text-zinc-600 group-hover:text-zinc-400' : 'text-zinc-600 group-hover:text-red-500'}`} />
      </div>
    </div>
  );
}


// ============================================================================
// 2. MAIN COMPONENT CHÍNH: TRANG VÉ CỦA TÔI
// ============================================================================
export default function TicketsTab() {
  const [activeFilter, setActiveFilter] = useState('upcoming');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  useEffect(() => {
    const fetchOrderHistory = async () => {
      try {
        const res = await apiRequest('/api/v1/orders/my-history');
        if (res.ok) {
          const result = await res.json();
          const validOrders = (result.data || []).filter((o: any) => o.status === 'PAID' || o.status === 'USED');
          setOrders(validOrders);
        }
      } catch (err) { 
        console.error("Lỗi fetch lịch sử đơn vé: ", err); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchOrderHistory();
  }, []);

  const filteredOrders = orders.filter(o => {
    if (activeFilter === 'upcoming') return o.status === 'PAID';
    if (activeFilter === 'done') return o.status === 'USED';
    return true;
  });

  const getModalBookingCode = () => {
    if (!selectedOrder) return "A&K-CINEMA";
    if (selectedOrder.bookingCode) return selectedOrder.bookingCode.toUpperCase();
    const ticketDetail = selectedOrder.orderDetails?.find((d: any) => d.itemType === 'TICKET');
    if (ticketDetail && ticketDetail.itemName) {
      return `AK${selectedOrder.id}X${selectedOrder.createdAt?.substring(14,16) || "9K"}`;
    }
    return `AK-COMBO${selectedOrder.id}`;
  };

  const cleanSeatsDisplay = () => {
    if (!selectedOrder) return "N/A";
    const tickets = selectedOrder.orderDetails?.filter((d: any) => d.itemType === 'TICKET') || [];
    return tickets.map((t: any) => {
      const match = t.itemName.match(/Ghế\s+([A-Z0-9]+)/i);
      return match ? match[1] : "...";
    }).sort().join(", ");
  };

  return (
    <div className="min-h-screen bg-[#040406] text-white px-4 sm:px-6 lg:px-64 py-12 relative overflow-hidden">
      <Toaster />
      
      {/* Nền Cyberpunk */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-red-600/5 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-red-600/5 rounded-full blur-[130px] pointer-events-none" />

      {/* Header Tab */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8 relative z-10 animate-in fade-in slide-in-from-top-8 duration-700">
        <div>
           <h2 className="text-3xl font-[1000] uppercase tracking-tighter italic">Vé điện tử <span className="text-red-600">của tôi</span></h2>
           <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1.5">Hệ thống gom nhóm vé thông minh</p>
        </div>

        <div className="flex bg-zinc-950 p-1.5 rounded-2xl border border-white/5 gap-1 shadow-inner">
          {[
            { id: 'upcoming', label: 'Vé sắp xem' },
            { id: 'done', label: 'Lịch sử xem' }
          ].map((tab) => (
            <button 
              key={tab.id} 
              onClick={() => setActiveFilter(tab.id)} 
              className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase transition-all duration-300 ${
                activeFilter === tab.id 
                  ? 'bg-red-600 text-white shadow-lg shadow-red-900/40' 
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* DANH SÁCH ĐƠN HÀNG */}
      {loading ? (
        <div className="flex justify-center py-24 animate-in fade-in duration-500"><Loader2 className="animate-spin text-red-600" size={32} strokeWidth={3} /></div>
      ) : (
        <div className="space-y-1 max-h-[72vh] overflow-y-auto pr-1 no-scrollbar pb-20 relative z-10">
          {filteredOrders.length === 0 ? (
            <div className="py-24 text-center border border-dashed border-white/5 rounded-[2.5rem] bg-zinc-950/20 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-500">
              <TicketIcon className="mx-auto text-zinc-700 mb-4 animate-bounce" size={40} />
              <p className="text-zinc-500 text-xs font-black uppercase tracking-widest">Không tìm thấy dữ liệu vé tương ứng!</p>
            </div>
          ) : (
            filteredOrders.map((order, index) => (
              <div 
                key={order.id} 
                className="animate-in fade-in slide-in-from-bottom-8 fill-mode-both"
                style={{ animationDelay: `${index * 100}ms`, animationDuration: '500ms' }}
              >
                <OrderTicketItem order={order} onOpenDetail={(o) => setSelectedOrder(o)} />
              </div>
            ))
          )}
        </div>
      )}

      {/* ============================================================================ */}
      {/* E-TICKET POPUP MODAL */}
      {/* ============================================================================ */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 select-none animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setSelectedOrder(null)} />
          
          <div className="relative bg-[#09090d] border border-zinc-800/60 rounded-[2.2rem] w-full max-w-[320px] shadow-[0_25px_60px_rgba(0,0,0,0.85)] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-6 duration-400">
            
            <div className="p-4 pb-3 border-b border-dashed border-zinc-800 flex justify-between items-center bg-gradient-to-b from-zinc-900/40 to-transparent">
              <div className="flex items-center gap-2 pl-1">
                <TicketIcon size={16} className="text-red-500" />
                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em]">A&K Cinema Pass</span>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)} 
                className="w-7 h-7 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all shadow-inner"
              >
                <X size={13} strokeWidth={3}/>
              </button>
            </div>

            <div className="p-5 text-center space-y-4">
              
              {/* KHỐI QR CODE CÓ CHỨA DẤU ĐÃ SOÁT VÉ */}
              <div className="relative inline-block group">
                {/* 🎯 QR CODE BỊ LÀM MỜ NẾU LÀ VÉ CŨ */}
                <div className={`bg-white p-3.5 rounded-[1.8rem] shadow-xl transition-all duration-500 ${selectedOrder.status === 'USED' ? 'opacity-30 grayscale blur-[1px]' : ''}`}>
                  <QRCodeSVG value={getModalBookingCode()} size={140} level="H" includeMargin={false} />
                  <div className="absolute inset-0 border-4 border-black/5 rounded-[1.8rem] pointer-events-none" />
                </div>
                
                {/* Dấu đóng lên mã QR bên trong Modal */}
                {selectedOrder.status === 'USED' && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none rotate-[-15deg] scale-125 shadow-2xl animate-in zoom-in-50 fade-in duration-500">
                    <div className="border-[3px] border-emerald-500/80 bg-emerald-950/80 backdrop-blur-md px-5 py-2 rounded-xl flex items-center gap-2">
                      <Check size={18} className="text-emerald-400 stroke-[4]" />
                      <span className="text-xs font-[1000] text-emerald-400 uppercase tracking-[0.3em] drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]">ĐÃ SOÁT</span>
                    </div>
                  </div>
                )}
              </div>

              {/* MÃ CHỮ BÊN DƯỚI QR */}
              <div className="w-full flex justify-center">
                <div className={`bg-black/50 border border-zinc-900 rounded-xl py-1.5 px-4 font-mono text-base font-black tracking-[0.25em] shadow-inner transition-colors ${selectedOrder.status === 'USED' ? 'text-zinc-600 line-through decoration-zinc-500/50' : 'text-zinc-100'}`}>
                  {getModalBookingCode()}
                </div>
              </div>

              {/* 🎯 KHỐI THÔNG TIN CHI TIẾT: GIỮ NGUYÊN SỰ SÁNG SỦA, RỰC RỠ, KHÔNG LÀM MỜ DÙ LÀ VÉ CŨ */}
              <div className="text-left space-y-3.5 bg-zinc-950/70 border border-zinc-900/60 p-4 rounded-2xl shadow-inner">
                <div>
                  <p className="text-[8px] text-zinc-500 font-black uppercase tracking-widest mb-0.5">Tác Phẩm Điện Ảnh</p>
                  <p className="text-xs font-black text-white uppercase italic tracking-tight line-clamp-1">{selectedOrder.movieTitle}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 border-t border-zinc-900/60 pt-2.5">
                  <div>
                    <p className="text-[8px] text-zinc-500 font-black uppercase tracking-widest mb-0.5">Ngày Chiếu</p>
                    <p className="text-[11px] font-bold text-zinc-200">{selectedOrder.date}</p>
                  </div>
                  <div>
                    <p className="text-[8px] text-zinc-500 font-black uppercase tracking-widest mb-0.5">Suất Chiếu</p>
                    <p className="text-[11px] font-bold text-zinc-200">{selectedOrder.time}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 border-t border-zinc-900/60 pt-2.5">
                  <div>
                    <p className="text-[8px] text-zinc-500 font-black uppercase tracking-widest mb-0.5">Phòng Chiếu</p>
                    <p className="text-[11px] font-black text-red-500 uppercase">{selectedOrder.roomName || "01"}</p>
                  </div>
                  <div>
                    <p className="text-[8px] text-zinc-500 font-black uppercase tracking-widest mb-0.5">Vị Trí Ghế</p>
                    <p className="text-[11px] font-black text-white uppercase tracking-wide truncate">{cleanSeatsDisplay()}</p>
                  </div>
                </div>

                {selectedOrder.orderDetails?.some((d: any) => d.itemType === 'COMBO') && (
                  <div className="border-t border-zinc-900/60 pt-2.5">
                    <p className="text-[8px] text-zinc-500 font-black uppercase tracking-widest mb-1">Combo Bắp Nước Đi Kèm</p>
                    <div className="space-y-0.5 max-h-[44px] overflow-y-auto no-scrollbar">
                      {selectedOrder.orderDetails.filter((d: any) => d.itemType === 'COMBO').map((combo: any) => (
                        <div key={combo.id} className="flex justify-between items-center text-[10px] font-bold text-zinc-400">
                          <span className="truncate max-w-[170px] text-zinc-400">{combo.itemName}</span>
                          <span className="text-red-500 italic">x{combo.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border-t border-zinc-900/60 pt-2.5 flex justify-between items-center text-[9px] font-bold text-zinc-500">
                  <div className="flex items-center gap-1">
                    <CreditCard size={11} />
                    <span className="uppercase">{selectedOrder.paymentMethod}</span>
                  </div>
                  <div className="text-zinc-200 font-black">
                    {selectedOrder.totalAmount?.toLocaleString()}đ
                  </div>
                </div>
              </div>
            </div>

            <div className={`py-3 text-center transition-colors ${selectedOrder.status === 'USED' ? 'bg-zinc-900 text-zinc-600' : 'bg-gradient-to-r from-red-600 to-rose-600 text-white'}`}>
               <p className={`text-[8px] font-black uppercase tracking-[0.25em] ${selectedOrder.status === 'USED' ? '' : 'animate-pulse'}`}>
                 {selectedOrder.status === 'USED' ? 'VÉ NÀY ĐÃ HẾT HIỆU LỰC SỬ DỤNG' : 'ĐƯA MÃ QR CHO NHÂN VIÊN SOÁT VÉ'}
               </p>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}