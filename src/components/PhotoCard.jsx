import React, { useState, useEffect } from 'react';
import { Heart, Calendar, MapPin, ExternalLink, Folder } from 'lucide-react';

export default function PhotoCard({ photo, onSelect, onToggleFavorite }) {
  const getInitialThumb = (p) => {
    if (p.thumbnailUrl) return p.thumbnailUrl.replace('/u/0/', '/');
    if (p.url) return p.url.replace('/u/0/', '/');
    if (p.id) return `https://lh3.googleusercontent.com/d/${p.id}=w800`;
    return undefined;
  };

  const [imgSrc, setImgSrc] = useState(() => getInitialThumb(photo));
  const [retryStage, setRetryStage] = useState(0);

  useEffect(() => {
    setImgSrc(getInitialThumb(photo));
    setRetryStage(0);
  }, [photo]);

  const handleImageError = () => {
    if (!photo.id) return;
    if (retryStage === 0) {
      setImgSrc(`https://lh3.googleusercontent.com/d/${photo.id}=w800`);
      setRetryStage(1);
    } else if (retryStage === 1) {
      setImgSrc(`https://drive.google.com/thumbnail?id=${photo.id}&sz=w800`);
      setRetryStage(2);
    } else if (retryStage === 2) {
      setImgSrc(`https://drive.google.com/uc?export=view&id=${photo.id}`);
      setRetryStage(3);
    }
  };

  return (
    <div 
      onClick={() => onSelect(photo)}
      className="group glass-card overflow-hidden cursor-pointer flex flex-col relative border border-white/10 hover:border-purple-500/40"
    >
      {/* Photo Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-900">
        <img 
          src={imgSrc || undefined} 
          onError={handleImageError}
          alt={photo.name}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
        />
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        {/* Favorite Heart Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(photo.id);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all ${
            photo.isFavorite 
              ? 'bg-pink-500/80 text-white shadow-lg shadow-pink-500/40' 
              : 'bg-black/40 text-gray-300 hover:text-white hover:bg-black/60 opacity-0 group-hover:opacity-100'
          }`}
          title={photo.isFavorite ? '取消最愛' : '加入最愛相片'}
        >
          <Heart className={`w-4 h-4 ${photo.isFavorite ? 'fill-current' : ''}`} />
        </button>

        {/* Album Badge */}
        {photo.album && (
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/50 backdrop-blur-md border border-white/10 text-[11px] font-medium text-gray-200 flex items-center gap-1">
            <Folder className="w-3 h-3 text-purple-400" />
            <span className="truncate max-w-[120px]">{photo.album}</span>
          </div>
        )}

        {/* Bottom hover info */}
        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-between text-xs text-gray-200">
          <div className="flex items-center gap-1 text-amber-300 font-semibold">
            <Calendar className="w-3.5 h-3.5" />
            <span>{photo.date}</span>
          </div>
          {photo.location && (
            <div className="flex items-center gap-1 text-pink-300">
              <MapPin className="w-3.5 h-3.5" />
              <span className="truncate max-w-[100px]">{photo.location}</span>
            </div>
          )}
        </div>
      </div>

      {/* Card Info Footer */}
      <div className="p-3.5 flex flex-col gap-1">
        <h3 className="text-sm font-semibold text-gray-100 truncate group-hover:text-purple-300 transition-colors">
          {photo.name}
        </h3>

        <div className="flex items-center justify-between text-xs text-gray-400 mt-1">
          <span className="text-gray-500">{photo.year ? `${photo.year} 年` : ''}</span>
          {photo.tags && photo.tags.length > 0 && (
            <div className="flex items-center gap-1">
              {photo.tags.slice(0, 2).map((t, idx) => (
                <span key={idx} className="px-1.5 py-0.5 rounded bg-white/5 border border-white/5 text-[10px] text-gray-400">
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
