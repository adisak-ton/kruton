/**
 * ============================================================================
 * js/classroom-kit.js
 * เครื่องมือช่วยสอนในห้องเรียน (Classroom Teaching Kit):
 * 1) QR Code Popup Modal (qrcodejs ผ่าน CDN) รองรับโหมดขยายใหญ่เต็มจอโปรเจกเตอร์
 * 2) Fullscreen Preview Modal สำหรับเปิดสื่อการสอน/เอกสาร PDF/ผลงานเต็มหน้าจอ
 * 3) ระบบเสียงแจ้งเตือนห้องเรียน (Web Audio API) สำหรับวงล้อสุ่มชื่อและนาฬิกาจับเวลา
 * 4) ฟังก์ชันสุ่มเรียงลำดับและสุ่มแบ่งกลุ่มนักเรียน
 * ============================================================================
 */

const ClassroomKit = (() => {
  const QRCODE_CDN = "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js";
  let qrScriptPromise = null;
  let audioCtx = null;

  function ensureQrLibrary() {
    if (typeof window.QRCode !== "undefined") {
      return Promise.resolve();
    }
    if (qrScriptPromise) return qrScriptPromise;

    qrScriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = QRCODE_CDN;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("ไม่สามารถโหลดไลบรารี QR Code จาก CDN ได้"));
      document.head.appendChild(script);
    });

    return qrScriptPromise;
  }

  function escapeHtml(str) {
    if (window.Layout && window.Layout.escapeHtml) {
      return window.Layout.escapeHtml(str);
    }
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // ==========================================================================
  // 1. QR Code Popup Modal (รองรับโหมดขยายใหญ่เต็มจอโปรเจกเตอร์)
  // ==========================================================================

  function ensureQrModalDom() {
    let modal = document.getElementById("ck-qr-modal");
    if (modal) return modal;

    modal = document.createElement("div");
    modal.id = "ck-qr-modal";
    modal.className = "fixed inset-0 z-[60] hidden items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4";
    modal.innerHTML = `
      <div id="ck-qr-card" class="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-fade-in border border-slate-200 transition-all">
        <!-- Header -->
        <div class="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between text-white">
          <div class="flex items-center gap-2.5">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            <h3 class="font-bold text-lg">สแกน QR Code เข้าใช้งาน</h3>
          </div>
          <div class="flex items-center gap-1.5">
            <button id="ck-qr-fullscreen" type="button" title="ขยายเต็มจอโปรเจกเตอร์"
                    class="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>
            <button id="ck-qr-close" type="button" class="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors" aria-label="ปิดหน้าต่าง">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Body -->
        <div class="p-6 text-center">
          <p id="ck-qr-subtitle" class="text-xs font-semibold uppercase tracking-wide text-blue-600 mb-1"></p>
          <h4 id="ck-qr-title" class="text-lg sm:text-xl font-bold text-slate-800 mb-5 line-clamp-2"></h4>

          <div class="inline-flex items-center justify-center p-5 bg-white rounded-2xl border-2 border-slate-200 shadow-inner mb-4">
            <div id="ck-qr-canvas" class="flex items-center justify-center"></div>
          </div>

          <p id="ck-qr-url-text" class="text-xs text-slate-400 break-all line-clamp-2 px-2 mb-5"></p>

          <div class="grid grid-cols-2 gap-3 max-w-sm mx-auto">
            <button id="ck-qr-copy" type="button"
                    class="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              คัดลอกลิงก์
            </button>
            <button id="ck-qr-download" type="button"
                    class="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              บันทึกรูป QR
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const close = () => {
      if (document.fullscreenElement === modal) {
        document.exitFullscreen().catch(() => {});
      }
      modal.classList.add("hidden");
      modal.classList.remove("flex");
    };

    modal.querySelector("#ck-qr-close").addEventListener("click", close);
    modal.querySelector("#ck-qr-fullscreen").addEventListener("click", () => {
      if (!document.fullscreenElement) {
        modal.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    });
    modal.addEventListener("click", (e) => {
      if (e.target === modal) close();
    });

    return modal;
  }

  /**
   * เปิด Popup แสดง QR Code สำหรับลิงก์สื่อการสอน ใบงาน หรือเครื่องมือออนไลน์
   * @param {{ title: string, url: string, subtitle?: string, projectorMode?: boolean }} options
   */
  async function openQrModal({ title = "สื่อการสอน", url = "", subtitle = "", projectorMode = false } = {}) {
    if (!url) {
      if (window.Layout) Layout.showToast("ไม่พบลิงก์สำหรับสร้าง QR Code", "error");
      return;
    }

    const modal = ensureQrModalDom();
    const card = modal.querySelector("#ck-qr-card");
    const titleEl = modal.querySelector("#ck-qr-title");
    const subtitleEl = modal.querySelector("#ck-qr-subtitle");
    const urlTextEl = modal.querySelector("#ck-qr-url-text");
    const qrContainer = modal.querySelector("#ck-qr-canvas");
    const copyBtn = modal.querySelector("#ck-qr-copy");
    const dlBtn = modal.querySelector("#ck-qr-download");

    const qrSize = projectorMode ? 340 : 240;
    card.classList.toggle("max-w-xl", projectorMode);
    card.classList.toggle("max-w-md", !projectorMode);

    titleEl.textContent = title;
    subtitleEl.textContent = subtitle || (projectorMode ? "โหมดโปรเจกเตอร์ — สแกน QR Code จากที่นั่งได้ทันที" : "ใช้กล้องมือถือสแกนเพื่อเปิดสื่อทันที");
    urlTextEl.textContent = url;
    qrContainer.style.width = `${qrSize}px`;
    qrContainer.style.height = `${qrSize}px`;
    qrContainer.innerHTML = `<div class="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>`;

    modal.classList.remove("hidden");
    modal.classList.add("flex");

    if (projectorMode && modal.requestFullscreen) {
      modal.requestFullscreen().catch(() => {});
    }

    try {
      await ensureQrLibrary();
      qrContainer.innerHTML = "";
      new window.QRCode(qrContainer, {
        text: url,
        width: qrSize,
        height: qrSize,
        colorDark: "#0f172a",
        colorLight: "#ffffff",
        correctLevel: window.QRCode.CorrectLevel.H
      });
    } catch (err) {
      qrContainer.innerHTML = `<p class="text-xs text-red-500 p-4">${escapeHtml(err.message)}</p>`;
    }

    copyBtn.onclick = async () => {
      try {
        await navigator.clipboard.writeText(url);
        if (window.Layout) Layout.showToast("คัดลอกลิงก์เรียบร้อยแล้ว", "success");
      } catch {
        window.prompt("คัดลอกลิงก์นี้:", url);
      }
    };

    dlBtn.onclick = () => {
      const canvas = qrContainer.querySelector("canvas");
      const img = qrContainer.querySelector("img");
      let dataUrl = "";
      if (canvas) dataUrl = canvas.toDataURL("image/png");
      else if (img && img.src) dataUrl = img.src;

      if (!dataUrl) {
        if (window.Layout) Layout.showToast("ยังไม่สามารถบันทึกรูป QR ได้", "error");
        return;
      }
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `qr-${(title || "classroom").replace(/[^a-zA-Z0-9ก-๙_-]/g, "_").slice(0, 40)}.png`;
      a.click();
    };
  }

  // ==========================================================================
  // 2. Fullscreen Preview Modal (สำหรับเปิดสอนสดบนโปรเจกเตอร์ ดู PDF และผลงาน)
  // ==========================================================================

  function ensurePreviewModalDom() {
    let modal = document.getElementById("ck-preview-modal");
    if (modal) return modal;

    modal = document.createElement("div");
    modal.id = "ck-preview-modal";
    modal.className = "fixed inset-0 z-50 hidden flex-col bg-slate-950/95 backdrop-blur-sm";
    modal.innerHTML = `
      <div class="flex items-center justify-between gap-3 px-4 sm:px-6 py-3 bg-slate-900 border-b border-slate-800 text-white shrink-0">
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2">
            <span id="ck-prev-badge" class="hidden sm:inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30"></span>
            <h3 id="ck-prev-title" class="text-sm sm:text-base font-bold truncate"></h3>
          </div>
          <p id="ck-prev-subtitle" class="text-xs text-slate-400 truncate mt-0.5"></p>
        </div>

        <div class="flex items-center gap-2 shrink-0">
          <button id="ck-prev-qr" type="button" title="แสดง QR Code ให้เด็กสแกน"
                  class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-medium transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            <span class="hidden md:inline">QR Code</span>
          </button>

          <button id="ck-prev-fullscreen" type="button" title="ขยายเต็มจอโปรเจกเตอร์"
                  class="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-medium transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
            <span class="hidden md:inline">เต็มจอ</span>
          </button>

          <a id="ck-prev-download" href="#" target="_blank" rel="noopener noreferrer"
             class="hidden items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-medium transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span class="hidden sm:inline">ดาวน์โหลด</span>
          </a>

          <a id="ck-prev-external" href="#" target="_blank" rel="noopener noreferrer"
             class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-medium transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            <span class="hidden sm:inline">เปิดแท็บใหม่</span>
          </a>

          <button id="ck-prev-close" type="button" aria-label="ปิดหน้าต่างพรีวิว"
                  class="w-9 h-9 rounded-xl bg-red-500/20 hover:bg-red-600 text-red-200 hover:text-white flex items-center justify-center transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div class="relative flex-1 bg-slate-950 overflow-hidden">
        <div id="ck-prev-loader" class="absolute inset-0 flex flex-col items-center justify-center text-slate-300 z-10 pointer-events-none">
          <div class="w-10 h-10 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin mb-3"></div>
          <p class="text-sm">กำลังโหลดหน้าต่างพรีวิว...</p>
        </div>
        <iframe id="ck-prev-iframe"
                class="relative z-20 w-full h-full border-0 bg-white"
                allow="autoplay; fullscreen"
                allowfullscreen></iframe>
      </div>
    `;

    document.body.appendChild(modal);

    const closeModal = () => {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      modal.classList.add("hidden");
      modal.classList.remove("flex");
      modal.querySelector("#ck-prev-iframe").src = "about:blank";
      document.body.style.overflow = "";
    };

    modal.querySelector("#ck-prev-close").addEventListener("click", closeModal);
    modal.querySelector("#ck-prev-fullscreen").addEventListener("click", () => {
      if (!document.fullscreenElement) {
        modal.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        const qrModal = document.getElementById("ck-qr-modal");
        if (qrModal && !qrModal.classList.contains("hidden")) {
          qrModal.classList.add("hidden");
          qrModal.classList.remove("flex");
          return;
        }
        if (!modal.classList.contains("hidden")) {
          closeModal();
        }
      }
    });

    return modal;
  }

  function openPreviewModal({ title = "", subtitle = "", url = "", downloadUrl = "", badge = "", onDownload = null } = {}) {
    if (!url) {
      if (window.Layout) Layout.showToast("ไม่พบลิงก์สำหรับเปิดดูตัวอย่าง", "error");
      return;
    }

    const modal = ensurePreviewModalDom();
    const converted = window.API ? API.convertGoogleDriveLink(url) : { previewUrl: url, downloadUrl: url };
    const previewUrl = converted.previewUrl || url;
    const finalDownloadUrl = downloadUrl || converted.downloadUrl || url;

    modal.querySelector("#ck-prev-title").textContent = title || "พรีวิวสื่อการสอน";
    modal.querySelector("#ck-prev-subtitle").textContent = subtitle || "";

    const badgeEl = modal.querySelector("#ck-prev-badge");
    if (badge) {
      badgeEl.textContent = badge;
      badgeEl.classList.remove("hidden");
    } else {
      badgeEl.classList.add("hidden");
    }

    modal.querySelector("#ck-prev-external").href = url;

    const dlEl = modal.querySelector("#ck-prev-download");
    if (finalDownloadUrl) {
      dlEl.href = finalDownloadUrl;
      dlEl.classList.remove("hidden");
      dlEl.classList.add("inline-flex");
      dlEl.onclick = () => {
        if (typeof onDownload === "function") onDownload();
      };
    } else {
      dlEl.classList.add("hidden");
      dlEl.classList.remove("inline-flex");
      dlEl.onclick = null;
    }

    modal.querySelector("#ck-prev-qr").onclick = () => {
      openQrModal({ title, url, subtitle: badge || subtitle });
    };

    const loader = modal.querySelector("#ck-prev-loader");
    const iframe = modal.querySelector("#ck-prev-iframe");
    loader.classList.remove("hidden");
    iframe.onload = () => loader.classList.add("hidden");
    iframe.src = previewUrl;

    document.body.style.overflow = "hidden";
    modal.classList.remove("hidden");
    modal.classList.add("flex");
  }

  // ==========================================================================
  // 3. ระบบเสียงแจ้งเตือนห้องเรียน (Web Audio API — ไม่ต้องพึ่งไฟล์ mp3 ภายนอก)
  // ==========================================================================

  function getAudioContext() {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    if (!audioCtx) audioCtx = new AudioCtx();
    if (audioCtx.state === "suspended") {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  }

  function playTone(freq, startOffset, duration, type = "sine", volume = 0.25) {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime + startOffset;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  /** เสียงติ๊กเบาๆ ระหว่างหมุนวงล้อ */
  function playTickSound() {
    playTone(720, 0, 0.045, "triangle", 0.12);
  }

  /** เสียงเฉลิมฉลองเมื่อสุ่มได้ชื่อนักเรียน */
  function playWinSound() {
    playTone(523.25, 0.0, 0.16, "triangle", 0.25);  // C5
    playTone(659.25, 0.14, 0.16, "triangle", 0.25); // E5
    playTone(783.99, 0.28, 0.18, "triangle", 0.28); // G5
    playTone(1046.5, 0.44, 0.45, "triangle", 0.30); // C6
  }

  /** เสียงกระดิ่งแจ้งเตือนเมื่อหมดเวลาในห้องเรียน */
  function playAlarmSound() {
    for (let i = 0; i < 3; i++) {
      const base = i * 0.55;
      playTone(880, base, 0.22, "sine", 0.35);
      playTone(1174.66, base + 0.2, 0.28, "sine", 0.35);
    }
  }

  // ==========================================================================
  // 4. ฟังก์ชันสุ่มรายชื่อและสุ่มแบ่งกลุ่มนักเรียน
  // ==========================================================================

  function shuffleArray(list) {
    const arr = [...list];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function splitIntoGroups(names, groupCount) {
    const clean = names.map((n) => String(n || "").trim()).filter(Boolean);
    const count = Math.max(1, Math.min(Number(groupCount) || 2, clean.length || 1));
    const shuffled = shuffleArray(clean);
    const groups = Array.from({ length: count }, () => []);
    shuffled.forEach((name, idx) => {
      groups[idx % count].push(name);
    });
    return groups;
  }

  return {
    openQrModal,
    openPreviewModal,
    playTickSound,
    playWinSound,
    playAlarmSound,
    shuffleArray,
    splitIntoGroups
  };
})();

window.ClassroomKit = ClassroomKit;
