/**
 * ============================================================================
 * NZEST ECOSYSTEM - OFFICIAL WEB INTERACTIVITY (GitHub Pages Edition)
 * ============================================================================
 */

// 1. Sticky Navbar on Scroll
window.addEventListener('scroll', () => {
  const nav = document.getElementById('navbar');
  if (!nav) return;
  if (window.scrollY > 30) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }
});

// 2. Mobile Menu Toggle
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

// 3. Modal Controllers
function openDownloadModal() {
  const modal = document.getElementById('downloadModal');
  if (modal) modal.classList.add('active');
}

function openOrderModal(appId, appName, price) {
  const modal = document.getElementById('orderModal');
  const title = document.getElementById('orderModalTitle');
  const priceTag = document.getElementById('orderModalPrice');

  if (title) title.textContent = `สั่งซื้อสิทธิ์: ${appName}`;
  if (priceTag) priceTag.textContent = `฿${price}.-`;
  if (modal) modal.classList.add('active');
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('active');
}

// Close modal when clicking outside
window.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-backdrop')) {
    e.target.classList.remove('active');
  }
});

// 4. Smooth Anchor Link Scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const targetId = this.getAttribute('href');
    if (targetId && targetId !== '#') {
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({
          behavior: 'smooth'
        });
      }
    }
  });
});
