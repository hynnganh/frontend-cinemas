"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { apiRequest } from '@/app/lib/api'; 
import toast, { Toaster } from 'react-hot-toast';
import { 
  Loader2, ChevronLeft, TicketPercent, Tag, Info, 
  CreditCard, Wallet, User, MapPin, Calendar, 
  Clock, Monitor, ShieldCheck
} from 'lucide-react';

export default function PaymentPage() {
  const router = useRouter();
  const [bookingData, setBookingData] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [selectedVoucher, setSelectedVoucher] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState("VNPAY");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initPage = async () => {
      const sData = sessionStorage.getItem('booking_data');
      if (!sData) {
        toast.error("Phiên làm việc đã kết thúc!");
        router.push('/');
        return;
      }
      
      const parsedData = JSON.parse(sData);
      setBookingData(parsedData);

      const token = Cookies.get("token") || localStorage.getItem("token");
      try {
        if (token) {
          const [userRes, vRes] = await Promise.all([
            apiRequest('/api/v1/users/me'),
            apiRequest('/api/v1/vouchers/my-vouchers')
          ]);

          if (userRes.ok) {
            const uResult = await userRes.json();
            setUserData(uResult.data?.user || uResult.data || uResult);
          }

          if (vRes.ok) {
            const vResult = await vRes.json();
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

  // FIX: Hàm tính toán tổng tiền chuẩn xác, làm tròn để khớp Backend
  const calculateTotals = () => {
    const seatPrice = Number(bookingData?.seatPrice) || 0;
    const comboPrice = Number(bookingData?.comboPrice) || 0;
    const subTotal = seatPrice + comboPrice;
    
    const discount = selectedVoucher 
      ? (Number(selectedVoucher.discountValue || selectedVoucher.amount) || 0) 
      : 0;

    // Đảm bảo không âm và làm tròn số nguyên (VNĐ thường không có thập phân)
    const finalTotal = Math.round(Math.max(0, subTotal - discount));

    return { subTotal, discount, finalTotal };
  };

  const { subTotal, discount, finalTotal } = calculateTotals();

  // FIX: Hàm xử lý thanh toán đảm bảo Payload sạch 100%
  const handleFinalCheckout = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    
    try {
      const token = Cookies.get("token") || localStorage.getItem("token");
      if (!token) {
        toast.error("Vui lòng đăng nhập lại!");
        return;
      }
      
      // Lấy giá trị đã tính toán chuẩn
      const { finalTotal: amountToSend } = calculateTotals();

      const payload = {
        showtimeId: Number(bookingData.showtimeId),
        seatIds: bookingData.selectedSeats.map((s: any) => Number(s.id)),
        combos: (bookingData.selectedCombos || []).map((c: any) => ({ 
          comboId: Number(c.id), 
          quantity: Number(c.quantity) 
        })),
        totalAmount: amountToSend, 
        paymentMethod: paymentMethod, 
        // QUAN TRỌNG: Backend check .trim(), nên không được để null/undefined
        voucherCode: selectedVoucher?.code ? String(selectedVoucher.code).trim() : "" 
      };

      console.log(">>> Payload gửi đi:", payload);

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
        toast.success("Đặt vé và thanh toán thành công!");
        sessionStorage.removeItem('booking_data');
        sessionStorage.setItem('last_order_success', JSON.stringify(resData.data));
        router.push(`/booking/payment/${resData.data.id}`);
      } else {
        // Log lỗi chi tiết từ Backend để debug
        console.error("Backend Error:", resData);
        toast.error(resData.message || "Lỗi áp dụng mã giảm giá hoặc dữ liệu không hợp lệ!");
      }
    } catch (err) { 
      console.error("Connection Error:", err);
      toast.error("Lỗi kết nối hệ thống!"); 
    } finally { 
      setIsProcessing(false); 
    }
  };

  if (loading || !bookingData) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-red-600/20 border-t-red-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-zinc-500 font-black uppercase tracking-widest text-[10px]">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-8 font-sans selection:bg-red-600/30">
      <Toaster position="top-center" />
      
      {/* Background Decor - Hiệu ứng nàng thơ Ngọc Anh Beauty */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-600 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[10%] right-[0%] w-[30%] h-[30%] bg-pink-600 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative max-w-7xl mx-auto">
        <button onClick={() => router.back()} className="group flex items-center gap-2 text-zinc-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-[0.2em] mb-10">
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform"/> Quay lại
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* CỘT TRÁI: THÔNG TIN CHI TIẾT */}
          <div className="lg:col-span-8 space-y-6">
            <div className="relative overflow-hidden rounded-[3rem] border border-white/5 bg-zinc-900/20 backdrop-blur-xl p-8 md:p-12">
              <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
                <div className="w-32 h-48 rounded-2xl overflow-hidden shadow-2xl border border-white/10 shrink-0">
                  <img src={bookingData.movieImage} alt="Poster" className="w-full h-full object-cover" />
                </div>
                <div className="text-center md:text-left space-y-4">
                  <span className="px-3 py-1 bg-red-600 rounded text-[9px] font-black uppercase italic">Thanh toán an toàn</span>
                  <h1 className="text-4xl md:text-5xl font-[1000] italic uppercase tracking-tighter leading-none">{bookingData.movieTitle}</h1>
                  <div className="flex flex-wrap justify-center md:justify-start gap-6 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                    <span className="flex items-center gap-2 text-red-500"><Calendar size={12}/> {bookingData.date}</span>
                    <span className="flex items-center gap-2"><Clock size={12}/> {bookingData.time}</span>
                    <span className="flex items-center gap-2"><Monitor size={12}/> {bookingData.roomName}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-zinc-900/20 border border-white/5 p-8 rounded-[2.5rem]">
                <h3 className="text-xs font-black uppercase italic text-red-600 flex items-center gap-2 mb-4"><User size={14}/> Khách hàng</h3>
                <p className="text-xl font-[1000] uppercase italic tracking-tighter text-zinc-100">{userData?.fullName || "Khách hàng"}</p>
                <p className="text-[10px] text-zinc-500 font-bold tracking-wider">{userData?.email}</p>
              </div>

              <div className="bg-zinc-900/20 border border-white/5 p-8 rounded-[2.5rem]">
                <h3 className="text-xs font-black uppercase italic text-red-600 flex items-center gap-2 mb-4"><MapPin size={14}/> Rạp & Ghế</h3>
                <div className="flex flex-wrap gap-2 mb-2">
                  {bookingData.selectedSeats?.map((s: any) => (
                    <span key={s.id} className="px-3 py-1 bg-red-600/10 border border-red-600/20 rounded-lg text-[10px] font-black text-red-500 uppercase">
                      {s.seatRow}{s.seatNumber}
                    </span>
                  ))}
                </div>
                <p className="text-[10px] text-zinc-500 font-bold uppercase">{bookingData.cinemaName}</p>
              </div>
            </div>

            {/* Voucher Selection Section */}
            <div className="bg-zinc-900/20 border border-white/5 p-8 rounded-[2.5rem] space-y-6">
              <h3 className="text-xs font-black uppercase italic text-red-600 flex items-center gap-2"><TicketPercent size={14}/> Voucher ưu đãi</h3>
              {vouchers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {vouchers.map((v) => (
                    <button 
                      key={v.id}
                      onClick={() => setSelectedVoucher(selectedVoucher?.code === v.code ? null : v)}
                      className={`p-5 rounded-[1.5rem] border text-left transition-all relative overflow-hidden group ${
                        selectedVoucher?.code === v.code ? 'bg-red-600 border-red-600 shadow-lg' : 'bg-black/40 border-white/5'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1 relative z-10">
                        <span className="text-sm font-[1000] italic uppercase">{v.code}</span>
                        <span className="text-[9px] font-black bg-black/20 px-2 py-0.5 rounded">-{v.discountValue?.toLocaleString()}đ</span>
                      </div>
                      <p className="text-[9px] font-bold opacity-60 italic relative z-10">Dành cho bạn</p>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-[10px] text-zinc-600 font-black uppercase italic text-center">Không có mã giảm giá khả dụng</p>
              )}
            </div>
          </div>

          {/* CỘT PHẢI: TÓM TẮT ĐƠN HÀNG */}
          <div className="lg:col-span-4">
            <div className="bg-zinc-950 border border-white/10 p-8 rounded-[3rem] space-y-8 sticky top-8 border-t-red-600/30">
              <h2 className="text-3xl font-[1000] italic uppercase tracking-tighter">Hóa <span className="text-red-600">đơn</span></h2>
              
              <div className="space-y-4 py-4">
                <div className="flex justify-between text-[10px] font-black uppercase text-zinc-500">
                  <span>Tạm tính:</span> 
                  <span className="text-white">{subTotal.toLocaleString()}đ</span>
                </div>
                {selectedVoucher && (
                  <div className="flex justify-between text-[10px] font-black uppercase text-green-500 bg-green-500/10 p-3 rounded-xl border border-green-500/20">
                    <span>Giảm giá:</span> 
                    <span>-{discount.toLocaleString()}đ</span>
                  </div>
                )}
                
                <div className="pt-4 space-y-3">
                  <p className="text-[9px] text-zinc-500 font-black uppercase text-center">Phương thức thanh toán</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => setPaymentMethod("VNPAY")} className={`flex flex-col items-center gap-2 py-4 rounded-2xl border transition-all ${paymentMethod === 'VNPAY' ? 'bg-red-600 text-white border-red-600' : 'bg-white/5 border-white/10 text-zinc-500'}`}>
                      <Wallet size={16}/><span className="text-[8px] font-black">VNPAY</span>
                    </button>
                    <button onClick={() => setPaymentMethod("BANK")} className={`flex flex-col items-center gap-2 py-4 rounded-2xl border transition-all ${paymentMethod === 'BANK' ? 'bg-red-600 text-white border-red-600' : 'bg-white/5 border-white/10 text-zinc-500'}`}>
                      <CreditCard size={16}/><span className="text-[8px] font-black">BANK</span>
                    </button>
                  </div>
                </div>

                <div className="pt-8 border-t border-white/10 flex justify-between items-end">
                  <span className="text-[10px] font-black uppercase text-zinc-400">Tổng tiền:</span>
                  <span className="text-4xl font-[1000] italic text-red-600 tracking-tighter">
                    {finalTotal.toLocaleString()}đ
                  </span>
                </div>
              </div>

              <button 
                onClick={handleFinalCheckout} 
                disabled={isProcessing}
                className="w-full py-6 bg-red-600 rounded-[2rem] font-[1000] italic uppercase tracking-[0.2em] hover:bg-red-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50 group shadow-2xl active:scale-95"
              >
                {isProcessing ? <Loader2 className="animate-spin" /> : <><ShieldCheck size={20} className="group-hover:rotate-12 transition-transform"/> Xác nhận đặt vé</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}