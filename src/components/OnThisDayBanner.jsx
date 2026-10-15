import React from 'react';
import { Sparkles, Calendar, MapPin, Heart, ChevronRight } from 'lucide-react';

export default function OnThisDayBanner({ memoryPhotos, onSelectPhoto }) {
  if (!memoryPhotos || memoryPhotos.length === 0) return null;

  return (
    <div className="relative mb-8 rounded-2xl p-6 overflow-hidden glass-panel border border-purple-500/30 shadow-xl bg-gradient-to-r from-purple-900/40 via-indigo-900/30 to-pink-900/40">
      {/* Decorative ambient background glow */}
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 rounded-lg bg-pink-500/20 border border-pink-500/40 text-pink-400">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-pink-400">
            Memory Rewind • 珍貴時光回顧
          </span>
        </div>

        <h2 className="text-2xl font-extrabold text-white tracking-tight mb-2 flex items-center gap-2">
          歷史上的今天 <span>✨</span>
        </h2>
        <p className="text-sm text-gray-300 mb-5 max-w-xl">
          看看幾年前的今天，我們家正在哪裡留下美好的足跡與笑容！
        </p>

        {/* Memory Photo Cards Horizontal Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {memoryPhotos.map((photo) => (
            <div
              key={photo.id}
              onClick={() => onSelectPhoto(photo)}
              className="group relative h-48 rounded-xl overflow-hidden cursor-pointer border border-white/10 hover:border-purple-400/50 transition-all duration-300 shadow-md hover:shadow-purple-500/20"
            >
              <img
                src={photo.thumbnailUrl || photo.url}
                alt={photo.name}
                loading="lazy"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-3.5 flex flex-col justify-end">
                <div className="flex items-center gap-2 text-xs text-amber-300 font-bold mb-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    {photo.date} ({(() => {
                      const diff = new Date().getFullYear() - parseInt(photo.year || new Date().getFullYear());
                      return diff <= 0 ? '今年' : `${diff} 年前`;
                    })()})
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-white truncate group-hover:text-purple-300 transition-colors">
                  {photo.name}
                </h3>
                {photo.location && (
                  <p className="text-xs text-gray-300 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-pink-400" />
                    <span className="truncate">{photo.location}</span>
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
