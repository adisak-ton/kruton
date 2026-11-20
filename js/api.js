/**
 * ============================================================================
 * js/api.js
 * โมดูลสื่อสารกับ Google Apps Script (GET / POST) และแปลงลิงก์ Google Drive
 * ============================================================================
 */

const API = (() => {
  /**
   * ตรวจสอบว่ามีการตั้งค่า API_URL ใน config.js แล้วหรือไม่
   * @returns {string}
   */
  function getApiUrl() {
    const url = (window.APP_CONFIG && window.APP_CONFIG.API_URL) ? window.APP_CONFIG.API_URL.trim() : "";
    if (!url) {
      throw new Error("ยังไม่ได้ตั้งค่า API_URL ในไฟล์ js/config.js กรุณานำลิงก์ Web App จาก Google Apps Script มาใส่ก่อนใช้งาน");
    }
    return url;
  }

  /**
   * ดึงข้อมูลจาก Google Apps Script ด้วย HTTP GET
   * @param {string} action - ชื่อ action ที่ต้องการเรียก เช่น 'getAll', 'getSheet', 'checkWork'
   * @param {Object} [params={}] - พารามิเตอร์เพิ่มเติมใน query string
   * @returns {Promise<Object>}
   */
  async function get(action, params = {}) {
    const baseUrl = getApiUrl();
    const url = new URL(baseUrl);

    if (action) {
      url.searchParams.set("action", action);
    }

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    });

    const response = await fetch(url.toString(), {
      method: "GET",
      redirect: "follow"
    });

    if (!response.ok) {
      throw new Error(`ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ (HTTP ${response.status})`);
    }

    const result = await response.json();
    if (result && result.success === false) {
      throw new Error(result.error || "เกิดข้อผิดพลาดในการดึงข้อมูล");
    }

    return result;
  }

  /**
   * ส่งข้อมูลไปยัง Google Apps Script ด้วย HTTP POST
   * ใช้ Content-Type: text/plain;charset=utf-8 เพื่อหลีกเลี่ยง CORS Preflight (OPTIONS)
   * @param {string} action - ชื่อคำสั่ง เช่น 'trackView', 'trackDownload', 'submitFeedback', 'addRecord'
   * @param {Object} [payload={}] - ข้อมูลที่ต้องการส่ง
   * @returns {Promise<Object>}
   */
  async function post(action, payload = {}) {
    const baseUrl = getApiUrl();
    const body = JSON.stringify({
      action,
      ...payload
    });

    const response = await fetch(baseUrl, {
      method: "POST",
      redirect: "follow",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body
    });

    if (!response.ok) {
      throw new Error(`ไม่สามารถส่งข้อมูลไปยังเซิร์ฟเวอร์ได้ (HTTP ${response.status})`);
    }

    const result = await response.json();
    if (result && result.success === false) {
      throw new Error(result.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }

    return result;
  }

  // ==========================================================================
  // ฟังก์ชันช่วยเรียกใช้งาน Endpoints หลักของระบบ
  // ==========================================================================

  /** ดึงข้อมูลทั้งหมดสำหรับแสดงผลหน้าเว็บ (ไม่รวมข้อมูลส่วนบุคคลนักเรียนตามหลัก PDPA) */
  function getAllData() {
    return get("getAll");
  }

  /** ดึงข้อมูลแยกตามชื่อแท็บ (เช่น Announcements, Teaching_Media, Knowledge_Hub) */
  function getSheetData(sheetName) {
    return get("getSheet", { sheet: sheetName });
  }

  /** ค้นหาสถานะการส่งงานรายบุคคลด้วยรหัสนักเรียน (PDPA Safe) */
  function checkStudentWork(studentId) {
    return get("checkWork", { studentId: String(studentId || "").trim() });
  }

  /** ดึงรายชื่อนักเรียนและห้องเรียนสำหรับวงล้อสุ่มชื่อ (ไม่รวมรหัสหรือคะแนน) */
  function getStudentRoster() {
    return get("getStudentRoster");
  }

  /** ตรวจสอบรหัส ADMIN_PIN สำหรับเข้าสู่ระบบหลังบ้าน */
  function verifyAdminPin(pin) {
    return post("verifyPin", { pin: String(pin || "").trim() });
  }

  /** นับยอดเข้าชมเว็บไซต์ (+1 ลงแท็บ Stats) */
  function trackPageView() {
    return post("incrementStat", { type: "page_views" });
  }

  /** นับยอดดาวน์โหลด (+1 ลงแท็บ Stats และบวกยอดในแท็บ Knowledge_Hub หากระบุ itemId) */
  function trackDownload(itemId = "") {
    return post("incrementStat", {
      type: "total_downloads",
      itemId: itemId ? String(itemId).trim() : ""
    });
  }

  /** บันทึกผลประเมินความพึงพอใจลงแท็บ Feedback */
  function submitFeedback({ role, rating, comment }) {
    return post("submitFeedback", {
      role,
      rating: Number(rating),
      comment: comment || ""
    });
  }

  /**
   * เพิ่มข้อมูลใหม่ลงแท็บ Announcements, Teaching_Media หรือ Knowledge_Hub (ต้องใช้ ADMIN_PIN)
   * @param {Object} options
   * @param {string} options.pin - รหัส ADMIN_PIN
   * @param {string} options.target - ชื่อแท็บเป้าหมาย ('Announcements' | 'Teaching_Media' | 'Knowledge_Hub')
   * @param {Object} options.data - ข้อมูลแถวใหม่
   */
  function addRecord({ pin, target, data }) {
    return post("addRecord", {
      pin: String(pin || "").trim(),
      target,
      data
    });
  }

  // ==========================================================================
  // ฟังก์ชันแปลงลิงก์ Google Drive อัตโนมัติ (Preview & Download)
  // ==========================================================================

  /**
   * ดึง File ID จากลิงก์ Google Drive / Google Docs / Slides / Sheets
   * @param {string} url
   * @returns {{ fileId: string|null, docType: string|null }}
   */
  function parseGoogleDriveUrl(url) {
    if (!url || typeof url !== "string") {
      return { fileId: null, docType: null };
    }

    const trimmed = url.trim();

    // รูปแบบ Google Docs / Sheets / Slides:
    // https://docs.google.com/(document|spreadsheets|presentation)/d/{FILE_ID}/...
    const docsMatch = trimmed.match(
      /^https?:\/\/docs\.google\.com\/(document|spreadsheets|presentation)\/d\/([a-zA-Z0-9_-]+)/i
    );
    if (docsMatch) {
      return {
        docType: docsMatch[1].toLowerCase(),
        fileId: docsMatch[2]
      };
    }

    // รูปแบบ Google Drive file:
    // https://drive.google.com/file/d/{FILE_ID}/view?usp=sharing
    const fileMatch = trimmed.match(
      /^https?:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i
    );
    if (fileMatch) {
      return {
        docType: "file",
        fileId: fileMatch[1]
      };
    }

    // รูปแบบ Google Drive open / uc:
    // https://drive.google.com/open?id={FILE_ID}
    // https://drive.google.com/uc?id={FILE_ID}&export=download
    const idParamMatch = trimmed.match(
      /^https?:\/\/drive\.google\.com\/(?:open|uc)\?[^#]*\bid=([a-zA-Z0-9_-]+)/i
    );
    if (idParamMatch) {
      return {
        docType: "file",
        fileId: idParamMatch[1]
      };
    }

    return { fileId: null, docType: null };
  }

  /**
   * แปลงลิงก์แชร์ Google Drive ปกติ ให้เป็นลิงก์สำหรับ Preview (เปิดดู/ฝัง iframe)
   * หากไม่ใช่ลิงก์ Google Drive จะคืนค่าลิงก์เดิม
   * @param {string} url
   * @returns {string}
   */
  function toGoogleDrivePreviewUrl(url) {
    const { fileId, docType } = parseGoogleDriveUrl(url);
    if (!fileId) return url || "";

    if (docType === "document" || docType === "spreadsheets" || docType === "presentation") {
      return `https://docs.google.com/${docType}/d/${fileId}/preview`;
    }

    return `https://drive.google.com/file/d/${fileId}/preview`;
  }

  /**
   * แปลงลิงก์แชร์ Google Drive ปกติ ให้เป็นลิงก์สำหรับ Download โดยตรง
   * หากไม่ใช่ลิงก์ Google Drive จะคืนค่าลิงก์เดิม
   * @param {string} url
   * @returns {string}
   */
  function toGoogleDriveDownloadUrl(url) {
    const { fileId, docType } = parseGoogleDriveUrl(url);
    if (!fileId) return url || "";

    if (docType === "document") {
      return `https://docs.google.com/document/d/${fileId}/export?format=pdf`;
    }
    if (docType === "presentation") {
      return `https://docs.google.com/presentation/d/${fileId}/export/pdf`;
    }
    if (docType === "spreadsheets") {
      return `https://docs.google.com/spreadsheets/d/${fileId}/export?format=xlsx`;
    }

    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  }

  /**
   * แปลงลิงก์ Google Drive แบบครบชุด (คืนทั้ง Preview, Download และ Thumbnail)
   * @param {string} url
   * @returns {{ isGoogleDrive: boolean, fileId: string|null, originalUrl: string, previewUrl: string, downloadUrl: string, thumbnailUrl: string }}
   */
  function convertGoogleDriveLink(url) {
    const originalUrl = (url || "").trim();
    const { fileId } = parseGoogleDriveUrl(originalUrl);

    if (!fileId) {
      return {
        isGoogleDrive: false,
        fileId: null,
        originalUrl,
        previewUrl: originalUrl,
        downloadUrl: originalUrl,
        thumbnailUrl: ""
      };
    }

    return {
      isGoogleDrive: true,
      fileId,
      originalUrl,
      previewUrl: toGoogleDrivePreviewUrl(originalUrl),
      downloadUrl: toGoogleDriveDownloadUrl(originalUrl),
      thumbnailUrl: `https://drive.google.com/thumbnail?id=${fileId}&sz=w800`
    };
  }

  return {
    get,
    post,
    getAllData,
    getSheetData,
    checkStudentWork,
    getStudentRoster,
    verifyAdminPin,
    trackPageView,
    trackDownload,
    submitFeedback,
    addRecord,
    parseGoogleDriveUrl,
    toGoogleDrivePreviewUrl,
    toGoogleDriveDownloadUrl,
    convertGoogleDriveLink
  };
})();

// เปิดให้เข้าถึงได้แบบ Global
window.API = API;
