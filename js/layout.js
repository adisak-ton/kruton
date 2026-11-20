/**
 * ============================================================================
 * js/layout.js
 * สร้างแถบเมนูด้านบน (Navbar), ส่วนท้ายเว็บ (Footer) และ UI Helpers ร่วมกันทุกหน้า
 * ============================================================================
 */

const Layout = (() => {
  const NAV_ITEMS = [
    { label: "หน้าแรก", href: "./index.html", file: "index.html", id: "index" },
    { label: "คลังสื่อสอน", href: "./media.html", file: "media.html", id: "media" },
    { label: "คลังความรู้", href: "./knowledge.html", file: "knowledge.html", id: "knowledge" },
    { label: "เครื่องมือสอน", href: "./tools.html", file: "tools.html", id: "tools" },
    { label: "เช็กงาน", href: "./student-check.html", file: "student-check.html", id: "student-check" },
    { label: "ผลงานนักเรียน", href: "./showcase.html", file: "showcase.html", id: "showcase" }
  ];

  function getCurrentPage() {
    const path = window.location.pathname || "";
    const file = path.split("/").pop() || "index.html";
    return file.toLowerCase();
  }

  function escapeHtml(str) {
    if (str === null || str === undefined) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function formatDateThai(dateStr) {
    if (!dateStr) return "";
    const cleaned = String(dateStr).trim();
    const match = cleaned.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!match) return cleaned;

    const months = [
      "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
      "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
    ];
    const yearBE = parseInt(match[1], 10) + 543;
    const monthIdx = parseInt(match[2], 10) - 1;
    const day = parseInt(match[3], 10);
    if (monthIdx < 0 || monthIdx > 11) return cleaned;
    return `${day} ${months[monthIdx]} ${yearBE}`;
  }

  function renderNavbar() {
    const cfg = window.APP_CONFIG || {};
    const siteName = cfg.SITE_NAME || "ห้องเรียนออนไลน์ วิชาเทคโนโลยี";
    const currentPage = getCurrentPage();
    const isPortfolio = currentPage === "portfolio.html";
    const isAdmin = currentPage === "admin.html";

    const desktopLinks = NAV_ITEMS.map((item) => {
      const isActive = currentPage === item.file || (currentPage === "" && item.file === "index.html");
      const activeClasses = isActive
        ? "bg-blue-50 text-blue-700 font-semibold"
        : "text-slate-600 hover:text-blue-700 hover:bg-slate-100/80 font-medium";
      return `
        <a href="${item.href}" class="px-3 py-2 rounded-lg text-sm lg:text-[15px] transition-colors whitespace-nowrap ${activeClasses}">
          ${item.label}
        </a>
      `;
    }).join("");

    const mobileLinks = NAV_ITEMS.map((item) => {
      const isActive = currentPage === item.file || (currentPage === "" && item.file === "index.html");
      const activeClasses = isActive
        ? "bg-blue-50 text-blue-700 font-semibold border-l-4 border-blue-600"
        : "text-slate-700 hover:bg-slate-50 font-medium";
      return `
        <a href="${item.href}" class="block px-4 py-2.5 rounded-lg text-base transition-colors ${activeClasses}">
          ${item.label}
        </a>
      `;
    }).join("");

    const portfolioBtnClasses = isPortfolio
      ? "bg-amber-500 text-white shadow-md ring-2 ring-amber-300"
      : "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-sm hover:shadow-md";

    const adminBtnClasses = isAdmin
      ? "bg-slate-800 text-white ring-2 ring-slate-300"
      : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900";

    return `
      <header class="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-16 lg:h-[70px] gap-3">
            <!-- Brand -->
            <a href="./index.html" class="flex items-center gap-2.5 group shrink-0">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div class="leading-tight">
                <div class="text-base lg:text-lg font-bold text-slate-800 group-hover:text-blue-700 transition-colors">
                  ${escapeHtml(siteName)}
                </div>
                <div class="text-[11px] text-slate-500 hidden sm:block">
                  วิทยาการคำนวณ • EEC • ชุมนุม
                </div>
              </div>
            </a>

            <!-- Desktop Navigation -->
            <nav class="hidden xl:flex items-center gap-1" aria-label="เมนูหลัก">
              ${desktopLinks}
            </nav>

            <!-- Right CTA Actions -->
            <div class="flex items-center gap-2 shrink-0">
              <a href="./portfolio.html"
                 class="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${portfolioBtnClasses}">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                <span>สำหรับกรรมการ</span>
              </a>

              <a href="./admin.html"
                 title="ระบบจัดการสำหรับครู (Admin)"
                 aria-label="เข้าหน้า Admin"
                 class="inline-flex items-center justify-center w-10 h-10 rounded-xl transition-colors ${adminBtnClasses}">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </a>

              <!-- Mobile Menu Button -->
              <button id="mobile-menu-toggle"
                      type="button"
                      aria-label="เปิดเมนู"
                      aria-expanded="false"
                      class="xl:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">
                <svg id="mobile-menu-icon-open" class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <svg id="mobile-menu-icon-close" class="w-6 h-6 hidden" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Mobile Drawer -->
        <div id="mobile-menu-panel" class="hidden xl:hidden border-t border-slate-200 bg-white shadow-lg">
          <div class="max-w-7xl mx-auto px-4 py-3 space-y-1">
            ${mobileLinks}
            <div class="pt-2 mt-2 border-t border-slate-100 flex flex-col gap-2 sm:hidden">
              <a href="./portfolio.html"
                 class="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold ${portfolioBtnClasses}">
                <span>สำหรับคณะกรรมการประเมิน</span>
              </a>
            </div>
          </div>
        </div>
      </header>
    `;
  }

  function renderFooter() {
    const cfg = window.APP_CONFIG || {};
    const siteName = cfg.SITE_NAME || "ห้องเรียนออนไลน์ วิชาเทคโนโลยี";
    const teacherName = cfg.TEACHER_NAME || "ครูผู้สอนวิชาเทคโนโลยี";
    const schoolName = cfg.SCHOOL_NAME || "กลุ่มสาระการเรียนรู้วิทยาศาสตร์และเทคโนโลยี";
    const year = cfg.ACADEMIC_YEAR || new Date().getFullYear() + 543;

    return `
      <footer class="mt-16 bg-slate-900 text-slate-300 border-t border-slate-800">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <!-- About -->
            <div>
              <div class="flex items-center gap-2.5 mb-3">
                <div class="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                  T
                </div>
                <span class="text-white font-bold text-lg">${escapeHtml(siteName)}</span>
              </div>
              <p class="text-sm text-slate-400 leading-relaxed mb-3">
                ${escapeHtml(cfg.SITE_SUBTITLE || "คลังความรู้ สื่อการสอน และระบบติดตามงานนักเรียน")}
              </p>
              <div class="flex flex-wrap gap-2">
                <span class="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  <span class="w-2 h-2 rounded-full bg-blue-400"></span>วิทยาการคำนวณ
                </span>
                <span class="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-green-500/20 text-green-300 border border-green-500/30">
                  <span class="w-2 h-2 rounded-full bg-green-400"></span>วิชา EEC
                </span>
                <span class="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  <span class="w-2 h-2 rounded-full bg-purple-400"></span>ชุมนุม
                </span>
              </div>
            </div>

            <!-- Quick Links -->
            <div>
              <h3 class="text-white font-semibold mb-3">เมนูลัด</h3>
              <ul class="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
                <li><a href="./index.html" class="hover:text-white transition-colors">หน้าแรก</a></li>
                <li><a href="./media.html" class="hover:text-white transition-colors">คลังสื่อการสอน</a></li>
                <li><a href="./knowledge.html" class="hover:text-white transition-colors">คลังความรู้/ใบงาน</a></li>
                <li><a href="./tools.html" class="hover:text-white transition-colors">เครื่องมือสอน</a></li>
                <li><a href="./student-check.html" class="hover:text-white transition-colors">เช็กสถานะงาน</a></li>
                <li><a href="./showcase.html" class="hover:text-white transition-colors">ผลงานนักเรียน</a></li>
                <li><a href="./portfolio.html" class="text-amber-300 hover:text-amber-200 transition-colors font-medium">สำหรับกรรมการ</a></li>
                <li><a href="./admin.html" class="hover:text-white transition-colors">ผู้ดูแลระบบ</a></li>
              </ul>
            </div>

            <!-- Teacher Contact -->
            <div>
              <h3 class="text-white font-semibold mb-3">ผู้รับผิดชอบห้องเรียน</h3>
              <p class="text-sm text-slate-300 font-medium">${escapeHtml(teacherName)}</p>
              <p class="text-sm text-slate-400 mt-1">${escapeHtml(schoolName)}</p>
              ${cfg.TEACHER_EMAIL ? `<p class="text-sm text-slate-400 mt-2">อีเมล: <span class="text-slate-200">${escapeHtml(cfg.TEACHER_EMAIL)}</span></p>` : ""}
            </div>
          </div>

          <div class="border-t border-slate-800 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
            <p>© ปีการศึกษา ${escapeHtml(year)} ${escapeHtml(siteName)} — พัฒนาเพื่อการศึกษา</p>
            <p>ขับเคลื่อนฐานข้อมูลด้วย Google Sheets &amp; Google Apps Script</p>
          </div>
        </div>
      </footer>
    `;
  }

  function mount() {
    const navMount = document.getElementById("app-navbar");
    if (navMount) {
      navMount.innerHTML = renderNavbar();
      const toggleBtn = document.getElementById("mobile-menu-toggle");
      const panel = document.getElementById("mobile-menu-panel");
      const iconOpen = document.getElementById("mobile-menu-icon-open");
      const iconClose = document.getElementById("mobile-menu-icon-close");

      if (toggleBtn && panel) {
        toggleBtn.addEventListener("click", () => {
          const isHidden = panel.classList.toggle("hidden");
          toggleBtn.setAttribute("aria-expanded", String(!isHidden));
          if (iconOpen && iconClose) {
            iconOpen.classList.toggle("hidden", !isHidden);
            iconClose.classList.toggle("hidden", isHidden);
          }
        });
      }
    }

    const footerMount = document.getElementById("app-footer");
    if (footerMount) {
      footerMount.innerHTML = renderFooter();
    }
  }

  /**
   * แสดงสถานะ Loading ระหว่างรอข้อมูลจาก Google Apps Script
   */
  function renderLoading(message = "กำลังโหลดข้อมูลจาก Google Sheets...") {
    return `
      <div class="flex flex-col items-center justify-center py-14 px-4 text-center">
        <div class="w-11 h-11 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin mb-4"></div>
        <p class="text-slate-600 font-medium">${escapeHtml(message)}</p>
        <p class="text-xs text-slate-400 mt-1">โปรดรอสักครู่ ระบบกำลังเชื่อมต่อฐานข้อมูล</p>
      </div>
    `;
  }

  function renderError(message = "ไม่สามารถโหลดข้อมูลได้ในขณะนี้") {
    return `
      <div class="bg-red-50 border border-red-200 rounded-2xl p-6 text-center max-w-xl mx-auto my-6">
        <div class="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 class="text-red-800 font-semibold text-base mb-1">เกิดข้อผิดพลาดในการเชื่อมต่อ</h3>
        <p class="text-red-600 text-sm">${escapeHtml(message)}</p>
        <button onclick="window.location.reload()" class="mt-4 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors">
          ลองใหม่อีกครั้ง
        </button>
      </div>
    `;
  }

  function renderEmpty(message = "ไม่พบข้อมูลที่ตรงกับเงื่อนไข") {
    return `
      <div class="bg-white border border-dashed border-slate-300 rounded-2xl py-12 px-6 text-center">
        <div class="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
          <svg class="w-7 h-7" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <p class="text-slate-600 font-medium">${escapeHtml(message)}</p>
      </div>
    `;
  }

  function showToast(message, type = "info") {
    let container = document.getElementById("app-toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "app-toast-container";
      container.className = "fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm";
      document.body.appendChild(container);
    }

    const styles = {
      success: "bg-emerald-600 text-white",
      error: "bg-red-600 text-white",
      info: "bg-slate-800 text-white"
    };

    const toast = document.createElement("div");
    toast.className = `${styles[type] || styles.info} px-4 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 animate-fade-in`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transition = "opacity 0.25s ease";
      setTimeout(() => toast.remove(), 260);
    }, 3000);
  }

  document.addEventListener("DOMContentLoaded", mount);

  return {
    mount,
    escapeHtml,
    formatDateThai,
    renderLoading,
    renderError,
    renderEmpty,
    showToast
  };
})();

window.Layout = Layout;
