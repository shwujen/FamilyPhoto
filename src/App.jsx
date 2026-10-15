import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import OnThisDayBanner from './components/OnThisDayBanner';
import PhotoCard from './components/PhotoCard';
import LightboxModal from './components/LightboxModal';
import SettingsModal from './components/SettingsModal';
import PinModal from './components/PinModal';
import SidebarFolderTree from './components/SidebarFolderTree';
import FolderBreadcrumbs from './components/FolderBreadcrumbs';

import { MOCK_FAMILY_PHOTOS, MOCK_ALBUMS } from './mockData';
import { Filter } from 'lucide-react';
import confetti from 'canvas-confetti';

function resolvePhotoDate(name, pathOrAlbum, fallbackDate, fallbackYear) {
  // 1. 嘗試從檔名抓取西元日期：例如 P_20181111_... 或 IMG_2018-08-19_...
  const filenameMatch = (name || '').match(/(20\d{2})[-_]?([01]\d)[-_]?([0-3]\d)/);
  if (filenameMatch) {
    return {
      date: `${filenameMatch[1]}-${filenameMatch[2]}-${filenameMatch[3]}`,
      year: filenameMatch[1]
    };
  }
  // 2. 嘗試從資料夾名稱抓取民國年或西元年：例如 92-03-23 或 2018-11-11
  const folderMatch = (pathOrAlbum || '').match(/(\d{2,4})[-._/](\d{1,2})[-._/](\d{1,2})/);
  if (folderMatch) {
    let y = parseInt(folderMatch[1], 10);
    if (y < 200) y += 1911; // 民國年轉西元
    const m = String(folderMatch[2]).padStart(2, '0');
    const d = String(folderMatch[3]).padStart(2, '0');
    return {
      date: `${y}-${m}-${d}`,
      year: String(y)
    };
  }
  return {
    date: fallbackDate || '',
    year: fallbackYear || (fallbackDate ? fallbackDate.split('-')[0] : '')
  };
}

const DEFAULT_GAS_URL = 'https://script.google.com/macros/s/AKfycbxZuqEkp5jkBvb6hY_NMoPSzuK4IuL5etNrDwoKbTM87FXIen2-Pn3H8CsbTd8k9tgp/exec';

export default function App() {
  const [photos, setPhotos] = useState(() => {
    const saved = localStorage.getItem('family_photos_cache');
    if (!saved) return MOCK_FAMILY_PHOTOS;
    try {
      const parsed = JSON.parse(saved);
      return parsed.map(p => {
        const resolved = resolvePhotoDate(p.name, p.path || p.album, p.date, p.year);
        return {
          ...p,
          date: resolved.date || p.date,
          year: resolved.year || p.year,
          path: p.path || p.album || ''
        };
      });
    } catch {
      return MOCK_FAMILY_PHOTOS;
    }
  });

  const [isDriveConnected, setIsDriveConnected] = useState(() => {
    return localStorage.getItem('is_drive_connected') === 'true';
  });

  const [gasUrl, setGasUrl] = useState(() => {
    return localStorage.getItem('gas_url') || DEFAULT_GAS_URL;
  });

  const [driveFolderId, setDriveFolderId] = useState(() => {
    return localStorage.getItem('drive_folder_id') || '';
  });

  // UI state
  const [selectedAlbum, setSelectedAlbum] = useState('全部照片');
  const [selectedYear, setSelectedYear] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isPlayingBgm, setIsPlayingBgm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // 每次開頁都重新從 GAS 同步，確保照片最新（靜默背景同步）
  useEffect(() => {
    handleConnectGAS(undefined, { isAutoSync: true });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Background Audio Element
  useEffect(() => {
    const audio = new Audio('https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3');
    audio.loop = true;
    audio.volume = 0.35;

    if (isPlayingBgm) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }

    return () => {
      audio.pause();
    };
  }, [isPlayingBgm]);

  // Save photos to local cache
  useEffect(() => {
    localStorage.setItem('family_photos_cache', JSON.stringify(photos));
  }, [photos]);

  // Extract unique available years
  const yearsList = useMemo(() => {
    const years = new Set(photos.map(p => p.year).filter(Boolean));
    return Array.from(years).sort((a, b) => b - a);
  }, [photos]);

  // Dynamic Album Categories
  const albumsList = useMemo(() => {
    const albumsSet = new Set(['全部照片', '精選最愛']);
    photos.forEach(p => {
      if (p.album) albumsSet.add(p.album);
    });
    return Array.from(albumsSet);
  }, [photos]);

  // Extract On This Day photos (過去年份的今天，限制最多 6 張，避免撐爆版面)
  const memoryPhotos = useMemo(() => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = String(today.getMonth() + 1).padStart(2, '0');
    const currentDay = String(today.getDate()).padStart(2, '0');

    return photos.filter(p => {
      if (!p.date) return false;
      const parts = p.date.split('-');
      if (parts.length === 3) {
        const photoYear = parseInt(p.year || parts[0], 10);
        // 必須是過去年份且月日時分吻合 (排除今天上傳的)
        return photoYear < currentYear && parts[1] === currentMonth && parts[2] === currentDay;
      }
      return false;
    }).slice(0, 6);
  }, [photos]);

  // Filtered Photos List (Sorted by date newest first)
  const filteredPhotos = useMemo(() => {
    let result = photos.filter(photo => {
      // Album & Folder filter (支援完整路徑、母目錄、子目錄與末端相簿名稱比對)
      if (selectedAlbum === '精選最愛' && !photo.isFavorite) return false;
      if (selectedAlbum !== '全部照片' && selectedAlbum !== '精選最愛') {
        const photoPath = photo.path || photo.album || '';
        const leafName = selectedAlbum.split(' / ').pop()?.trim() || selectedAlbum;
        const isMatch = photoPath === selectedAlbum || 
                        photoPath.startsWith(selectedAlbum + ' / ') ||
                        photo.album === selectedAlbum ||
                        photo.album === leafName ||
                        photoPath.includes(' / ' + leafName + ' / ') ||
                        photoPath.endsWith(' / ' + leafName);
        if (!isMatch) return false;
      }

      // Year filter
      if (selectedYear !== 'ALL' && photo.year !== selectedYear) return false;

      // Search term filter
      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase();
        const matchName = photo.name?.toLowerCase().includes(query);
        const matchAlbum = photo.album?.toLowerCase().includes(query);
        const matchLocation = photo.location?.toLowerCase().includes(query);
        const matchTags = photo.tags?.some(t => t.toLowerCase().includes(query));
        return matchName || matchAlbum || matchLocation || matchTags;
      }

      return true;
    });

    // Sort by Date: Newest first
    return result.sort((a, b) => {
      const dateA = a.date || '';
      const dateB = b.date || '';
      return dateB.localeCompare(dateA);
    });
  }, [photos, selectedAlbum, selectedYear, searchTerm]);

  // 切換相簿並自動捲動置頂
  const handleSelectAlbum = (album) => {
    setSelectedAlbum(album);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Toggle Favorite Heart
  const handleToggleFavorite = (id) => {
    setPhotos(prev => prev.map(p => {
      if (p.id === id) {
        const newFav = !p.isFavorite;
        if (newFav) {
          confetti({
            particleCount: 40,
            spread: 60,
            origin: { y: 0.8 }
          });
        }
        return { ...p, isFavorite: newFav };
      }
      return p;
    }));
  };

  // Connect to Google Apps Script API
  // isAutoSync=true 表示首次自動呼叫，失敗不跳提示
  const handleConnectGAS = async (urlOverride, { isAutoSync = false } = {}) => {
    let cleanUrl = (urlOverride || gasUrl || DEFAULT_GAS_URL).trim();

    // Ensure URL ends with /exec
    if (!cleanUrl.includes('/exec')) {
      cleanUrl += cleanUrl.endsWith('/') ? 'exec' : '/exec';
    }

    setIsLoading(true);
    try {
      let fetchUrl = cleanUrl;
      const cleanFolderId = driveFolderId ? driveFolderId.trim() : '';
      if (cleanFolderId) {
        try {
          const urlObj = new URL(fetchUrl);
          urlObj.searchParams.set('folderId', cleanFolderId);
          fetchUrl = urlObj.toString();
        } catch {
          fetchUrl += (fetchUrl.includes('?') ? '&' : '?') + 'folderId=' + encodeURIComponent(cleanFolderId);
        }
      }

      // 加上時間戳記防止瀏覽器 / GAS 快取舊資料
      fetchUrl += (fetchUrl.includes('?') ? '&' : '?') + 't=' + Date.now();

      const res = await fetch(fetchUrl, { method: 'GET', redirect: 'follow' });
      const data = await res.json();

      if (data.status === 'success' && data.photos) {
        // 保留原本的 isFavorite 精選狀態
        const prevFavSet = new Set(
          photos.filter(p => p.isFavorite).map(p => p.id)
        );

        const formattedPhotos = data.photos.map((p, idx) => {
          const fileId = p.id;
          const rawDateStr = p.date || (p.createdTime ? p.createdTime.split('T')[0] : new Date().toISOString().split('T')[0]);
          const rawYearStr = p.year || (rawDateStr ? rawDateStr.split('-')[0] : new Date().getFullYear().toString());
          const resolved = resolvePhotoDate(p.name, p.path || p.album || p.folderName, rawDateStr, rawYearStr);

          const lh3Thumb = fileId ? `https://lh3.googleusercontent.com/d/${fileId}=w800` : '';
          const lh3Full = fileId ? `https://lh3.googleusercontent.com/d/${fileId}=w1600` : '';
          const driveThumb = fileId ? `https://drive.google.com/thumbnail?id=${fileId}&sz=w800` : '';
          const driveFull = fileId ? `https://drive.google.com/thumbnail?id=${fileId}&sz=w1600` : '';

          let finalThumb = p.thumbnailUrl ? p.thumbnailUrl.replace('/u/0/', '/') : (lh3Thumb || driveThumb);
          let finalUrl = p.url ? p.url.replace('/u/0/', '/') : (lh3Full || driveFull);

          return {
            id: fileId || `drive-photo-${idx}`,
            name: p.name || `相片-${idx + 1}`,
            album: p.album || p.folderName || 'Drive 相簿',
            path: p.path || p.album || p.folderName || 'Drive 相簿',
            date: resolved.date,
            year: resolved.year,
            url: finalUrl,
            thumbnailUrl: finalThumb,
            viewUrl: p.viewUrl || p.downloadUrl || finalUrl,
            downloadUrl: p.downloadUrl || finalUrl,
            isFavorite: prevFavSet.has(fileId),   // ← 保留精選
            tags: ['Drive相片']
          };
        });

        setPhotos(formattedPhotos);
        setIsDriveConnected(true);
        setGasUrl(cleanUrl);
        localStorage.setItem('is_drive_connected', 'true');
        localStorage.setItem('gas_url', cleanUrl);
        if (cleanFolderId) {
          localStorage.setItem('drive_folder_id', cleanFolderId);
        } else {
          localStorage.removeItem('drive_folder_id');
        }
        // 不自動關閉 Modal，讓使用者看到同步成功的張數後自行關閉
        // setIsSettingsOpen(false) 移除

        if (!isAutoSync) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        }
      } else {
        if (!isAutoSync) {
          alert('載入失敗：' + (data.message || '格式不正確'));
        }
      }
    } catch (err) {
      console.error(err);
      if (!isAutoSync) {
        alert('連線失敗！請確認以下 3 個常見問題：\n\n1. 部署設定：誰可以存取 (Who has access) 必須選「所有人 (Anyone)」\n2. 重新部署：修改語法後是否有選「新建部署」或「新建版本」？\n3. 網址結尾：網址最後必須包含 /exec');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetDemo = () => {
    setPhotos(MOCK_FAMILY_PHOTOS);
    setIsDriveConnected(false);
    localStorage.removeItem('is_drive_connected');
    localStorage.removeItem('gas_url');
    localStorage.removeItem('drive_folder_id');
    setIsSettingsOpen(false);
  };

  return (
    <div className="min-h-screen pb-16">
      
      {/* PIN Lock Screen Gate */}
      <PinModal isLocked={isLocked} onUnlock={() => setIsLocked(false)} />

      {/* Header Bar */}
      <Header
        isDriveConnected={isDriveConnected}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onRefresh={handleConnectGAS}
        isLoading={isLoading}
        isLocked={isLocked}
        setIsLocked={setIsLocked}
        isPlayingBgm={isPlayingBgm}
        setIsPlayingBgm={setIsPlayingBgm}
        onToggleSidebar={() => setIsMobileSidebarOpen(prev => !prev)}
      />

      {/* 檔案總管版面：左側資料夾樹狀目錄 + 右側主內容區 */}
      <div className="max-w-[1680px] mx-auto px-4 md:px-6 flex gap-6 items-start">
        {/* 左側檔案總管樹狀目錄 */}
        <SidebarFolderTree
          photos={photos}
          selectedAlbum={selectedAlbum}
          setSelectedAlbum={handleSelectAlbum}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* 右側主內容區 */}
        <main className="flex-1 min-w-0">
          {/* 麵包屑路徑導航列 */}
          <FolderBreadcrumbs
            selectedAlbum={selectedAlbum}
            setSelectedAlbum={handleSelectAlbum}
            photoCount={filteredPhotos.length}
            onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          />

          {/* Memory Rewind - On This Day Hero Section (僅在「全部照片」時且有回顧照片時顯示，避免蓋過相簿照片) */}
          {selectedAlbum === '全部照片' && memoryPhotos.length > 0 && (
            <OnThisDayBanner
              memoryPhotos={memoryPhotos}
              onSelectPhoto={setSelectedPhoto}
            />
          )}

          {/* Gallery Grid Section */}
          {filteredPhotos.length > 0 ? (
            <div className="photo-masonry">
              {filteredPhotos.map(photo => (
                <PhotoCard
                  key={photo.id}
                  photo={photo}
                  onSelect={setSelectedPhoto}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>
          ) : (
            <div className="glass-panel rounded-2xl p-12 text-center my-8 border border-white/10">
              <div className="inline-flex p-4 rounded-full bg-white/5 text-gray-400 mb-3">
                <Filter className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-200">找不到符合條件的照片</h3>
              <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                嘗試清除搜尋關鍵字、切換其他年份或選擇其他資料夾。
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedAlbum('全部照片');
                  setSelectedYear('ALL');
                }}
                className="btn-secondary mt-4 text-xs"
              >
                清除所有篩選條件
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Lightbox Modal */}
      <LightboxModal
        photo={selectedPhoto}
        photosList={filteredPhotos}
        onClose={() => setSelectedPhoto(null)}
        onSelectPhoto={setSelectedPhoto}
        onToggleFavorite={handleToggleFavorite}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        gasUrl={gasUrl}
        setGasUrl={setGasUrl}
        driveFolderId={driveFolderId}
        setDriveFolderId={setDriveFolderId}
        onConnect={handleConnectGAS}
        onResetDemo={handleResetDemo}
        isLoading={isLoading}
        photosCount={photos.length}
        isDriveConnected={isDriveConnected}
      />

    </div>
  );
}
