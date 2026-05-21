"use client";

import React, { useState, useEffect } from 'react';
import { Loader2, X, Ticket as TicketIcon, Check, AlertTriangle, Calendar, Clock, MapPin, Film } from 'lucide-react';
import { apiRequest } from '@/app/lib/api'; 
import { QRCodeSVG } from 'qrcode.react';
import { Toaster } from 'react-hot-toast';
import OrderTicketItem from './OrderTicketItem';

const checkIsExpired = (dateStr: string, timeStr: string) => {
  if (!dateStr || !timeStr) return false;
  const [day, month, year] = dateStr.split('/').map(Number);
  const startTime = timeStr.split('-')[0].trim(); 
  const [hours, minutes] = startTime.split(':').map(Number);
  const movieTime = new Date(year, month - 1, day, hours, minutes);
  return movieTime < new Date();
};

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
        console.error("Lỗi lấy lịch sử vé: ", err); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchOrderHistory();
  }, []);

  const filteredOrders = orders.filter(o => {
    const isExpired = o.status === 'PAID' && checkIsExpired(o.date, o.time);
    if (activeFilter === 'upcoming') {
      return o.status === 'PAID' && !isExpired;
    }
    if (activeFilter === 'done') {
      return o.status === 'USED' || isExpired;
    }
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

  const isSelectedExpired = selectedOrder && selectedOrder.status === 'PAID' && checkIsExpired(selectedOrder.date, selectedOrder.time);
  const isSelectedUsed = selectedOrder && selectedOrder.status === 'USED';

  return (
    <div className="min-h-screen bg-[#040406] text-white px-4 sm:px-6 lg:px-64 py-12 relative overflow-hidden">
      <Toaster />
      
      {/* Hiệu ứng mờ góc nền Điện ảnh */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-red-600/5 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-red-600/5 rounded-full blur-[130px] pointer-events-none" />

      {/* Header điều hướng */}
      <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-zinc-900 pb-8 relative z-10">
        <div>
           <h2 className="text-3xl font-black uppercase tracking-tighter italic">Vé điện tử <span className="text-red-500">của tôi</span></h2>
           <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-1.5">Hệ thống quản lý vé thông minh</p>
        </div>

        {/* Nút chuyển đổi bộ lọc */}
        <div className="flex bg-zinc-950 p-1 rounded-2xl border border-zinc-900 gap-1 shadow-inner self-start sm:self-auto">
          {[
            { id: 'upcoming', label: 'Vé sắp xem' },
            { id: 'done', label: 'Lịch sử xem' }
          ].map((tab) => (
            <button 
              key={tab.id} 
              onClick={() => setActiveFilter(tab.id)} 
              className={`px-5 py-2 rounded-xl text-[11px] font-black uppercase transition-all duration-300 whitespace-nowrap ${
                activeFilter === tab.id 
                  ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' 
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* DANH SÁCH VÉ */}
      {loading ? (
        <div className="flex justify-center py-24"><Loader2 className="animate-spin text-red-500" size={32} strokeWidth={2.5} /></div>
      ) : (
        <div className="space-y-1 max-h-[72vh] overflow-y-auto pr-1 no-scrollbar pb-20 relative z-10">
          {filteredOrders.length === 0 ? (
            <div className="py-24 text-center border border-dashed border-zinc-800 rounded-[2.5rem] bg-zinc-950/20 backdrop-blur-sm">
              <TicketIcon className="mx-auto text-zinc-700 mb-4" size={36} />
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Không có dữ liệu vé tương ứng</p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div key={order.id} className="transition-all duration-300">
                <OrderTicketItem order={order} onOpenDetail={(o) => setSelectedOrder(o)} />
              </div>
            ))
          )}
        </div>
      )}

{/* MODAL CHI TIẾT VÉ - BỐ CỤC NGANG ĐIỆN ẢNH */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 select-none">
          {/* Lớp nền mờ */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300" onClick={() => setSelectedOrder(null)} />
          
          {/* Container chính dạng Ngang (Chống tràn 100%) */}
          <div className="relative bg-zinc-950 border border-zinc-850 rounded-[2rem] w-full max-w-2xl max-h-[85vh] shadow-[0_0_60px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-200 z-10">
            
            {/* Nút đóng góc trên phải */}
            <button 
              onClick={() => setSelectedOrder(null)} 
              className="absolute top-4 right-4 z-30 p-2 rounded-full bg-zinc-900/80 border border-zinc-800 text-zinc-400 hover:text-white transition-all shadow-md hover:scale-105 active:scale-95"
            >
              <X size={14} strokeWidth={2.5}/>
            </button>

            {/* VẾ KHÁCH HÀNG (BÊN TRÁI): THÔNG TIN PHIM */}
            <div className="flex-1 p-6 md:p-8 flex flex-col justify-between overflow-y-auto no-scrollbar">
              <div className="space-y-5">
                {/* Header nhỏ */}
                <div className="flex items-center gap-1.5 text-[10px] font-black tracking-[0.25em] text-zinc-500 uppercase">
                  <Film size={12} className="text-red-500" />
                  A&K Cinema Pass
                </div>

                {/* Tên phim */}
                <div>
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">Tác phẩm điện ảnh</span>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight leading-tight">
                    {selectedOrder.movieTitle}
                  </h3>
                </div>

                {/* Chi tiết suất chiếu & Ghế */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-4 pt-4 border-t border-zinc-900">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1 text-[9px] font-bold text-zinc-500 uppercase tracking-wider">
                      <Calendar size={11} className="text-zinc-400" />
                      Ngày chiếu
                    </div>
                    <span className="text-sm font-extrabold text-zinc-200 mt-1">{selectedOrder.date}</span>
                  </div>

                  <div className="flex flex-col">
                    <div className="flex items-center gap-1 text-[9px] font-bold text-zinc-500 uppercase tracking-wider">
                      <Clock size={11} className="text-zinc-400" />
                      Suất chiếu
                    </div>
                    <span className="text-sm font-extrabold text-zinc-200 mt-1">{selectedOrder.time}</span>
                  </div>

                  <div className="flex flex-col">
                    <div className="flex items-center gap-1 text-[9px] font-bold text-zinc-500 uppercase tracking-wider">
                      <MapPin size={11} className="text-zinc-400" />
                      Phòng chiếu
                    </div>
                    <span className="text-sm font-black text-red-500 mt-1 uppercase tracking-wide">
                      {selectedOrder.roomName || "PHÒNG 01"}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <div className="flex items-center gap-1 text-[9px] font-bold text-zinc-500 uppercase tracking-wider">
                      <Film size={11} className="text-zinc-400" />
                      Vị trí ghế
                    </div>
                    <span className="text-xs font-black text-zinc-100 mt-1 tracking-wide bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-md w-fit min-w-[40px] text-center shadow-inner">
                      {cleanSeatsDisplay()}
                    </span>
                  </div>
                </div>

                {/* Hiển thị Combo nếu có */}
                {selectedOrder.orderDetails?.some((d: any) => d.itemType === 'COMBO') && (
                  <div className="border-t border-zinc-900 pt-4">
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block mb-2">Combo đi kèm</span>
                    <div className="space-y-1.5 max-h-[60px] overflow-y-auto pr-0.5 no-scrollbar">
                      {selectedOrder.orderDetails.filter((d: any) => d.itemType === 'COMBO').map((combo: any) => (
                        <div key={combo.id} className="flex justify-between items-center text-xs font-semibold text-zinc-400">
                          <span className="truncate max-w-[200px]">{combo.itemName}</span>
                          <span className="text-pink-500 font-bold bg-pink-950/20 px-2 py-0.5 rounded border border-pink-900/30 text-[10px]">x{combo.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Status Bar phía dưới bên trái */}
              <div className={`mt-6 py-2 px-4 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] border text-center md:text-left w-fit ${
                (isSelectedUsed || isSelectedExpired) 
                  ? 'bg-zinc-900/40 text-zinc-500 border-zinc-900' 
                  : 'bg-red-950/20 text-red-400 border-red-900/30 animate-pulse'
              }`}>
                {isSelectedUsed 
                  ? 'VÉ ĐÃ QUA SOÁT VÉ' 
                  : isSelectedExpired 
                    ? 'VÉ HẾT HẠN SUẤT CHIẾU' 
                    : 'HỆ THỐNG VÉ ĐIỆN TỬ CHÍNH THỨC'}
              </div>
            </div>

            {/* ĐƯỜNG CHIA ĐỨT ĐOẠN / RĂNG CƯA GIỮA VÉ VÀ CUỐNG VÉ */}
            <div className="hidden md:flex flex-col justify-between py-6 relative w-[1px] border-r border-dashed border-zinc-800">
              <div className="absolute -top-3 -left-2.5 w-5 h-5 rounded-full bg-[#040406] border-b border-zinc-850" />
              <div className="absolute -bottom-3 -left-2.5 w-5 h-5 rounded-full bg-[#040406] border-t border-zinc-850" />
            </div>

            {/* CUỐNG VÉ KIỂM SOÁT (BÊN PHẢI): QR CODE */}
            <div className={`w-full md:w-64 p-6 md:p-8 flex flex-col items-center justify-center border-t md:border-t-0 border-zinc-900 shrink-0 ${
              (isSelectedUsed || isSelectedExpired) ? 'bg-zinc-950' : 'bg-gradient-to-b md:bg-gradient-to-l from-red-950/[0.05] to-transparent'
            }`}>
              {/* Vùng chứa QR */}
              <div className="relative p-3 rounded-2xl bg-zinc-900 border border-zinc-800/60 shadow-inner">
                <div className={`bg-white p-3 rounded-xl shadow-md transition-all duration-300 ${
                  (isSelectedUsed || isSelectedExpired) ? 'opacity-25 grayscale blur-[0.5px]' : ''
                }`}>
                  <QRCodeSVG value={getModalBookingCode()} size={130} level="H" includeMargin={false} />
                </div>
                
                {/* Stamp đè lên khi hết hạn/đã dùng */}
                {(isSelectedUsed || isSelectedExpired) && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-4 rotate-[-12deg]">
                    <div className={`border-2 backdrop-blur-sm px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-2xl ${
                      isSelectedExpired ? 'border-amber-500 bg-zinc-950/95 text-amber-500' : 'border-emerald-500 bg-zinc-950/95 text-emerald-400'
                    }`}>
                      {isSelectedExpired ? <AlertTriangle size={13} className="stroke-[2.5]" /> : <Check size={13} className="stroke-[2.5]" />}
                      <span className="text-[10px] font-black uppercase tracking-[0.15em]">
                        {isSelectedExpired ? 'HẾT HẠN' : 'ĐÃ DÙNG'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Mã chữ số dưới QR */}
              <div className="mt-4 flex flex-col items-center w-full">
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Mã đặt vé</span>
                <div className={`px-4 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800/50 font-mono text-xs font-black tracking-[0.2em] shadow-sm bg-gradient-to-b from-zinc-900 to-zinc-950 text-center w-full max-w-[180px] ${
                  (isSelectedUsed || isSelectedExpired) ? 'text-zinc-600 line-through decoration-zinc-700' : 'text-zinc-200'
                }`}>
                  {getModalBookingCode()}
                </div>
              </div>

              {/* Dòng nhắc nhở soát vé cho nhân viên */}
              <p className={`mt-5 text-[9px] font-bold text-center tracking-wide ${
                (isSelectedUsed || isSelectedExpired) ? 'text-zinc-600' : 'text-zinc-400'
              }`}>
                {isSelectedUsed || isSelectedExpired ? 'Vé không còn giá trị' : 'Đưa mã này cho nhân viên quầy soát vé'}
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