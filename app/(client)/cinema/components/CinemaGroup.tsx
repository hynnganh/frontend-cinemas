import React from 'react';
import { ChevronDown, MapPin } from 'lucide-react';
import CinemaCard from './CinemaCard'; // Import thẻ rạp con của ông vào đây

export default function CinemaGroup({ parentName, childrenCinemas, activeChildId, onChildSelect, isExpanded, onToggle }: any) {
  return (
    <div className="mb-1.5 animate-in fade-in slide-in-from-bottom-2">
      {/* THANH RẠP CHA */}
      <div 
        onClick={onToggle}
        className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-300 border ${
          isExpanded 
            ? 'bg-zinc-900/80 border-white/10 shadow-md' 
            : 'bg-[#0a0a0a] border-transparent hover:bg-zinc-900/40 hover:border-white/5'
        }`}
      >
        <div className="flex items-center gap-2">
          <MapPin size={12} className={isExpanded ? 'text-red-500' : 'text-zinc-500'} />
          <h2 className={`text-[10px] font-black uppercase tracking-widest ${isExpanded ? 'text-white' : 'text-zinc-400'}`}>
            {parentName}
          </h2>
        </div>
        <ChevronDown 
          size={14} 
          className={`transition-transform duration-300 ${isExpanded ? 'rotate-180 text-red-500' : 'text-zinc-600'}`} 
        />
      </div>

      {/* DANH SÁCH RẠP CON (SẼ BUNG RA KHI BẤM) */}
      <div 
        className={`transition-all duration-500 overflow-hidden ${
          isExpanded ? 'max-h-[800px] opacity-100 mt-1 mb-2' : 'max-h-0 opacity-0 mt-0 mb-0'
        }`}
      >
        <div className="pl-2 border-l border-white/5 ml-2 mt-1">
          {childrenCinemas.map((cinema: any) => (
            <CinemaCard 
              key={cinema.id}
              cinema={cinema}
              isActive={activeChildId === cinema.id}
              onClick={() => onChildSelect(cinema.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}