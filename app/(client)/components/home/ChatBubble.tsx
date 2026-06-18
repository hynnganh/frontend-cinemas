"use client";
import React, { useState, useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs'; 
import { MessageCircle, X, Send, Bot, UserSquare, Loader2, Film, ArrowRight, Move, MapPin, RefreshCcw, Trash2 } from 'lucide-react';
import Link from 'next/link';

import { apiRequest, BASE_URL } from '../../../lib/api'; 

interface ChatMessage {
  sender: string;
  content: string;
  senderRole: string;
  receiverRole?: string; 
  timestamp?: string;
  cinemaItemId?: number | null; 
}

interface Cinema {
  id: number;
  name: string;
}

interface CinemaItem {
  id: number;
  name: string;
  city: string;
  cinema?: Cinema; 
  cinemaId?: number; 
}

export default function ChatBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [chatMode, setChatMode] = useState<"BOT" | "ADMIN">("BOT"); 
  
  const [botMessages, setBotMessages] = useState<ChatMessage[]>([]);
  const [adminMessages, setAdminMessages] = useState<ChatMessage[]>([]);
  const [isChatClosed, setIsClosed] = useState(false);
  
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [cinemaItems, setCinemaItems] = useState<CinemaItem[]>([]);
  const [selectedParentCinema, setSelectedParentCinema] = useState<Cinema | null>(null);
  const [selectedCinemaId, setSelectedCinemaId] = useState<number | null>(null);
  const [isLoadingCinemas, setIsLoadingCinemas] = useState(false);

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const stompClientRef = useRef<Client | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const [roomId] = useState(() => {
    if (typeof window !== 'undefined') {
      let savedRoom = localStorage.getItem("guest_room_id");
      if (!savedRoom) {
        savedRoom = "ROOM_" + Math.random().toString(36).substring(2, 9).toUpperCase();
        localStorage.setItem("guest_room_id", savedRoom);
      }
      return savedRoom;
    }
    return "ROOM_TEMP";
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [botMessages, adminMessages, isOpen, chatMode, selectedCinemaId, isChatClosed]);

  useEffect(() => {
    if (isOpen && typeof window !== 'undefined' && position.x === 0 && position.y === 0) {
      setPosition({ x: window.innerWidth - 390, y: window.innerHeight - 600 });
    }
  }, [isOpen]);

  const resetAutoCloseTimeout = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (chatMode !== "ADMIN" || !selectedCinemaId || isChatClosed) return;

    timeoutRef.current = setTimeout(() => {
      handleCloseChatBySystem();
    }, 180000);
  };

  const handleCloseChatBySystem = async () => {
    try {
      await apiRequest(`/api/v1/chat/close/${roomId}`, { method: 'POST' });
    } catch (e) {
      console.error("Lỗi đóng cuộc chat tự động", e);
    }
  };

  const handleUserActiveCancel = async () => {
    if (window.confirm("Bạn có chắc chắn muốn kết thúc hỗ trợ từ quản lý rạp?")) {
      await handleCloseChatBySystem();
      setSelectedCinemaId(null);
      setSelectedParentCinema(null);
      setAdminMessages([]);
      setIsClosed(false);
    }
  };

  useEffect(() => {
    if (isOpen && cinemas.length === 0 && cinemaItems.length === 0) {
      setIsLoadingCinemas(true);
      Promise.all([
        apiRequest('/api/v1/cinemas').then(res => res.json()).catch(() => []),
        apiRequest('/api/v1/cinema-items').then(res => res.json()).catch(() => [])
      ]).then(([parentData, childData]) => {
        const safeParents = Array.isArray(parentData) ? parentData : (parentData?.data || parentData?.content || []);
        const safeChildren = Array.isArray(childData) ? childData : (childData?.data || childData?.content || []);
        
        const activeParentIds = new Set(
          safeChildren
            .map((child: any) => child.cinema?.id || child.cinemaId || child.cinema)
            .filter((id: number | null | undefined) => id !== null && id !== undefined)
        );

        setCinemas(safeParents.filter((parent: any) => activeParentIds.has(parent.id)));
        setCinemaItems(safeChildren);
        setIsLoadingCinemas(false);
      }).catch(() => setIsLoadingCinemas(false));
    }
  }, [isOpen]);

  const connectWebSocket = () => {
    if (stompClientRef.current?.active) return;
    setIsConnecting(true);
    
    const client = new Client({
      webSocketFactory: () => new SockJS(`${BASE_URL}/ws`),
      reconnectDelay: 5000,
    });

    client.onConnect = function () {
      setIsConnecting(false);
      
      client.subscribe(`/topic/room/${roomId}`, (msg) => {
        const newMsg: ChatMessage = JSON.parse(msg.body);
        
        if (newMsg.content === "[SYSTEM_CLOSE]") {
          setIsClosed(true);
          return;
        }

        if (newMsg.receiverRole === "BOT" || newMsg.senderRole === "BOT") {
          setBotMessages((prev) => [...prev, newMsg]);
        } else {
          setAdminMessages((prev) => [...prev, newMsg]);
          resetAutoCloseTimeout(); 
        }
      });

      apiRequest(`/api/v1/chat/history/${roomId}`)
        .then(res => res.json())
        .then((data: ChatMessage[]) => {
          if (data && data.length > 0) {
            const hasCloseSignal = data.some(m => m.content === "[SYSTEM_CLOSE]");
            setIsClosed(hasCloseSignal);

            setBotMessages(data.filter(m => m.receiverRole === "BOT" || m.senderRole === "BOT"));
            setAdminMessages(data.filter(m => (m.receiverRole === "ADMIN" || m.senderRole === "ADMIN") && m.content !== "[SYSTEM_CLOSE]"));
          }
        }).catch(err => console.error(err));
    };

    client.activate();
    stompClientRef.current = client;
  };

  const handleOpenChat = () => {
    setIsOpen(true);
    connectWebSocket();
  };

  const sendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || !stompClientRef.current || !stompClientRef.current.connected || isChatClosed) return;

    const payload = {
      roomId: roomId,
      sender: "Khách Hàng",
      content: inputValue,
      senderRole: "USER",
      receiverRole: chatMode,
      cinemaItemId: chatMode === "ADMIN" ? selectedCinemaId : null
    };

    stompClientRef.current.publish({
      destination: "/app/chat.sendMessage",
      body: JSON.stringify(payload)
    });
    
    setInputValue("");
    resetAutoCloseTimeout();
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('.btn-close-chat')) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    let newX = e.clientX - dragStart.current.x;
    let newY = e.clientY - dragStart.current.y;
    if (typeof window !== 'undefined') {
      newX = Math.max(0, Math.min(newX, window.innerWidth - 380));
      newY = Math.max(0, Math.min(newY, window.innerHeight - 560));
    }
    setPosition({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  const renderMessageContent = (text: string, role: string) => {
    if (role === "USER") return text.split('\n').map((item, i) => <span key={i}>{item}<br/></span>);
    
    const parts = text.split(/(\$\$MOVIE\|[^$]+\$\$|\$\$SEEMORE\$\$)/g);
    
    const parseInlineFormat = (rawText: string) => {
      const subParts = rawText.split(/(\*\*[^*]+\*\*)/g);
      return subParts.map((subPart, subIdx) => {
        if (subPart.startsWith('**') && subPart.endsWith('**')) {
          return <strong key={subIdx} className="font-extrabold text-white mx-0.5 drop-shadow-sm">{subPart.slice(2, -2)}</strong>;
        }
        return subPart.split('\n').map((line, lineIdx) => (
          <React.Fragment key={`${subIdx}-${lineIdx}`}>{line}{lineIdx < subPart.split('\n').length - 1 && <br />}</React.Fragment>
        ));
      });
    };

    return parts.map((part, index) => {
      if (part.startsWith('$$MOVIE|')) {
        const cleanPart = part.replace('$$MOVIE|', '').replace(/\$\$$/, ''); 
        const [id, title, ...posterUrlParts] = cleanPart.split('|');
        const poster = posterUrlParts.join('|'); 

        return (
          <Link href={`/movies/${id}`} key={index} className="block mt-2 mb-2 group">
            <div className="relative flex items-center bg-zinc-900 border border-zinc-700/50 p-2.5 rounded-xl overflow-hidden transition-all duration-300 transform group-hover:-translate-y-1 group-hover:border-red-500/50 group-hover:shadow-[0_8px_20px_rgba(220,38,38,0.25)]">
              <img src={poster} alt={title} className="w-14 h-20 object-cover rounded-lg shadow-md bg-zinc-800" />
              <div className="flex-1 ml-3">
                <h4 className="text-zinc-100 font-black text-[13px] leading-tight line-clamp-2 mb-1">{title}</h4>
                <p className="text-[10px] text-zinc-400 font-bold uppercase flex items-center gap-1.5 group-hover:text-red-400 transition-colors">
                  <Film size={12}/> Đặt vé ngay
                </p>
              </div>
            </div>
          </Link>
        );
      }
      if (part === '$$SEEMORE$$') {
        return (
          <Link href="/movies" key={index} className="block mt-3 mb-1">
            <div className="w-full py-2.5 bg-gradient-to-r from-zinc-900 to-zinc-950 border border-zinc-800 hover:border-red-600/50 text-center rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg flex items-center justify-center gap-2 group">
              <span className="text-[11px] font-black text-red-500 uppercase tracking-widest group-hover:text-red-400">Khám phá kho phim</span>
              <ArrowRight size={14} className="text-red-500 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        );
      }
      return <React.Fragment key={index}>{parseInlineFormat(part)}</React.Fragment>;
    });
  };

  const activeMessages = chatMode === "BOT" ? botMessages : adminMessages;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end select-none">
      <div 
        className={`fixed bg-[#0a0a0c]/95 backdrop-blur-2xl border border-white/5 rounded-[2rem] shadow-[0_30px_80px_-15px_rgba(0,0,0,1)] flex flex-col overflow-hidden transform transition-all ${isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"}`}
        style={{ width: "380px", height: "560px", left: `${position.x}px`, top: `${position.y}px`, transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.1), opacity 0.4s, left 0.1s ease-out, top 0.1s ease-out' }}
      >
        <div onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} className="bg-gradient-to-r from-red-600 to-rose-700 p-4 flex justify-between items-center relative overflow-hidden shadow-lg cursor-move touch-none shrink-0">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="flex items-center gap-3 relative z-10 pointer-events-none">
            <div className="w-12 h-12 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 p-2 shadow-inner">
              <img src="https://i.imgur.com/k9B9JqP.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-[1000] text-white text-[15px] tracking-widest uppercase italic drop-shadow-md">A&K Nexus</h3>
                <Move size={12} className="text-white/40" />
              </div>
              <p className="text-[10px] text-red-100 font-bold flex items-center gap-1.5 tracking-widest mt-0.5 uppercase">
                <span className={`w-1.5 h-1.5 rounded-full ${isConnecting ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400 shadow-[0_0_8px_#34d399]'}`}></span>
                {isConnecting ? "Đang kết nối..." : "Hệ thống Online"}
              </p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="btn-close-chat w-8 h-8 flex items-center justify-center rounded-full bg-black/20 text-white hover:bg-black/40 transition-all relative z-10 active:scale-90 border border-transparent hover:border-white/10"><X size={16} strokeWidth={2.5} /></button>
        </div>

        <div className="flex bg-[#121215] p-1.5 mx-5 mt-5 rounded-2xl border border-white/5 shadow-inner shrink-0">
          <button type="button" onClick={() => setChatMode("BOT")} className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${chatMode === "BOT" ? "bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)]" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"}`}><Bot size={16} /> AI Assistant</button>
          <button type="button" onClick={() => setChatMode("ADMIN")} className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${chatMode === "ADMIN" ? "bg-emerald-600 text-white shadow-[0_0_20px_rgba(5,150,105,0.4)]" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"}`}><UserSquare size={16} /> Gặp Quản Lý</button>
        </div>

        {chatMode === "ADMIN" && !selectedCinemaId ? (
          <div className="flex-1 overflow-y-auto p-5 flex flex-col items-center custom-scrollbar">
            <div className="w-14 h-14 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4 border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.15)]"><MapPin size={28} className="text-emerald-500 animate-bounce" /></div>
            {!selectedParentCinema ? (
              <>
                <h4 className="text-white font-black text-[15px] mb-1">Xác định Hệ thống rạp</h4>
                <p className="text-zinc-500 text-xs font-medium text-center mb-6">Bạn đang gặp sự cố tại cụm rạp nào?</p>
                <div className="w-full space-y-2.5">
                  {cinemas.map(parent => (
                    <button key={parent.id} onClick={() => { setAdminMessages([]); setSelectedParentCinema(parent); }} className="w-full bg-[#121215] border border-white/5 p-3.5 rounded-xl text-left text-[13px] font-bold text-zinc-300 hover:bg-emerald-950/30 hover:text-emerald-400 hover:border-emerald-500/30 transition-all flex justify-between items-center group shadow-sm">
                      <span className="uppercase tracking-wider">{parent.name}</span>
                      <ArrowRight size={16} className="text-zinc-600 group-hover:text-emerald-500 group-hover:translate-x-1 transition-transform" />
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <h4 className="text-white font-black text-[15px] mb-1">Chọn Chi nhánh cụ thể</h4>
                <p className="text-zinc-500 text-xs font-medium text-center mb-4">Thuộc hệ thống {selectedParentCinema.name}</p>
                <button onClick={() => { setSelectedParentCinema(null); setAdminMessages([]); }} className="text-[11px] font-black uppercase text-emerald-500 hover:text-emerald-400 mb-5 px-4 py-1.5 bg-emerald-500/10 rounded-full transition-colors">&larr; Quay lại hệ thống rạp</button>
                <div className="w-full space-y-2.5">
                  {cinemaItems.filter(i => i.cinema?.id === selectedParentCinema.id || i.cinemaId === selectedParentCinema.id || (i as any).cinema === selectedParentCinema.id).map(item => (
                    <button key={item.id} onClick={() => { setAdminMessages([]); setSelectedCinemaId(item.id); setIsClosed(false); resetAutoCloseTimeout(); }} className="w-full bg-[#121215] border border-white/5 p-4 rounded-xl text-left text-zinc-300 hover:bg-emerald-950/30 hover:text-emerald-400 hover:border-emerald-500/30 transition-all flex justify-between items-center group shadow-sm">
                      <div className="flex flex-col">
                        <span className="font-bold text-[13px] uppercase tracking-wider">{item.name}</span>
                        <span className="text-[10px] text-zinc-500 font-medium mt-0.5">{item.city}</span>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-zinc-800/50 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                        <ArrowRight size={14} className="text-zinc-500 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <>
            {chatMode === "ADMIN" && selectedCinemaId && (
              <div className="mx-5 mt-4 flex items-center justify-between bg-emerald-950/40 border border-emerald-500/20 rounded-xl px-4 py-2 shadow-inner">
                <div className="flex flex-col">
                  <span className="text-[9px] text-emerald-500 font-black uppercase tracking-widest">Kênh CSKH</span>
                  <span className="text-xs text-zinc-200 font-bold line-clamp-1">{cinemaItems.find(c => c.id === selectedCinemaId)?.name}</span>
                </div>
                <div className="flex gap-1">
                  {!isChatClosed && <button onClick={handleUserActiveCancel} className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-all" title="Hủy kết nối"><Trash2 size={14} /></button>}
                  <button onClick={() => { setSelectedCinemaId(null); setSelectedParentCinema(null); setAdminMessages([]); setIsClosed(false); }} className="p-2 bg-zinc-800/50 text-zinc-400 hover:bg-zinc-700 hover:text-white rounded-lg transition-all" title="Đổi rạp"><RefreshCcw size={14} /></button>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
              {isChatClosed && chatMode === "ADMIN" ? (
                <div className="flex flex-col items-center text-center py-10 bg-[#121215] border border-white/5 rounded-2xl">
                  <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mb-3 text-red-500"><X size={24} /></div>
                  <p className="text-[13px] font-black text-red-500 uppercase tracking-wider mb-1">Phiên đã kết thúc</p>
                  <p className="text-[11px] text-zinc-500 px-6 leading-relaxed">Quản lý rạp đã đóng phiên kết nối hoặc phiên hết hạn tự động do không có tương tác.</p>
                  <button onClick={() => { setIsClosed(false); setSelectedCinemaId(null); setSelectedParentCinema(null); setAdminMessages([]); }} className="mt-5 text-xs bg-white/5 hover:bg-white/10 text-white px-5 py-2.5 rounded-xl uppercase font-bold border border-white/10 transition-all">Tạo phiên kết nối mới</button>
                </div>
              ) : (
                <>
                  <div className="text-center mb-6"><span className="text-[9px] bg-white/5 px-4 py-1.5 rounded-full text-zinc-400 font-black border border-white/5 uppercase tracking-[0.2em]">Mã hóa đầu cuối 256-bit</span></div>
                  
                  <div className="flex flex-col items-start animate-in fade-in duration-300">
                    <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-1.5 pl-1">{chatMode === "BOT" ? "Hệ thống AI" : "Tổng đài viên"}</span>
                    <div className={`max-w-[85%] text-[13px] px-5 py-3.5 rounded-2xl rounded-tl-sm shadow-md leading-relaxed border ${chatMode === "BOT" ? "bg-[#16161a] border-white/5 text-zinc-300" : "bg-emerald-950/40 border-emerald-900/50 text-emerald-100"}`}>
                      {chatMode === "BOT" ? "Chào bạn! Tôi là siêu trí tuệ AI của A&K Cinema. Bạn cần kiểm tra lịch chiếu phim, giá vé hay muốn nhận gợi ý phim hay hôm nay?" : <span>Hệ thống đã nối máy với Quản lý rạp. Để được hỗ trợ nhanh nhất, vui lòng cung cấp:<br/><br/><b className="text-white">1. Mã đặt vé (hoặc SĐT)</b><br/><b className="text-white">2. Yêu cầu cần xử lý</b><br/><br/><i className="text-emerald-500/80 text-[11px]">Nhân viên sẽ kiểm tra và phản hồi ngay!</i></span>}
                    </div>
                  </div>

                  {activeMessages.map((msg, idx) => (
                    <div key={idx} className={`flex flex-col ${msg.senderRole === "USER" ? "items-end" : "items-start"} animate-in fade-in slide-in-from-bottom-2`}>
                      <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-1.5 px-1">{msg.sender}</span>
                      <div className={`max-w-[88%] text-[13px] px-5 py-3.5 rounded-2xl shadow-lg leading-relaxed border ${msg.senderRole === "USER" ? "bg-gradient-to-br from-red-600 to-rose-600 border-red-500/50 text-white rounded-tr-sm" : "bg-[#16161a] border-white/5 text-zinc-300 rounded-tl-sm"}`}>
                        {renderMessageContent(msg.content, msg.senderRole)}
                      </div>
                    </div>
                  ))}
                </>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendMessage} className="p-4 bg-[#0a0a0c]/80 backdrop-blur-md border-t border-white/5 flex gap-2.5 shrink-0">
              <input 
                type="text" 
                value={inputValue} 
                onChange={(e) => setInputValue(e.target.value)} 
                disabled={isConnecting || (isChatClosed && chatMode === "ADMIN")} 
                placeholder={isChatClosed && chatMode === "ADMIN" ? "Phiên đã đóng..." : "Nhập câu hỏi hoặc yêu cầu..."} 
                className="flex-1 bg-[#121215] border border-white/10 rounded-xl px-4 py-3.5 text-[13px] font-medium text-white focus:outline-none focus:border-red-500/50 transition-all placeholder:text-zinc-600 disabled:opacity-50 shadow-inner" 
              />
              <button 
                type="submit" 
                disabled={!inputValue.trim() || isConnecting || (isChatClosed && chatMode === "ADMIN")} 
                className={`w-12 h-12 text-white rounded-xl flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 ${chatMode === "BOT" ? "bg-red-600 hover:bg-red-500 shadow-[0_0_20px_rgba(220,38,38,0.4)]" : "bg-emerald-600 hover:bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]"}`}
              >
                {isConnecting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="ml-0.5" />}
              </button>
            </form>
          </>
        )}
      </div>

      <button onClick={handleOpenChat} className={`w-16 h-16 bg-gradient-to-br from-red-600 to-rose-600 rounded-full flex items-center justify-center text-white shadow-[0_10px_30px_rgba(220,38,38,0.5)] transition-all duration-500 transform hover:scale-110 hover:-translate-y-2 border-2 border-white/20 hover:border-white/40 ${isOpen ? "scale-0 opacity-0" : "scale-100 opacity-100 animate-[bounce_3s_infinite]"}`}>
        <MessageCircle size={28} strokeWidth={2.5} />
      </button>

      <style jsx global>{`.custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #3f3f46; border-radius: 10px; } .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #ef4444; }`}</style>
    </div>
  );
}