// 示範照片資料庫 (預設示範相簿，當尚未連線個人 Google Drive 時自動展示)
export const MOCK_FAMILY_PHOTOS = [
  {
    id: 'photo-1',
    name: '2024-東京迪士尼家族合照.jpg',
    url: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=1200&auto=format&fit=crop',
    thumbnailUrl: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=600&auto=format&fit=crop',
    date: '2024-04-12',
    year: '2024',
    month: '04',
    album: '2024 東京家族之旅',
    location: '日本東京迪士尼樂園',
    camera: 'iPhone 15 Pro Max',
    description: '全家第一次一起造訪東京迪士尼，天氣超好！',
    isFavorite: true,
    tags: ['旅遊', '迪士尼', '合照']
  },
  {
    id: 'photo-2',
    name: '阿公80大壽大合照.jpg',
    url: 'https://images.unsplash.com/photo-1543807535-eceef0bc6599?q=80&w=1200&auto=format&fit=crop',
    thumbnailUrl: 'https://images.unsplash.com/photo-1543807535-eceef0bc6599?q=80&w=600&auto=format&fit=crop',
    date: '2023-09-29', // 同月同日 (歷史上的今天)
    year: '2023',
    month: '09',
    album: '家庭溫馨聚餐',
    location: '台北大直典華',
    camera: 'Sony A7IV',
    description: '祝阿公 80 歲生日快樂！四代同堂大會師～',
    isFavorite: true,
    tags: ['慶生', '阿公', '四代同堂']
  },
  {
    id: 'photo-3',
    name: '陽明山週末露營歡樂時光.jpg',
    url: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?q=80&w=1200&auto=format&fit=crop',
    thumbnailUrl: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?q=80&w=600&auto=format&fit=crop',
    date: '2024-08-18',
    year: '2024',
    month: '08',
    album: '露營與戶外探險',
    location: '台北陽明山露營區',
    camera: 'Fujifilm X-T5',
    description: '夜晚在星空下圍著營火烤棉花糖，小朋友超開心！',
    isFavorite: false,
    tags: ['露營', '戶外', '星空']
  },
  {
    id: 'photo-4',
    name: '台南老街美食與古蹟漫遊.jpg',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop',
    thumbnailUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600&auto=format&fit=crop',
    date: '2023-11-05',
    year: '2023',
    month: '11',
    album: '台南美食小旅行',
    location: '台南神農街',
    camera: 'Canon EOS R6',
    description: '牛肉湯、蝦仁飯、莉莉水果店，吃了三天兩夜暴飲暴食。',
    isFavorite: true,
    tags: ['台南', '美食', '古蹟']
  },
  {
    id: 'photo-5',
    name: '中秋節院子烤肉與月光聚會.jpg',
    url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1200&auto=format&fit=crop',
    thumbnailUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=600&auto=format&fit=crop',
    date: '2022-09-29', // 同月同日 (歷史上的今天)
    year: '2022',
    month: '09',
    album: '節慶與聚會',
    location: '家裡後院',
    camera: 'iPhone 13 Pro',
    description: '中秋烤肉每年必備環節，今年烤魚特別香！',
    isFavorite: false,
    tags: ['中秋節', '烤肉', '聚會']
  },
  {
    id: 'photo-6',
    name: '小朋友國小畢業典禮紀念.jpg',
    url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1200&auto=format&fit=crop',
    thumbnailUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=600&auto=format&fit=crop',
    date: '2024-06-20',
    year: '2024',
    month: '06',
    album: '成長紀錄',
    location: '國民小學大禮堂',
    camera: 'Sony A7IV',
    description: '恭喜小寶國小畢業了！邁向人生下一個階段。',
    isFavorite: true,
    tags: ['畢業典禮', '成長', '紀念']
  },
  {
    id: 'photo-7',
    name: '墾丁海邊夏日踏浪與夕陽.jpg',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600&auto=format&fit=crop',
    date: '2023-07-15',
    year: '2023',
    month: '07',
    album: '露營與戶外探險',
    location: '屏東墾丁白沙灣',
    camera: 'GoPro Hero 11',
    description: '夏天的墾丁海灘夕陽太美了，大家在海邊玩水玩到不想回家。',
    isFavorite: true,
    tags: ['海邊', '墾丁', '夕陽']
  },
  {
    id: 'photo-8',
    name: '2025-農曆春年年夜飯團圓照.jpg',
    url: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=1200&auto=format&fit=crop',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?q=80&w=600&auto=format&fit=crop',
    date: '2025-01-29',
    year: '2025',
    month: '01',
    album: '節慶與聚會',
    location: '家中客廳',
    camera: 'iPhone 16 Pro',
    description: '除夕圍爐年夜飯，發紅包時刻全家歡笑聲不斷！',
    isFavorite: true,
    tags: ['過年', '圍爐', '年夜飯']
  }
];

export const MOCK_ALBUMS = [
  '全部照片',
  '精選最愛',
  '2024 東京家族之旅',
  '家庭溫馨聚餐',
  '露營與戶外探險',
  '台南美食小旅行',
  '節慶與聚會',
  '成長紀錄'
];
