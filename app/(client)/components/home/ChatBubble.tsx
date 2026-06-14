"use client";
import React, { useState, useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs'; 
import { MessageCircle, X, Send, Bot, UserSquare, Loader2, Film, ArrowRight, Move } from 'lucide-react';
import Link from 'next/link';

import { apiRequest, BASE_URL } from '../../../lib/api'; 

interface ChatMessage {
  sender: string;
  content: string;
  senderRole: string;
  receiverRole?: string; 
  timestamp?: string;
}

export default function ChatBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [chatMode, setChatMode] = useState<"BOT" | "ADMIN">("BOT"); 
  
  const [botMessages, setBotMessages] = useState<ChatMessage[]>([]);
  const [adminMessages, setAdminMessages] = useState<ChatMessage[]>([]);
  
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const stompClientRef = useRef<Client | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
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
  }, [botMessages, adminMessages, isOpen, chatMode]);

  useEffect(() => {
    if (isOpen && typeof window !== 'undefined') {
      setPosition({
        x: window.innerWidth / 2 - 180,
        y: window.innerHeight / 2 - 260,
      });
    }
  }, [isOpen]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('.btn-close-chat')) return;
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    let newX = e.clientX - dragStart.current.x;
    let newY = e.clientY - dragStart.current.y;

    if (typeof window !== 'undefined') {
      newX = Math.max(0, Math.min(newX, window.innerWidth - 360));
      newY = Math.max(0, Math.min(newY, window.innerHeight - 520));
    }
    setPosition({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  const connectWebSocket = () => {
    if (stompClientRef.current?.active) return;
    setIsConnecting(true);
    
    const client = new Client({
      webSocketFactory: () => new SockJS(`${BASE_URL}/ws`),
      debug: function () {},
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = function () {
      setIsConnecting(false);
      
      client.subscribe(`/topic/room/${roomId}`, (msg) => {
        const newMsg: ChatMessage = JSON.parse(msg.body);
        
        if (newMsg.receiverRole === "BOT" || newMsg.senderRole === "BOT") {
          setBotMessages((prev) => [...prev, newMsg]);
        } else {
          setAdminMessages((prev) => [...prev, newMsg]);
        }
      });

      apiRequest(`/api/v1/chat/history/${roomId}`)
        .then(res => res.json())
        .then((data: ChatMessage[]) => {
          if (data && data.length > 0) {
            const botHist = data.filter(m => m.receiverRole === "BOT" || m.senderRole === "BOT");
            const adminHist = data.filter(m => m.receiverRole === "ADMIN" || m.senderRole === "ADMIN");
            setBotMessages(botHist);
            setAdminMessages(adminHist);
          }
        })
        .catch((err) => console.error("Lỗi đồng bộ lịch sử tin nhắn:", err));
    };

    client.onStompError = function (frame) {
      console.error('Lỗi kết nối Socket: ' + frame.headers['message']);
      setIsConnecting(false);
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
    if (!inputValue.trim() || !stompClientRef.current?.active) return;

    const payload = {
      roomId: roomId,
      sender: "Khách Hàng",
      content: inputValue,
      senderRole: "USER",
      receiverRole: chatMode 
    };

    stompClientRef.current.publish({
      destination: "/app/chat.sendMessage",
      body: JSON.stringify(payload)
    });
    
    setInputValue("");
  };

  // HÀM XỬ LÝ FORMAT IN ĐẬM VÀ ĐỊNH DẠNG THẺ CHUẨN
  const renderMessageContent = (text: string, role: string) => {
    if (role === "USER") {
      return text.split('\n').map((item, i) => <span key={i}>{item}<br/></span>);
    }

    // Phân tách chuỗi theo định dạng thẻ custom ($$MOVIE$$ và $$SEEMORE$$)
    const parts = text.split(/(\$\$MOVIE\|[^$]+\$\$|\$\$SEEMORE\$\$)/g);
    
    // Hàm xử lý parse inline Markdown đơn giản cho phần nội dung text thường
    const parseInlineFormat = (rawText: string) => {
      // Tìm và tách các cụm chữ được bọc trong dấu **
      const subParts = rawText.split(/(\*\*[^*]+\*\*)/g);
      return subParts.map((subPart, subIdx) => {
        if (subPart.startsWith('**') && subPart.endsWith('**')) {
          // Trả về thẻ strong đậm, tinh chỉnh font rõ ràng sắc nét
          return <strong key={subIdx} className="font-extrabold text-zinc-100 mx-0.5">{subPart.slice(2, -2)}</strong>;
        }
        // Xử lý xuống dòng tự nhiên cho text thường
        return subPart.split('\n').map((line, lineIdx) => (
          <React.Fragment key={`${subIdx}-${lineIdx}`}>
            {line}
            {lineIdx < subPart.split('\n').length - 1 && <br />}
          </React.Fragment>
        ));
      });
    };

    return parts.map((part, index) => {
      if (part.startsWith('$$MOVIE|')) {
        const [_, id, title, poster] = part.replace('$$MOVIE|', '').replace('$$', '').split('|');
        return (
          <Link href={`/movie/${id}`} key={index} className="block mt-2 mb-2 group">
            <div className="relative flex items-center bg-zinc-950/80 border border-zinc-800 p-2 rounded-xl overflow-hidden transition-all duration-300 transform group-hover:-translate-y-1 group-hover:shadow-[0_10px_20px_rgba(220,38,38,0.2)] group-hover:border-red-600/50">
              <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-rose-600 rounded-xl blur opacity-0 group-hover:opacity-20 transition duration-500"></div>
              
              <div className="relative z-10 flex gap-3 w-full items-center">
                <img src={poster} alt={title} className="w-12 h-16 object-cover rounded-lg shadow-md" />
                <div className="flex-1">
                  <h4 className="text-zinc-100 font-black text-xs line-clamp-1">{title}</h4>
                  <p className="text-[9px] text-zinc-500 font-bold uppercase mt-1 flex items-center gap-1">
                    <Film size={10} className="text-red-500"/> Xem chi tiết
                  </p>
                </div>
              </div>
            </div>
          </Link>
        );
      }
      
      if (part === '$$SEEMORE$$') {
        return (
          <Link href="/movies" key={index} className="block mt-3 mb-1">
            <div className="w-full py-2 bg-gradient-to-r from-zinc-900 to-zinc-950 border border-zinc-800 hover:border-red-600/50 text-center rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg flex items-center justify-center gap-2 group">
              <span className="text-[10px] font-black text-red-500 uppercase tracking-widest group-hover:text-red-400">Xem tất cả kho phim</span>
              <ArrowRight size={12} className="text-red-500 group-hover:translate-x-1 transition-transform" />
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
      
      {/* BOX WINDOW CHAT */}
      <div 
        className={`fixed bg-zinc-950/95 backdrop-blur-xl border border-zinc-800/80 rounded-[2rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden transform ${
          isOpen ? "scale-100 opacity-100" : "scale-50 opacity-0 pointer-events-none"
        }`}
        style={{ 
          width: "360px", 
          height: "520px",
          left: `${position.x}px`,
          top: `${position.y}px`,
          transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.1), opacity 0.4s, left 0.1s ease-out, top 0.1s ease-out'
        }}
      >
        {/* DRAGGABLE HEADER */}
        <div 
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="bg-gradient-to-r from-red-600 to-rose-700 p-4 flex justify-between items-center relative overflow-hidden shadow-lg cursor-move active:cursor-grabbing touch-none"
        >
          <div className="absolute top-[-50%] right-[-10%] w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="flex items-center gap-3 relative z-10 pointer-events-none">
            <div className="w-11 h-11 bg-zinc-950/50 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 p-1.5 shadow-inner">
              <img src="https://i.imgur.com/k9B9JqP.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-[1000] text-white text-sm tracking-widest uppercase italic">A&K AI Nexus</h3>
                <Move size={12} className="text-white/60 animate-pulse" />
              </div>
              <p className="text-[10px] text-red-100 font-bold flex items-center gap-1.5 tracking-wider mt-0.5">
                <span className={`w-1.5 h-1.5 rounded-full ${isConnecting ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400 shadow-[0_0_8px_#34d399]'}`}></span>
                {isConnecting ? "ĐANG KẾT NỐI..." : "TRỰC TUYẾN"}
              </p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)} 
            className="btn-close-chat w-8 h-8 flex items-center justify-center rounded-full bg-black/20 text-white hover:bg-black/40 transition-all relative z-10 active:scale-90"
          >
            <X size={16} strokeWidth={3} />
          </button>
        </div>

        {/* CONTROLLER CHUYỂN ĐỔI TAB */}
        <div className="flex bg-black/40 p-1 mx-4 mt-4 rounded-xl border border-zinc-800/50 backdrop-blur-sm">
          <button 
            type="button"
            onClick={() => setChatMode("BOT")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-[11px] font-black uppercase tracking-widest rounded-lg transition-all duration-300 ${chatMode === "BOT" ? "bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)] scale-100" : "text-zinc-500 hover:text-zinc-300 scale-95"}`}
          >
            <Bot size={14} /> AI Trợ Lý
          </button>
          <button 
            type="button"
            onClick={() => setChatMode("ADMIN")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-[11px] font-black uppercase tracking-widest rounded-lg transition-all duration-300 ${chatMode === "ADMIN" ? "bg-emerald-600 text-white shadow-[0_0_15px_rgba(5,150,105,0.4)] scale-100" : "text-zinc-500 hover:text-zinc-300 scale-95"}`}
          >
            <UserSquare size={14} /> Quản Lý
          </button>
        </div>

        {/* AREA SHOW TIN NHẮN THEO TAB */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar select-text">
          <div className="text-center mb-4 pointer-events-none">
            <span className="text-[8px] bg-zinc-900/80 px-4 py-1.5 rounded-full text-zinc-500 font-black border border-zinc-800 uppercase tracking-[0.2em] shadow-inner">
              Kênh kết nối bảo mật trực tuyến
            </span>
          </div>
          
          {/* Lời chào hệ thống sạch đẹp, không lộ SQL */}
          <div className="flex flex-col items-start animate-in fade-in duration-300">
            <span className="text-[9px] text-zinc-600 font-black uppercase tracking-wider mb-1.5 px-1">
              {chatMode === "BOT" ? "HỆ THỐNG AI" : "TỔNG ĐÀI VIÊN"}
            </span>
            <div className={`max-w-[85%] border text-[13px] px-4 py-3 rounded-2xl rounded-tl-sm shadow-md leading-relaxed ${
              chatMode === "BOT" 
                ? "bg-zinc-900/80 border-zinc-800 text-zinc-300" 
                : "bg-emerald-950/50 border-emerald-900/60 text-emerald-200"
            }`}>
              {chatMode === "BOT" 
                ? "Xin chào! Tôi là trợ lý ảo thông minh của A&K Cinema. Tôi có thể hỗ trợ bạn kiểm tra lịch chiếu phim, giá vé và tìm rạp gần nhất theo thời gian thực. Hôm nay bạn muốn xem phim gì ạ?"
                : "Chào bạn! Đây là kênh kết nối trực tiếp đến ban quản lý cụm rạp A&K. Vui lòng để lại thắc mắc về sự cố đặt vé hoặc phòng chiếu, chúng tôi sẽ phản hồi bạn ngay lập tức."
              }
            </div>
          </div>

          {/* Danh sách các tin nhắn */}
          {activeMessages.map((msg, idx) => {
            const isMe = msg.senderRole === "USER";
            const isBot = msg.senderRole === "BOT";
            
            return (
              <div key={idx} className={`flex flex-col ${isMe ? "items-end" : "items-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                <span className="text-[9px] text-zinc-600 font-black uppercase tracking-wider mb-1.5 px-1">{msg.sender}</span>
                <div className={`max-w-[88%] text-[13px] px-4 py-3 shadow-md leading-relaxed ${
                  isMe 
                    ? "bg-gradient-to-br from-red-600 to-rose-600 text-white rounded-2xl rounded-tr-sm shadow-[0_5px_15px_rgba(220,38,38,0.2)]" 
                    : isBot 
                      ? "bg-zinc-900/90 border border-zinc-800 text-zinc-200 rounded-2xl rounded-tl-sm backdrop-blur-sm"
                      : "bg-emerald-900/40 border border-emerald-800 text-emerald-100 rounded-2xl rounded-tl-sm backdrop-blur-sm"
                }`}>
                  {renderMessageContent(msg.content, msg.senderRole)}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* INPUT SUBMIT FORM */}
        <form onSubmit={sendMessage} className="p-3 bg-zinc-950/80 backdrop-blur-xl border-t border-zinc-800/80 flex items-center gap-2">
          <input 
            type="text" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={chatMode === "BOT" ? "Hỏi lịch chiếu phim, rạp chiếu..." : "Nhập nội dung cần hỗ trợ từ Admin..."}
            className="flex-1 bg-black/50 border border-zinc-800 rounded-xl px-4 py-3 text-[13px] text-white focus:outline-none focus:border-red-600 transition-all placeholder:text-zinc-600 shadow-inner"
            disabled={isConnecting}
          />
          <button 
            type="submit" 
            disabled={!inputValue.trim() || isConnecting}
            className="w-11 h-11 bg-red-600 hover:bg-red-500 text-white rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-[0_0_15px_rgba(220,38,38,0.3)] hover:shadow-[0_0_25px_rgba(220,38,38,0.5)] transform active:scale-95"
          >
            {isConnecting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="ml-1" />}
          </button>
        </form>
      </div>

      {/* TRIGGER BUBBLE BUTTON */}
      <button 
        onClick={handleOpenChat}
        className={`w-16 h-16 bg-gradient-to-br from-red-600 to-rose-700 rounded-full flex items-center justify-center text-white shadow-[0_10px_25px_rgba(220,38,38,0.6)] transition-all duration-500 transform hover:scale-110 hover:-translate-y-2 border-2 border-red-400/30 ${isOpen ? "scale-0 opacity-0 pointer-events-none" : "scale-100 opacity-100 animate-[bounce_3s_infinite]"}`}
      >
        <MessageCircle size={30} strokeWidth={2.5} />
      </button>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #3f3f46; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #3f3f46; }
      `}</style>
    </div>
  );
}