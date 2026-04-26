"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { apiRequest } from '@/app/lib/api'; 
import toast, { Toaster } from 'react-hot-toast';
import { 
  Loader2, TicketCheck, ChevronLeft, TicketPercent, 
  Tag, Info, Banknote, CreditCard, Wallet, User, MapPin
} from 'lucide-react';

export default function PaymentPage() {
  const router = useRouter();
  const [bookingData, setBookingData] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [selectedVoucher, setSelectedVoucher] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initPage = async () => {
      // 1. Lấy dữ liệu đặt vé từ Session
      const sData = sessionStorage.getItem('booking_data');
      if (!sData) {
        toast.error("Phiên làm việc đã kết thúc!");
        router.push('/');
        return;
      }
      
      const parsedData = JSON.parse(sData);
      setBookingData(parsedData);

      // 2. Lấy Token
      const token = Cookies.get("token") || localStorage.getItem("token");
      
      try {
        if (token) {
          // Lấy thông tin User
          const userRes = await apiRequest('/api/v1/users/me');
          if (userRes.ok) {
            const uResult = await userRes.json();
            setUserData(uResult.data?.user || uResult.data || uResult);
          }

          // FIX: Sử dụng API lấy Voucher của cá nhân người dùng
          const vRes = await apiRequest('/api/v1/vouchers/my-vouchers', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (vRes.ok) {
            const vResult = await vRes.json();
            // Backend thường trả về mảng trực tiếp hoặc nằm trong data
            setVouchers(vResult.data || vResult || []);
          }
        }
      } catch (err) {
        console.error("Lỗi lấy dữ liệu:", err);
      } finally {
        setLoading(false);
      }
    };

    initPage();
  }, [router]);

  const calculateFinalTotal = () => {
    const subTotal = (bookingData?.seatPrice || 0) + (bookingData?.comboPrice || 0);
    // Lưu ý: Backend trả về discountValue hay amount thì bặn nhớ check tên trường nhé
    const discount = selectedVoucher ? (selectedVoucher.discountValue || selectedVoucher.amount || 0) : 0;
    return Math.max(0, subTotal - discount);
  };

  const handleFinalCheckout = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    
    try {
      const token = Cookies.get("token") || localStorage.getItem("token");
      if (!token) {
        toast.error("Vui lòng đăng nhập lại!");
        return;
      }
      
      const payload = {
        showtimeId: Number(bookingData.showtimeId),
        seatIds: bookingData.selectedSeats.map((s: any) => s.id),
        combos: (bookingData.selectedCombos || []).map((c: any) => ({ 
          comboId: c.id, 
          quantity: c.quantity 
        })),
        totalAmount: calculateFinalTotal(),
        paymentMethod: paymentMethod, 
        voucherCode: selectedVoucher?.code || "" 
      };

      const res = await apiRequest(`/api/v1/orders`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      const resData = await res.json();
      
      if (res.ok) {
        toast.success("Đặt vé thành công!");
        sessionStorage.setItem('last_order_success', JSON.stringify(resData.data));
        sessionStorage.removeItem('booking_data');
        router.push(`/booking/success/${resData.data.id}`);
      } else {
        toast.error(resData.message || "Đặt vé thất bại, vui lòng thử lại!");
      }
    } catch (err) { 
      toast.error("Lỗi hệ thống!"); 
    } finally { 
      setIsProcessing(false); 
    }
  };

  if (loading || !bookingData) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-red-600" size={48} />
        <p className="text-zinc-500 font-black uppercase tracking-[0.3em] text-[10px]">Đang chuẩn bị đơn hàng...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-8 font-sans">
      <Toaster position="top-center" />
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* CỘT TRÁI */}
        <div className="lg:col-span-8 space-y-6">
          <button onClick={() => router.back()} className="group flex items-center gap-2 text-zinc-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-[0.2em]">
            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform"/> Quay lại
          </button>

          {/* User Info */}
          <div className="bg-zinc-900/20 border border-white/5 p-8 rounded-[2.5rem] space-y-4 shadow-sm">
            <h3 className="text-xs font-black uppercase italic text-red-600 flex items-center gap-2">
              <User size={14}/> Khách hàng đặt vé
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xl font-[1000] uppercase italic tracking-tighter text-zinc-100">
                  {userData?.fullName || userData?.username || "Nàng thơ hệ thống"}
                </p>
                <p className="text-[10px] text-zinc-500 font-bold tracking-wider">{userData?.email}</p>
              </div>
              <div className="md:text-right">
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">SĐT liên hệ</p>
                <p className="font-bold text-zinc-300">{userData?.phoneNumber || "Chưa cập nhật"}</p>
              </div>
            </div>
          </div>

          {/* Đơn hàng chi tiết */}
          <div className="bg-zinc-900/30 border border-white/5 p-8 rounded-[2.5rem] space-y-8">
            <h3 className="text-xs font-black uppercase italic text-red-600">Đơn hàng của bặn</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-20 h-28 bg-zinc-800 rounded-xl overflow-hidden shrink-0 border border-white/5 shadow-2xl">
                    <img src={bookingData.movieImage} alt="Movie" className="w-full h-full object-cover" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-lg font-[1000] uppercase italic leading-none tracking-tighter text-zinc-100">{bookingData.movieTitle}</p>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase">{bookingData.format} • {bookingData.duration} Phút</p>
                    <div className="flex items-center gap-1 text-[10px] text-red-500 font-black mt-2">
                      <MapPin size={10}/> {bookingData.cinemaName}
                    </div>
                  </div>
                </div>
                <div className="flex gap-8 py-4 border-t border-white/5">
                  <div>
                    <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">Thời gian</p>
                    <p className="text-xs font-bold text-zinc-200">{bookingData.time} | {bookingData.date}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">Phòng</p>
                    <p className="text-xs font-bold text-zinc-200">{bookingData.roomName}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest mb-2">Vị trí ghế ({bookingData.selectedSeats?.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {bookingData.selectedSeats?.map((s: any) => (
                      <span key={s.id} className="px-3 py-1 bg-red-600/10 border border-red-600/20 rounded-lg text-[10px] font-black text-red-500 uppercase">
                        {s.seatRow}{s.seatNumber}
                      </span>
                    ))}
                  </div>
                </div>
                {bookingData.selectedCombos?.length > 0 && (
                  <div>
                    <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest mb-2">Bắp & Nước</p>
                    <div className="space-y-2">
                      {bookingData.selectedCombos.map((c: any) => (
                        <div key={c.id} className="flex justify-between text-[11px] font-bold">
                          <span className="text-zinc-400">{c.name} <span className="text-white italic">x{c.quantity}</span></span>
                          <span className="text-zinc-300">{(c.price * c.quantity).toLocaleString()}đ</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* My Vouchers Section */}
          <div className="bg-zinc-900/20 border border-white/5 p-8 rounded-[2.5rem] space-y-6">
            <h3 className="text-xs font-black uppercase italic text-red-600 flex items-center gap-2">
              <TicketPercent size={14}/> Voucher của tôi
            </h3>
            {vouchers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vouchers.map((v) => (
                  <button 
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVoucher(selectedVoucher?.code === v.code ? null : v)}
                    className={`p-5 rounded-[1.5rem] border text-left transition-all relative overflow-hidden group ${
                      selectedVoucher?.code === v.code ? 'bg-red-600 border-red-600 shadow-xl scale-[1.02]' : 'bg-black/40 border-white/5 hover:border-red-600/40'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-[1000] italic uppercase">{v.code}</span>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded ${selectedVoucher?.code === v.code ? 'bg-black/20 text-white' : 'bg-red-600 text-white'}`}>
                        -{(v.discountValue || v.amount || 0).toLocaleString()}đ
                      </span>
                    </div>
                    <p className="text-[9px] font-bold opacity-60 line-clamp-1 italic">{v.title || v.name}</p>
                    {/* Họa tiết trang trí */}
                    <div className="absolute -right-2 -bottom-2 opacity-10 group-hover:scale-110 transition-transform">
                        <TicketPercent size={40} />
                    </div>
                  </button>
                ))}
              </div>
            ) : (
                <div className="py-6 text-center border border-dashed border-white/10 rounded-3xl">
                    <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest italic">Bạn chưa thu thập mã giảm giá nào</p>
                </div>
            )}
          </div>
        </div>

        {/* CỘT PHẢI: HÓA ĐƠN */}
        <div className="lg:col-span-4">
          <div className="bg-zinc-950 border border-white/10 p-10 rounded-[3.5rem] space-y-8 sticky top-8 shadow-2xl overflow-hidden border-t-red-600/30">
            <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12 pointer-events-none"><Tag size={100} /></div>

            <h2 className="text-3xl font-[1000] italic uppercase tracking-tighter">Tổng <span className="text-red-600">Tiền</span></h2>
            
            <div className="space-y-4 border-y border-white/5 py-8">
              <div className="flex justify-between text-[10px] font-black uppercase text-zinc-500">
                <span>Giá vé:</span> 
                <span className="text-white">{(bookingData.seatPrice || 0).toLocaleString()}đ</span>
              </div>
              <div className="flex justify-between text-[10px] font-black uppercase text-zinc-500">
                <span>Dịch vụ kèm:</span> 
                <span className="text-white">{(bookingData.comboPrice || 0).toLocaleString()}đ</span>
              </div>
              {selectedVoucher && (
                <div className="flex justify-between text-[10px] font-black uppercase text-green-500 bg-green-500/5 p-3 rounded-xl border border-green-500/10">
                  <span>Voucher giảm:</span> 
                  <span>-{(selectedVoucher.discountValue || selectedVoucher.amount || 0).toLocaleString()}đ</span>
                </div>
              )}
              
              <div className="pt-4 space-y-3">
                <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest text-center">Hình thức thanh toán</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'CASH', icon: <Banknote size={16}/> },
                    { id: 'VNPAY', icon: <Wallet size={16}/> },
                    { id: 'BANK', icon: <CreditCard size={16}/> }
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setPaymentMethod(m.id)}
                      className={`flex justify-center py-4 rounded-2xl border transition-all ${
                        paymentMethod === m.id ? 'bg-red-600 text-white border-red-600' : 'bg-white/5 border-white/10 text-zinc-500'
                      }`}
                    >
                      {m.icon}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-8 border-t border-white/10 flex justify-between items-end">
                <span className="text-[10px] font-black uppercase text-zinc-400 pb-1">Phải trả:</span>
                <span className="text-4xl font-[1000] italic text-red-600 tracking-tighter">
                  {calculateFinalTotal().toLocaleString()}đ
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <button 
                onClick={handleFinalCheckout} 
                disabled={isProcessing}
                className="w-full py-6 bg-red-600 rounded-3xl font-[1000] italic uppercase tracking-[0.2em] hover:bg-red-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-2xl active:scale-95"
              >
                {isProcessing ? <Loader2 className="animate-spin" /> : <><TicketCheck size={26}/> Hoàn tất đơn hàng</>}
              </button>
              
              <div className="flex items-start gap-3 p-5 bg-zinc-900/50 rounded-2xl border border-white/5">
                <Info size={16} className="text-zinc-600 mt-1 shrink-0" />
                <p className="text-[8px] text-zinc-500 font-bold uppercase leading-relaxed tracking-tight italic">
                  Bặn vui lòng kiểm tra kỹ đơn hàng trước khi xác nhận. Sau khi đặt, vé sẽ không được hoàn lại dưới mọi hình thức.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}