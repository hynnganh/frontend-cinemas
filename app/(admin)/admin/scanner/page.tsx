"use client";
import React, { useEffect, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode'; 
import { 
  Camera, 
  RefreshCw, 
  Ticket, 
  CheckCircle2, 
  AlertTriangle, 
  Loader2, 
  Armchair, 
  Coffee, 
  FlipHorizontal, 
  Calendar, 
  MapPin,
  Keyboard,
  Send,
  Clapperboard,
  Tv
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast'; 

export default function StaffScannerPage() {
  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false); 
  const [error, setError] = useState<string | null>(null);
  const [scannerEnabled, setScannerEnabled] = useState(true);
  const [isMirrored, setIsMirrored] = useState(false); 
  
  // State phục vụ tính năng nhập mã vé bằng tay khi camera lỗi
  const [manualCode, setManualCode] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);

  useEffect(() => {
    if (!scannerEnabled) return;

    const html5QrCode = new Html5Qrcode("reader");
    let isMounted = true;

    const startScanner = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 400));
        if (!isMounted) return;

        await html5QrCode.start(
          { facingMode: "environment" }, 
          {
            fps: 15, 
            qrbox: (width, height) => {
              const size = Math.min(width, height) * 0.7;
              return { width: size, height: size };
            }
          },
          async (decodedText) => {
            if (html5QrCode.isScanning) {
              await html5QrCode.stop(); 
            }
            setScannerEnabled(false);
            await fetchOrderDetails(decodedText.trim());
          },
          (errorMessage) => {}
        );
      } catch (err) {
        console.error("Lỗi khởi động camera:", err);
      }
    };

    startScanner();

    return () => {
      isMounted = false;
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop()
          .then(() => html5QrCode.clear())
          .catch((err) => console.error("Lỗi giải phóng camera:", err));
      }
    };
  }, [scannerEnabled]);

  // 1. HÀM QUÉT HOẶC NHẬP TÌM THÔNG TIN VÉ (GET)
  const fetchOrderDetails = async (bookingCode: string) => {
    if (!bookingCode.trim()) {
      toast.error("Vui lòng nhập mã vé trước!");
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token_admin");

      const res = await fetch(`https://akcinema.vercel.app/api/v1/orders/scan?bookingCode=${encodeURIComponent(bookingCode.toUpperCase())}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : ""
        }
      });
      
      const result = await res.json();

      if (res.ok && result.status === 200) {
        setOrderData(result.data);
        toast.success("Xác thực thành công! Vui lòng đối chiếu.");
      } else {
        setError(result.message || "Mã vé không tồn tại hoặc đã hết hiệu lực!");
      }
    } catch (err) {
      setError("Mất kết nối tới máy chủ Backend Spring Boot!");
    } finally {
      setLoading(false);
    }
  };

  // 2. HÀM XỬ LÝ KHI ẤN NÚT XÁC NHẬN BÀN GIAO VÉ (PUT ĐỔI SANG TRẠNG THÁI USED)
  const handleConfirmCheckIn = async () => {
    if (!orderData) return;

    setConfirmLoading(true);
    try {
      const token = localStorage.getItem("token_admin");
      const res = await fetch(`https://akcinema.vercel.app/api/v1/orders/${orderData.id}/confirm-checkin`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : ""
        }
      });

      const result = await res.json();

      if (res.ok && result.status === 200) {
        toast.success("In vé cứng và bàn giao vật phẩm hoàn tất!");
        handleResetScanner();
      } else {
        toast.error(result.message || "Không thể xác nhận soát vé!");
      }
    } catch (err) {
      toast.error("Mất kết nối, không thể cập nhật trạng thái vé!");
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleResetScanner = () => {
    setOrderData(null);
    setError(null);
    setManualCode('');
    setScannerEnabled(true);
  };

  // ================= THUẬT TOÁN PHÂN RÃ SỐ GHẾ ĐỘNG TỪ DATA REPSONSE THẬT 100% =================
  const getSeatStringFromData = () => {
    if (!orderData || !orderData.orderDetails) return "N/A";

    const tickets = orderData.orderDetails.filter((d: any) => d.itemType === 'TICKET');
    if (tickets.length === 0) return "N/A";
    
    // Bóc tách số ghế tự động qua biểu thức chính quy từ chuỗi tên Snapshot thật
    const seatNames = tickets.map((t: any) => {
      const match = t.itemName.match(/Ghế\s+([A-Z0-9]+)/i);
      return match ? match[1] : "...";
    });
    
    seatNames.sort();
    return seatNames.join(", ");
  };

  return (
    <div className="min-h-screen bg-[#040406] text-zinc-100 font-sans p-4 sm:p-8 flex flex-col items-center justify-center relative overflow-hidden select-none w-full">
      <Toaster />
      
      {/* Hiệu ứng Đèn Neon Rực Rỡ Bám Nền */}
      <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-red-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-red-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Header Hệ Thống */}
      <div className="text-center mb-6 max-w-md w-full relative z-10">
        <div className="inline-flex p-3 bg-gradient-to-br from-red-600/20 to-red-900/30 border border-red-600/30 rounded-2xl mb-3 text-red-500 shadow-xl shadow-red-950/40">
          <Camera size={24} className="animate-pulse" />
        </div>
        <h1 className="text-xl font-[1000] uppercase tracking-widest text-white flex items-center justify-center gap-2 italic">
          A&K CINEMA <span className="text-red-600 bg-red-950/50 border border-red-600/30 px-2 py-0.5 rounded-lg text-xs font-black tracking-normal not-italic">POS SCANNER</span>
        </h1>
        <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em] mt-1.5">Kiểm tra & Bàn giao vé tại quầy</p>
      </div>

      <div className="max-w-md w-full bg-zinc-950/80 border border-zinc-900 rounded-[2.5rem] p-6 backdrop-blur-2xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] relative z-10">
        
        {/* KHU VỰC CAMERA QUÉT & NHẬP TAY */}
        {scannerEnabled && !loading && !orderData && !error && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col items-center relative">
              <div className="w-full relative overflow-hidden rounded-[2rem] border border-zinc-800/80 bg-black shadow-2xl aspect-square">
                <div 
                  id="reader" 
                  className={`w-full h-full transition-transform duration-300 ${isMirrored ? 'scale-x-[-1]' : 'scale-x-1'}`}
                />
                {/* Khung ngắm Neon */}
                <div className="absolute inset-0 pointer-events-none border-[20px] border-black/50 flex items-center justify-center">
                  <div className="absolute top-2 left-2 w-8 h-8 border-t-4 border-l-4 border-red-600 rounded-tl-xl" />
                  <div className="absolute top-2 right-2 w-8 h-8 border-t-4 border-r-4 border-red-600 rounded-tr-xl" />
                  <div className="absolute bottom-2 left-2 w-8 h-8 border-b-4 border-l-4 border-red-600 rounded-bl-xl" />
                  <div className="absolute bottom-2 right-2 w-8 h-8 border-b-4 border-r-4 border-red-600 rounded-br-xl" />
                  <div className="w-[85%] h-[2px] bg-gradient-to-r from-transparent via-red-500 to-transparent absolute top-0 animate-[bounce_2s_infinite] shadow-[0_0_15px_#dc2626]" />
                </div>
              </div>

              <div className="w-full flex justify-between items-center mt-4 px-1">
                <p className="text-[9px] uppercase font-black tracking-widest text-zinc-500 italic">
                  Dí sát mã QR trên Email vào khung kính
                </p>
                <button 
                  onClick={() => setIsMirrored(!isMirrored)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all text-[9px] font-black uppercase tracking-wider"
                >
                  <FlipHorizontal size={12} />
                  <span>{isMirrored ? "Tắt đảo kính" : "Lật đảo kính"}</span>
                </button>
              </div>
            </div>

            {/* ĐƯỜNG PHÂN CÁCH NHẬP TAY */}
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-zinc-900"></div>
              <span className="flex-shrink mx-4 text-[9px] font-black text-zinc-600 uppercase tracking-widest">Hoặc Nhập Thủ Công</span>
              <div className="flex-grow border-t border-zinc-900"></div>
            </div>

            {/* Ô NHẬP MÃ VÉ BẰNG TAY PHÒNG CAMERA LỖI */}
            <div className="space-y-2">
              <button 
                onClick={() => setShowManualInput(!showManualInput)}
                className="w-full h-11 bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-900 hover:border-zinc-800 text-zinc-400 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <Keyboard size={14} />
                <span>{showManualInput ? "Ẩn khung nhập chữ" : "Nhập mã vé bằng tay"}</span>
              </button>

              {showManualInput && (
                <div className="flex gap-2 animate-in slide-in-from-top-3 duration-200">
                  <input 
                    type="text" 
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder="VÍ DỤ: A7FX29JK"
                    className="flex-1 bg-black border border-zinc-800 rounded-xl px-4 text-xs font-black tracking-widest text-center text-white focus:outline-none focus:border-red-600 uppercase transition-all"
                  />
                  <button 
                    onClick={() => {
                      setScannerEnabled(false);
                      fetchOrderDetails(manualCode);
                    }}
                    className="p-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all shadow-lg shadow-red-900/30 flex items-center justify-center"
                  >
                    <Send size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* LOADING LIÊN LẠC MÁY CHỦ */}
        {loading && (
          <div className="py-24 flex flex-col items-center justify-center gap-4">
            <div className="relative flex items-center justify-center">
              <div className="absolute w-14 h-14 border-4 border-red-600/10 rounded-full" />
              <Loader2 className="animate-spin text-red-600 relative z-10" size={44} strokeWidth={3} />
            </div>
            <span className="text-[10px] uppercase font-black tracking-[0.25em] text-red-500 animate-pulse">Đang bóc tách dữ liệu hệ thống...</span>
          </div>
        )}

        {/* THÔNG BÁO VÉ SAI / LỖI / KHÔNG HỢP LỆ */}
        {error && !loading && (
          <div className="py-6 flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
            <div className="p-4 bg-red-600/10 border border-red-600/20 text-red-500 rounded-2xl mb-4 shadow-2xl shadow-red-950/50">
              <AlertTriangle size={36} />
            </div>
            <h2 className="text-sm font-black text-white uppercase tracking-wider mb-2">Xác Thực Thất Bại</h2>
            <p className="text-zinc-500 text-[11px] px-4 mb-6 font-semibold leading-relaxed">{error}</p>
            <button 
              onClick={handleResetScanner}
              className="w-full h-12 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw size={12} /> Quay lại màn hình camera
            </button>
          </div>
        )}

        {/* GIAO DIỆN HIỂN THỊ CHI TIẾT VÉ VÀ COMBO (ĐÃ ĐỔ 100% DATA REAL TỪ BACKEND) */}
        {orderData && !loading && (
          <div className="space-y-5 animate-in fade-in zoom-in-95 duration-300">
            
            <div className="flex items-center gap-3 p-3.5 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl text-emerald-400 shadow-lg shadow-emerald-950/20">
              <CheckCircle2 size={20} className="shrink-0" />
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Mã Vé Hợp Lệ</h4>
                <p className="text-[9px] text-emerald-500/70 font-black uppercase leading-none">Hóa đơn: #{orderData.id} • Trạng thái: {orderData.status}</p>
              </div>
            </div>

            {/* THÔNG TIN CHI TIẾT PHIM ĐỌC ĐỘNG TỪ PHẢN HỒI THẬT CỦA API */}
            <div className="bg-gradient-to-b from-zinc-900/70 to-zinc-950 border border-zinc-900 rounded-3xl p-5 relative overflow-hidden space-y-4">
              {/* Răng cưa cuống vé rìa trái */}
              <div className="absolute top-0 bottom-0 left-[-6px] w-3 flex flex-col justify-between my-3 pointer-events-none">
                {[...Array(8)].map((_, i) => <div key={i} className="w-2 h-2 bg-[#060608] rounded-full border-r border-zinc-900" />)}
              </div>

              <div className="pl-3 space-y-3">
                <div>
                  <span className="text-[9px] font-black text-red-500 uppercase tracking-widest flex items-center gap-1">
                    <Clapperboard size={10} /> Tác Phẩm Điện Ảnh
                  </span>
                  {/* Đọc 100% data thật từ trường bồi của vỏ Backend */}
                  <h2 className="text-base font-black text-white uppercase tracking-tight italic mt-0.5 line-clamp-1">
                    {orderData.movieTitle || "N/A"}
                  </h2>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-zinc-900 pt-3">
                  <div>
                    <span className="text-[9px] text-zinc-500 font-black uppercase tracking-wider block">Ngày Chiếu</span>
                    {/* Đọc 100% data thật */}
                    <span className="text-xs font-bold text-zinc-200">{orderData.date || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-zinc-500 font-black uppercase tracking-wider block">Suất Chiếu</span>
                    {/* Đọc 100% data thật */}
                    <span className="text-xs font-bold text-zinc-200">{orderData.time || "N/A"}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-zinc-900 pt-3">
                  <div>
                    <span className="text-[9px] text-zinc-500 font-black uppercase tracking-wider block">Phòng Chiếu</span>
                    {/* Đọc 100% data thật */}
                    <span className="text-sm font-black text-red-500 uppercase flex items-center gap-1 mt-0.5">
                      <Tv size={11} /> {orderData.roomName || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-zinc-500 font-black uppercase tracking-wider block">Vị Trí Ghế</span>
                    {/* Quét động chuỗi text bóc số ghế thật */}
                    <span className="text-sm font-black text-white tracking-wide block mt-0.5">
                      {getSeatStringFromData()}
                    </span>
                  </div>
                </div>

                {orderData.cinemaName && (
                  <div className="flex items-start gap-2 border-t border-zinc-900 pt-3 text-[10px]">
                    <MapPin size={12} className="text-zinc-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[9px] text-zinc-500 font-black uppercase tracking-wider">Cụm rạp tiếp nhận</p>
                      <p className="font-bold text-zinc-300 mt-0.5">{orderData.cinemaName}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* DANH SÁCH VẬT PHẨM BÀN GIAO CHI TIẾT TỪ DATABASE */}
            <div className="space-y-2">
              <p className="text-[9px] uppercase font-black tracking-widest text-zinc-500 pl-1">Danh sách dịch vụ cần bàn giao:</p>
              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
                {orderData.orderDetails?.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-zinc-900/30 border border-zinc-900/60 rounded-2xl transition-all hover:bg-zinc-900/60">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl border ${
                        item.itemType === 'TICKET' 
                          ? 'bg-amber-500/5 text-amber-500 border-amber-500/10' 
                          : 'bg-pink-500/5 text-pink-500 border-pink-500/10'
                      }`}>
                        {item.itemType === 'TICKET' ? <Armchair size={15} /> : <Coffee size={15} />}
                      </div>
                      <div>
                        <p className="text-[11px] font-black text-white uppercase tracking-wide leading-tight">
                          {item.itemName}
                        </p>
                        <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-wider mt-0.5">Loại hình: {item.itemType}</p>
                      </div>
                    </div>
                    <div className="px-3 py-1 bg-red-600/10 border border-red-600/20 text-red-500 rounded-xl text-xs font-black italic">
                      x{item.quantity}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* DOANH THU HÓA ĐƠN THẬT */}
            <div className="p-4 bg-[#0a0a0f] border border-zinc-900 rounded-2xl flex justify-between items-center">
              <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">Tổng doanh thu hóa đơn</span>
              <span className="text-base font-black text-white italic tracking-tight">
                {orderData.totalAmount?.toLocaleString()}đ
              </span>
            </div>

            {/* NÚT BẤM HOÀN TẤT IN VÉ THƯƠNG MẠI */}
            <div className="flex gap-2.5 pt-1">
              <button 
                onClick={handleResetScanner}
                className="px-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest"
              >
                Hủy
              </button>
              <button 
                onClick={handleConfirmCheckIn}
                disabled={confirmLoading}
                className="flex-1 h-12 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 shadow-xl shadow-red-950/40 active:scale-[0.99] disabled:opacity-50"
              >
                {confirmLoading ? (
                  <Loader2 className="animate-spin" size={14} />
                ) : (
                  <Ticket size={14} strokeWidth={3} />
                )}
                <span>{confirmLoading ? "Đang ghi nhận..." : "Xác nhận & In vé cứng"}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        #reader video {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important; 
          border-radius: 1.5rem !important;
        }
        #reader { border: none !important; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #222; border-radius: 10px; }
      `}</style>
    </div>
  );
}