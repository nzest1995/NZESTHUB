/**
 * ============================================================================
 * NZEST ECOSYSTEM - OFFICIAL WEB ENGINE & REAL-TIME FIRESTORE SYNC
 * ============================================================================
 */

// 1. Firebase Configuration (Direct Real-Time Cloud Firestore Sync)
const firebaseConfig = {
  apiKey: "AIzaSyDWcw09fdj2tI3RA6Utpw8b5QUCR13ImFc",
  authDomain: "nzestdatabase.firebaseapp.com",
  databaseURL: "https://nzestdatabase.firebaseio.com",
  projectId: "nzestdatabase",
  storageBucket: "nzestdatabase.firebasestorage.app",
  messagingSenderId: "116869488263",
  appId: "1:116869488263:web:36d4882ed81afe11dae222",
  measurementId: "G-B2DBJRQC8K"
};

let db = null;

// Fallback Default Apps (in case user is offline)
const defaultApps = [
  {
    id: 'SFX_STUDIO',
    name: 'NZEST SFX STUDIO',
    category: 'audio',
    latestVersion: 'V.2.063',
    price: '249',
    originalPrice: '459',
    description: 'คลังเสียงเอฟเฟกต์และ Multi-Track Sound Engine ระดับสตูดิโอ พร้อม Hotkey ควบคุมเสียงแบบเรียลไทม์ และปลั๊กอิน Premiere Pro Extension',
    features: [
      'เล่นเสียงเอฟเฟกต์แบบ Multi-Track ซ้อนกันได้ไม่สะดุด',
      'Adobe Premiere Pro CEP Extension ลากวางเสียงลงไทม์ไลน์ทันที',
      'Global Background Hotkey กดปุ่มลัดได้แม้พับหน้าต่าง',
      'รองรับ MP3, WAV, AAC, FLAC, OGG, M4A ค้นหาด้วยความเร็วสูง'
    ],
    icon: '🎵',
    status: 'ACTIVE'
  },
  {
    id: 'NZEST_CUT',
    name: 'NZEST CUT',
    category: 'video',
    latestVersion: 'V.0.049',
    price: '249',
    originalPrice: '490',
    description: 'โปรแกรมตัดต่อวิดีโอ AI อัจฉริยะ ตรวจจับและตัดช่วงเงียบ (Silence Removal) อัตโนมัติในไม่กี่วินาที พร้อมสร้างซับไตเติลภาษาไทยแม่นยำ',
    features: [
      'AI Voice Activity Detection (VAD) ตัดช่วงเงียบอัตโนมัติแม่นยำ 99%',
      'ส่งออกไฟล์ XML สำหรับ Premiere Pro และ DaVinci Resolve ทันที',
      'สร้างซับไตเติลภาษาไทยอัตโนมัติด้วย Whisper AI Engine',
      'ประมวลผลบนเครื่องของคุณ 100% ปลอดภัย ไม่ต้องอัปโหลดขึ้นเน็ต'
    ],
    icon: '🎬',
    status: 'ACTIVE'
  },
  {
    id: 'NZEST_DECK',
    name: 'NZEST DECK PRO',
    category: 'audio',
    latestVersion: 'V.0.047',
    price: '459',
    originalPrice: '690',
    description: 'เปลี่ยนสมาร์ทโฟนหรือแท็บเล็ตของคุณให้กลายเป็น Stream Deck ไร้สาย สั่งเปิดแอป เปลี่ยนซีน OBS และกด Soundboard ได้จากมือถือ',
    features: [
      'สแกน QR Code เพื่อเชื่อมต่อมือถือผ่าน LAN / Wi-Fi ทันที',
      'ควบคุม OBS Studio, ปรับระดับเสียง, เปิดโปรแกรม ด้วย 1-Tap',
      'ปรับแต่งไอคอน สี และปุ่มกดได้อย่างอิสระบนหน้าจอเว็บ',
      'เชื่อมต่อลื่นไหล ไม่ต้องลงแอปเพิ่มเติมในมือถือ'
    ],
    icon: '🎮',
    status: 'Coming_Soon'
  }
];

// Helper: Format Version String Cleanly (e.g. 0.0.58 -> V.0.058, 2.0.63 -> V.2.063)
function cleanDisplayVersion(v) {
  if (!v) return 'V.1.0';
  let s = String(v).trim().replace(/^[vV][.]?/, '');
  const parts = s.split('.');
  while (parts.length > 2 && parts[parts.length - 1] === '0') {
    parts.pop();
  }
  if (parts.length === 3) {
    if (parts[0] === '0' && parts[1] === '0') {
      s = '0.0' + parts[2];
    } else if (parts[1] === '0') {
      s = parts[0] + '.' + parts[2].padStart(3, '0');
    } else {
      s = parts.join('.');
    }
  } else {
    s = parts.join('.');
  }
  return s.startsWith('V.') || s.startsWith('v.') ? s : 'V.' + s;
}

// Helper: Format Price nicely with Baht symbol
function formatPrice(p) {
  if (!p) return '฿249.-';
  const clean = String(p).trim().replace(/[^0-9.]/g, '');
  return clean ? `฿${clean}.-` : String(p);
}

// 2. Initialize App and Real-Time Listeners
document.addEventListener('DOMContentLoaded', () => {
  // Init Navbar scroll listener
  initNavbarScroll();

  // Try Initialize Firebase
  try {
    if (typeof firebase !== 'undefined' && firebase.initializeApp) {
      const app = firebase.initializeApp(firebaseConfig);
      db = firebase.firestore(app);
      console.log('⚡ [Firebase] Firestore initialized successfully!');
      
      const statusText = document.getElementById('dbSyncStatusText');
      if (statusText) statusText.textContent = 'Firebase Firestore Real-Time Sync Connected 🟢';

      // Start Real-time sync listeners
      startRealtimeFirestoreSync();
    } else {
      throw new Error('Firebase SDK not loaded');
    }
  } catch (err) {
    console.warn('⚠️ [Firebase] Fallback to local default data:', err.message);
    renderProducts(defaultApps);
  }
});

// 3. Real-Time Firestore Sync
function startRealtimeFirestoreSync() {
  if (!db) return;

  // A. Listen to App Releases Collection
  db.collection('app_releases').onSnapshot((snapshot) => {
    if (snapshot && !snapshot.empty) {
      const apps = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        apps.push({
          id: doc.id,
          ...data
        });
      });
      console.log(`📦 [Firestore] Received ${apps.length} apps in real-time`);
      renderProducts(apps);
    } else {
      renderProducts(defaultApps);
    }
  }, (err) => {
    console.error('Firestore app_releases error:', err);
    renderProducts(defaultApps);
  });

  // B. Listen to Hub Self-Update Config
  db.collection('system_config').doc('hub_update').onSnapshot((doc) => {
    if (doc.exists) {
      const data = doc.data();
      const rawVer = data.version || '0.0.58';
      const cleanVer = cleanDisplayVersion(rawVer);
      const downloadUrl = data.download_url || 'https://github.com/nzest1995/NZESTHUB/releases';

      // Update navbar download button
      const navVerTag = document.getElementById('navHubVerTag');
      if (navVerTag) navVerTag.textContent = cleanVer;

      // Update hero elements
      const heroBadge = document.getElementById('heroBadgeText');
      if (heroBadge) heroBadge.textContent = `✨ NZEST HUB ${cleanVer} Official Release • Real-Time Firestore Sync Active`;

      const heroBtn = document.getElementById('heroHubVerBtn');
      if (heroBtn) heroBtn.textContent = `${cleanVer}`;

      // Update Modal
      const modalVer = document.getElementById('modalHubVerText');
      if (modalVer) modalVer.textContent = `เวอร์ชันล่าสุด ${cleanVer} (Windows 64-bit)`;

      const directLink = document.getElementById('modalHubDirectDownloadLink');
      if (directLink && downloadUrl) directLink.href = downloadUrl;
    }
  }, (err) => {
    console.error('Firestore hub_update error:', err);
  });

  // C. Listen to Tutorials Collection (if any)
  db.collection('tutorials').onSnapshot((snapshot) => {
    if (snapshot && !snapshot.empty) {
      const tutorials = [];
      snapshot.forEach(doc => tutorials.push({ id: doc.id, ...doc.data() }));
      renderTutorials(tutorials);
    }
  }, (err) => {
    console.warn('Firestore tutorials query skipped:', err);
  });
}

// 4. Render Product Cards dynamically
function renderProducts(apps) {
  const grid = document.getElementById('productGrid');
  if (!grid) return;

  if (!apps || apps.length === 0) {
    apps = defaultApps;
  }

  // Sort apps: active first, then by id
  apps.sort((a, b) => {
    if (a.status === 'Coming_Soon' && b.status !== 'Coming_Soon') return 1;
    if (a.status !== 'Coming_Soon' && b.status === 'Coming_Soon') return -1;
    return (a.name || '').localeCompare(b.name || '');
  });

  grid.innerHTML = apps.map(app => {
    const isComingSoon = app.status === 'Coming_Soon';
    const cleanVer = cleanDisplayVersion(app.latestVersion || app.version || '1.0');
    const displayPrice = formatPrice(app.price || '249');
    const displayOriginal = app.originalPrice ? `฿${String(app.originalPrice).replace(/[^0-9]/g, '')}` : (isComingSoon ? '฿490' : '฿459');
    
    // Choose icon
    let icon = app.icon || '⚡';
    if (!app.icon) {
      const idUpper = (app.id || '').toUpperCase();
      if (idUpper.includes('SFX') || idUpper.includes('AUDIO')) icon = '🎵';
      else if (idUpper.includes('CUT') || idUpper.includes('VIDEO')) icon = '🎬';
      else if (idUpper.includes('DECK') || idUpper.includes('STREAM')) icon = '🎮';
    }

    // Category label
    let catLabel = (app.category || 'Productivity').toUpperCase();
    if (catLabel === 'AUDIO') catLabel = 'Audio & Sound FX';
    else if (catLabel === 'VIDEO') catLabel = 'Video & Animation AI';

    // Features list
    let featuresHtml = '';
    if (Array.isArray(app.features) && app.features.length > 0) {
      featuresHtml = app.features.map(f => `
        <li class="product-feature-item">
          <span class="check">✓</span> ${escapeHtml(f)}
        </li>
      `).join('');
    } else {
      featuresHtml = `
        <li class="product-feature-item"><span class="check">✓</span> รองรับระบบ Windows 10/11 64-bit สมบูรณ์แบบ</li>
        <li class="product-feature-item"><span class="check">✓</span> สิทธิ์ใช้งานตลอดชีพ LIFETIME (Node-Locked 1 HWID)</li>
        <li class="product-feature-item"><span class="check">✓</span> อัปเดตฟรีตลอดชีพผ่านระบบ NZEST HUB</li>
      `;
    }

    const appName = escapeHtml(app.name || app.id);
    const desc = escapeHtml(app.description || 'ชุดโปรแกรมระดับมืออาชีพในเครือ NZEST Ecosystem');

    return `
      <div class="product-card" id="card_${app.id}">
        <div>
          <div class="product-card-top">
            <div class="product-icon-wrap">${icon}</div>
            <span class="product-badge-pill">${cleanVer} • ${isComingSoon ? 'Exclusive Release' : 'Official Release'}</span>
          </div>
          <div class="product-category">${escapeHtml(catLabel)}</div>
          <h3 class="product-name">${appName}</h3>
          <p class="product-desc">${desc}</p>

          <ul class="product-features">
            ${featuresHtml}
          </ul>
        </div>

        <div class="product-pricing-bar">
          <div>
            ${isComingSoon ? `
              <span class="price-text">เร็วๆ นี้ <span class="old-price">${displayOriginal}</span></span>
              <div style="font-size: 0.75rem; color: #a855f7;">Exclusive Streamer Release</div>
            ` : `
              <span class="price-text">${displayPrice} <span class="old-price">${displayOriginal}</span></span>
              <div style="font-size: 0.75rem; color: #10b981;">สิทธิ์ LIFETIME (ซื้อขาด 1 HWID)</div>
            `}
          </div>

          ${isComingSoon ? `
            <button class="btn-card-action" style="background: rgba(255,255,255,0.1); color: #fff; cursor: not-allowed;" disabled>
              ⏳ เร็วๆ นี้
            </button>
          ` : `
            <button class="btn-card-action" onclick="openOrderModal('${app.id}', '${appName}', '${app.price || '249'}')">
              🛒 สั่งซื้อทันที
            </button>
          `}
        </div>
      </div>
    `;
  }).join('');
}

// 5. Render Video Tutorials (if available in Firestore)
function renderTutorials(tutorials) {
  const section = document.getElementById('tutorials');
  const navLink = document.getElementById('navTutorialsLink');
  const grid = document.getElementById('tutorialsGrid');

  if (!section || !grid || !tutorials || tutorials.length === 0) return;

  section.style.display = 'block';
  if (navLink) navLink.style.display = 'inline-block';

  grid.innerHTML = tutorials.map(t => {
    let embedUrl = '';
    if (t.youtubeUrl) {
      const match = t.youtubeUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
      if (match && match[1]) {
        embedUrl = `https://www.youtube.com/embed/${match[1]}`;
      }
    }

    return `
      <div style="background: rgba(14, 22, 38, 0.8); border: 1px solid rgba(56, 189, 248, 0.2); border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
        ${embedUrl ? `
          <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;">
            <iframe src="${embedUrl}" style="position: absolute; top:0; left: 0; width: 100%; height: 100%; border:0;" allowfullscreen></iframe>
          </div>
        ` : ''}
        <div style="padding: 20px;">
          <h4 style="font-size: 1.1rem; color: #fff; font-weight: 700;">${escapeHtml(t.title || 'วิดีโอแนะนำ')}</h4>
          <p style="font-size: 0.85rem; color: #94a3b8; margin-top: 6px;">${escapeHtml(t.description || '')}</p>
        </div>
      </div>
    `;
  }).join('');
}

// 6. UI Helpers & Modals
function initNavbarScroll() {
  window.addEventListener('scroll', () => {
    const nav = document.getElementById('navbar');
    if (!nav) return;
    if (window.scrollY > 30) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  });
}

function toggleMobileMenu() {
  const links = document.querySelector('.nav-links');
  if (links) {
    if (links.style.display === 'flex') {
      links.style.display = 'none';
    } else {
      links.style.display = 'flex';
      links.style.flexDirection = 'column';
      links.style.position = 'absolute';
      links.style.top = '72px';
      links.style.left = '0';
      links.style.right = '0';
      links.style.background = 'rgba(4, 7, 14, 0.98)';
      links.style.padding = '24px';
      links.style.borderBottom = '1px solid rgba(0, 242, 254, 0.3)';
    }
  }
}

function openDownloadModal() {
  const modal = document.getElementById('downloadModal');
  if (modal) modal.classList.add('active');
}

function openOrderModal(appId, appName, price) {
  const modal = document.getElementById('orderModal');
  const title = document.getElementById('orderModalTitle');
  const priceTag = document.getElementById('orderModalPrice');

  if (title) title.textContent = `สั่งซื้อสิทธิ์: ${appName}`;
  if (priceTag) priceTag.textContent = formatPrice(price);
  if (modal) modal.classList.add('active');
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('active');
}

window.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-backdrop')) {
    e.target.classList.remove('active');
  }
});

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
