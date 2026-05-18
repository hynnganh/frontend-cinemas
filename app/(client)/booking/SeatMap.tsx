"use client";
import React, { useRef, useMemo, useCallback } from 'react';
import QuickPinchZoom, { make3dTransformValue } from 'react-quick-pinch-zoom';
import { Heart, Armchair } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

export interface SeatType {
  id: number | string;
  seatRow: string;
  seatNumber: string;
  status: string;
  seatType: string;
  name?: string;
  price?: number;
}

interface SeatMapProps {
  dbSeats: SeatType[];
  selectedSeats: SeatType[];
  onToggleSeat: (seat: SeatType) => void;
}

const SeatMap = ({ dbSeats = [], selectedSeats = [], onToggleSeat }: SeatMapProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. Trích xuất danh sách hàng ghế độc nhất (A, B, C...) và sắp xếp thứ tự
  const uniqueRows = useMemo(() => 
    Array.from(new Set(dbSeats.map(s => s.seatRow))).sort(), 
    [dbSeats]
  );
  
  // 2. Tìm số ghế lớn nhất để thiết lập ma trận bao bọc Grid rạp phim
  const maxSeatsInRow = useMemo(() => 
    Math.max(...dbSeats.map(s => parseInt(s.seatNumber) || 0), 0), 
    [dbSeats]
  );

  // 3. Callback đồng bộ tính toán ma trận ma sát phục vụ tính năng Zoom mượt mà
  const onUpdate = useCallback(({ x, y, scale }: any) => {
    if (containerRef.current) {
      const value = make3dTransformValue({ x, y, scale });
      containerRef.current.style.setProperty('transform', value);
    }
  }, []);

  return (
    <div className="w-full h-full min-h-[800px] relative bg-[#010101] overflow-hidden p-4 md:p-5">
      <Toaster position="top-center" reverseOrder={false} />
      
      <QuickPinchZoom 
        onUpdate={onUpdate} 
        wheelScaleFactor={0.05} 
        draggableUnZoomed={true}
        inertia={true}
        tapZoomFactor={1.5}
      >
        <div 
          ref={containerRef} 
          className="inline-block origin-[0_0] will-change-transform px-3 min-w-full scale-[0.95] md:scale-100 text-center"
        >
          {/* Khu vực màn hình chiếu phim */}
          <div className="max-w-[400px] mx-auto mb-16 relative">
             <div className="w-full h-[3px] bg-red-600 shadow-[0_0_30px_rgba(220,38,38,0.8)] rounded-full"></div>
             <div className="w-full h-24 bg-gradient-to-t from-transparent to-red-600/5 absolute top-0 blur-3xl opacity-40"></div>
             <p className="text-[9px] text-red-600/30 font-black uppercase mt-5 tracking-[1.5em] text-center ml-[1.5em]">Màn hình</p>
          </div>

          {/* Vòng lặp dựng sơ đồ ghế vật lý */}
          <div className="flex flex-col gap-3 items-center justify-center">
            {uniqueRows.map((rowName) => (
              <div key={rowName} className="flex gap-5 items-center">
                <span className="text-[10px] w-6 text-white/10 font-black uppercase text-right select-none">{rowName}</span>
                
                <div className="flex gap-2.5">
                  {Array.from({ length: maxSeatsInRow }, (_, i) => {
                    const currentNum = i + 1;
                    const seatData = dbSeats.find(s => s.seatRow === rowName && parseInt(s.seatNumber) === currentNum);
                    
                    if (!seatData) return <div key={i} className="w-9 h-9 opacity-0" />;

                    const statusStr = String(seatData.status).toUpperCase();
                    const isOccupied = statusStr === 'OCCUPIED' || statusStr === 'SOLD';
                    const isSelected = selectedSeats.some(s => s.id === seatData.id);
                    
                    const type = seatData.seatType?.toUpperCase();
                    const isSweet = type === 'SWEETBOX' || type === 'COUPLE';
                    const isVip = type === 'VIP';
                    const label = seatData.name || `${rowName}${currentNum}`;

                    return (
                      <button
                        key={seatData.id}
                        disabled={isOccupied}
                        onClick={() => onToggleSeat(seatData)}
                        className={`
                          relative transition-all duration-300 flex flex-col items-center justify-center shrink-0 rounded-xl border
                          ${isSweet ? 'w-20 h-10' : 'w-9 h-9'} 
                          ${isOccupied 
                            ? 'bg-transparent border-none text-zinc-800 cursor-not-allowed opacity-20 scale-90' 
                            : isSelected 
                              ? 'bg-red-600 border-red-500 text-white shadow-[0_0_25px_red] scale-110 z-10' 
                              : isSweet
                                ? 'bg-pink-500/5 border-pink-500/30 text-pink-500 hover:border-pink-500 hover:bg-pink-500/10'
                                : isVip
                                  ? 'bg-amber-600/5 border-amber-600/30 text-amber-600 hover:border-amber-600 hover:bg-amber-600/10'
                                  : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-500 hover:text-white'
                          }
                        `}
                      >
                        <div className="flex flex-col items-center gap-0.5">
                          {isSweet ? (
                            <Heart size={14} className={`${isSelected ? 'fill-white' : 'fill-pink-500/40'}`} />
                          ) : (
                            <Armchair size={12} className={`opacity-40 ${isVip && !isSelected ? 'text-amber-600' : ''}`} />
                          )}
                          <span className={`font-black tracking-tighter ${isSweet ? 'text-[8px]' : 'text-[9px]'}`}>
                            {label}
                          </span>
                        </div>
                        
                        {isSelected && (
                          <div className="absolute inset-0 rounded-xl bg-white/10 animate-pulse pointer-events-none" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <span className="text-[10px] w-6 text-white/10 font-black uppercase text-left select-none">{rowName}</span>
              </div>
            ))}
          </div>
          
          <div className="h-40"></div>
        </div>
      </QuickPinchZoom>
    </div>
  );
};

export default SeatMap;