import React, { useEffect, useState } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
  Heart, 
  Calendar, 
  MapPin, 
  Camera, 
  Folder, 
  ExternalLink, 
  Share2,
  Download,
  Info
} from 'lucide-react';

export default function LightboxModal({
  photo,
  photosList,
  onClose,
  onSelectPhoto,
  onToggleFavorite
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showInfoPanel, setShowInfoPanel] = useState(true);

  const currentIndex = photo && photosList ? photosList.findIndex(p => p.id === photo.id) : -1;
  const totalCount = photosList ? photosList.length : 0;

  const handlePrev = () => {
    if (!photosList || totalCount === 0) return;
    if (currentIndex > 0) {
      onSelectPhoto(photosList[currentIndex - 1]);
    } else {
      onSelectPhoto(photosList[totalCount - 1]);
    }
  };

  const handleNext = () => {
    if (!photosList || totalCount === 0) return;
    if (currentIndex < totalCount - 1) {
      onSelectPhoto(photosList[currentIndex + 1]);
    } else {
      onSelectPhoto(photosList[0]);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    if (!photo) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [photo, currentIndex, photosList]);

  // Slideshow timer
  useEffect(() => {
    if (!photo || !isPlaying) return;
    const timer = setInterval(() => {
      handleNext();
    }, 3500);
    return () => clearInterval(timer);
  }, [photo, isPlaying, currentIndex, photosList]);

  // Image URL Fallback Handler
  const getInitialImgSrc = (p) => {
    if (!p) return undefined;
    if (p.url) return p.url.replace('/u/0/', '/');
    if (p.thumbnailUrl) return p.thumbnailUrl.replace('/u/0/', '/');
    if (p.id) return `https://lh3.googleusercontent.com/d/${p.id}=w1600`;
    return undefined;
  };

  const [imgSrc, setImgSrc] = useState(() => getInitialImgSrc(photo));
  const [errorCount, setErrorCount] = useState(0);

  useEffect(() => {
    setImgSrc(getInitialImgSrc(photo));
    setErrorCount(0);
  }, [photo]);

  const handleImageError = () => {
    if (!photo?.id) return;
    if (errorCount === 0) {
      setImgSrc(`https://lh3.googleusercontent.com/d/${photo.id}=w1600`);
      setErrorCount(1);
    } else if (errorCount === 1) {
      setImgSrc(`https://drive.google.com/thumbnail?id=${photo.id}&sz=w1600`);
      setErrorCount(2);
    } else if (errorCount === 2) {
      setImgSrc(`https://drive.google.com/uc?export=view&id=${photo.id}`);
      setErrorCount(3);
    }
  };

  if (!photo) return null;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: photo.name,
        text: `快來查看我們家的照片：${photo.name}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('已複製相片連結至剪貼簿！');
    }
  };

  return (
    <div 
      className="lightbox-backdrop cursor-pointer"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Top Header Control Bar */}
      <div className="absolute top-0 left-0 right-0 p-4 z-50 flex items-center justify-between bg-gradient-to-b from-black/90 via-black/50 to-transparent pointer-events-auto">
        <div className="flex items-center gap-3">
          {/* Prominent Back Button */}
          <button
            onClick={onClose}
            className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white border border-purple-400/30 text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-purple-600/30 transition-all hover:scale-105 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>返回相簿主頁</span>
          </button>

          <span className="text-sm font-semibold text-gray-300">
            {currentIndex + 1} / {totalCount}
          </span>
          <span className="text-xs px-2.5 py-1 rounded-full bg-white/10 text-gray-300 border border-white/10 hidden sm:inline-block">
            {photo.album || '預設相簿'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Slideshow Button */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isPlaying 
                ? 'bg-purple-500/30 border-purple-500/50 text-purple-300' 
                : 'bg-white/10 border-white/15 text-gray-200 hover:bg-white/20'
            }`}
          >
            {isPlaying ? <Pause className="w-4 h-4 text-purple-400" /> : <Play className="w-4 h-4" />}
            <span className="hidden sm:inline">{isPlaying ? '暫停播放' : '自動幻燈片'}</span>
          </button>

          {/* Toggle Info Panel */}
          <button
            onClick={() => setShowInfoPanel(!showInfoPanel)}
            className={`p-2 rounded-xl border transition-all ${
              showInfoPanel ? 'bg-purple-500/20 border-purple-500/40 text-purple-300' : 'bg-white/10 border-white/15 text-gray-300'
            }`}
            title="相片資訊細節"
          >
            <Info className="w-5 h-5" />
          </button>

          {/* Close Lightbox Button */}
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-gray-200 border border-white/15 transition-all"
            title="關閉 (Esc)"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Lightbox Content */}
      <div 
        className="w-full h-full flex items-center justify-center relative p-4 md:p-12 overflow-hidden pointer-events-none"
      >
        
        {/* Left Arrow */}
        <button
          onClick={handlePrev}
          className="absolute left-4 z-40 p-3 rounded-2xl bg-black/60 hover:bg-purple-600/80 text-white backdrop-blur-md border border-white/15 transition-all transform hover:scale-110 pointer-events-auto"
        >
          <ChevronLeft className="w-7 h-7" />
        </button>

        {/* Right Arrow */}
        <button
          onClick={handleNext}
          className={`absolute z-40 p-3 rounded-2xl bg-black/60 hover:bg-purple-600/80 text-white backdrop-blur-md border border-white/15 transition-all transform hover:scale-110 pointer-events-auto ${
            showInfoPanel ? 'right-4 md:right-84' : 'right-4'
          }`}
        >
          <ChevronRight className="w-7 h-7" />
        </button>

        {/* Center Display Image */}
        <div className="relative max-w-full max-h-full flex items-center justify-center transition-all duration-300 pointer-events-auto">
          <img
            src={imgSrc}
            onError={handleImageError}
            alt={photo.name}
            referrerPolicy="no-referrer"
            className="max-h-[85vh] max-w-[75vw] object-contain rounded-xl shadow-2xl border border-white/10"
          />
        </div>

        {/* Sidebar Info Panel */}
        {showInfoPanel && (
          <div className="absolute right-0 top-0 bottom-0 w-80 z-40 glass-panel border-l border-white/10 p-6 flex flex-col justify-between overflow-y-auto bg-black/80 backdrop-blur-2xl animate-fadeIn">
            <div className="flex flex-col gap-5 mt-14">
              <div>
                <h3 className="text-lg font-bold text-white mb-1 leading-snug">
                  {photo.name}
                </h3>
                {photo.description && (
                  <p className="text-sm text-gray-300 mt-2 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/5">
                    {photo.description}
                  </p>
                )}
              </div>

              {/* Detail Items */}
              <div className="flex flex-col gap-3 text-sm">
                <div className="flex items-center gap-3 text-gray-300">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <div>
                    <span className="text-xs text-gray-400 block">拍攝日期</span>
                    <span className="font-semibold">{photo.date}</span>
                  </div>
                </div>

                {photo.location && (
                  <div className="flex items-center gap-3 text-gray-300">
                    <MapPin className="w-4 h-4 text-pink-400" />
                    <div>
                      <span className="text-xs text-gray-400 block">地點</span>
                      <span className="font-semibold">{photo.location}</span>
                    </div>
                  </div>
                )}

                {photo.camera && (
                  <div className="flex items-center gap-3 text-gray-300">
                    <Camera className="w-4 h-4 text-cyan-400" />
                    <div>
                      <span className="text-xs text-gray-400 block">裝置設備</span>
                      <span className="font-semibold">{photo.camera}</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 text-gray-300">
                  <Folder className="w-4 h-4 text-purple-400" />
                  <div>
                    <span className="text-xs text-gray-400 block">所屬相簿</span>
                    <span className="font-semibold">{photo.album || '預設相簿'}</span>
                  </div>
                </div>
              </div>

              {/* Tags */}
              {photo.tags && photo.tags.length > 0 && (
                <div>
                  <span className="text-xs text-gray-400 block mb-2">相片標籤</span>
                  <div className="flex flex-wrap gap-1.5">
                    {photo.tags.map((tag, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col gap-2.5 pt-4 border-t border-white/10">
              <button
                onClick={() => onToggleFavorite(photo.id)}
                className={`w-full py-2.5 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                  photo.isFavorite
                    ? 'bg-pink-500/20 border-pink-500/40 text-pink-300'
                    : 'bg-white/10 border-white/15 text-gray-200 hover:bg-white/20'
                }`}
              >
                <Heart className={`w-4 h-4 ${photo.isFavorite ? 'fill-current text-pink-400' : ''}`} />
                <span>{photo.isFavorite ? '已收藏最愛' : '加到最愛相片'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleShare}
                  className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-gray-200 border border-white/15 text-xs font-semibold flex items-center justify-center gap-1.5"
                >
                  <Share2 className="w-4 h-4" />
                  <span>分享</span>
                </button>

                <a
                  href={photo.downloadUrl || photo.url}
                  download={photo.name || 'family-photo.jpg'}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-gray-200 border border-white/15 text-xs font-semibold flex items-center justify-center gap-1.5"
                >
                  <Download className="w-4 h-4 text-cyan-400" />
                  <span>下載照片</span>
                </a>

                {photo.viewUrl && (
                  <a
                    href={photo.viewUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/30"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Drive 原圖</span>
                  </a>
                )}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
