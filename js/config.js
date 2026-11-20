/**
 * ============================================================================
 * js/config.js
 * ไฟล์ตั้งค่าหลักของเว็บไซต์ห้องเรียนออนไลน์วิชาเทคโนโลยี
 * ============================================================================
 */

const APP_CONFIG = {
  // วางลิงก์ Web App URL ที่ได้จากการ Deploy Google Apps Script ที่นี่
  API_URL: "https://script.google.com/macros/s/AKfycbwjxVIlzVwIGfQRq_XVinMkCTpBDFaXHF8EtXR5mn-Q-xklLlKtB4Bel6lFB4hNmyouBA/exec",

  // ข้อมูลเว็บไซต์
  SITE_NAME: "ห้องเรียนออนไลน์ วิชาเทคโนโลยี",
  SITE_SUBTITLE: "คลังความรู้ สื่อการสอน และระบบติดตามงานนักเรียน",
  SCHOOL_NAME: "กลุ่มสาระการเรียนรู้วิทยาศาสตร์และเทคโนโลยี",
  ACADEMIC_YEAR: "2569",

  // ข้อมูลครูผู้สอน
  TEACHER_NAME: "ครูผู้สอนวิชาเทคโนโลยี",
  TEACHER_TITLE: "ครูผู้สอนรายวิชาวิทยาการคำนวณ, วิชา EEC และกิจกรรมชุมนุม",
  TEACHER_EMAIL: "teacher@school.ac.th",

  // ข้อมูลโปรไฟล์ครูสำหรับหน้าสำหรับคณะกรรมการประเมิน (portfolio.html)
  TEACHER_PROFILE: {
    fullName: "ครูผู้สอนวิชาเทคโนโลยี",
    position: "ครู วิทยฐานะครูชำนาญการ",
    department: "กลุ่มสาระการเรียนรู้วิทยาศาสตร์และเทคโนโลยี",
    school: "โรงเรียนตัวอย่างเทคโนโลยีวิทยา",
    education: "ครุศาสตรบัณฑิต / วิทยาศาสตรบัณฑิต สาขาวิทยาการคอมพิวเตอร์และเทคโนโลยีการศึกษา",
    expertise: [
      "วิทยาการคำนวณและการเขียนโปรแกรม (Coding & AI)",
      "หลักสูตรบูรณาการเขตพัฒนาพิเศษภาคตะวันออก (EEC)",
      "โครงงานหุ่นยนต์และสมองกลฝังตัว (IoT & Robotics)"
    ],
    philosophy: "มุ่งเน้นการจัดการเรียนรู้เชิงรุก (Active Learning) ให้ผู้เรียนคิดเป็น ทำเป็น และประยุกต์ใช้เทคโนโลยีอย่างสร้างสรรค์และรู้เท่าทัน"
  },

  // ตารางสอนเบื้องต้น (สามารถแก้ไขให้ตรงกับตารางสอนจริงได้ทันที)
  TEACHING_SCHEDULE: [
    { day: "จันทร์", periods: "คาบ 2-3", subject: "วิทยาการคำนวณ", grade: "ม.1/1 - ม.1/2", room: "ห้องปฏิบัติการคอมฯ 1" },
    { day: "อังคาร", periods: "คาบ 1-2", subject: "EEC", grade: "ม.2/1 - ม.2/2", room: "ห้องปฏิบัติการคอมฯ 2" },
    { day: "พุธ", periods: "คาบ 3-4", subject: "วิทยาการคำนวณ", grade: "ม.3/1 - ม.3/2", room: "ห้องปฏิบัติการคอมฯ 1" },
    { day: "พฤหัสบดี", periods: "คาบ 5-6", subject: "EEC", grade: "ม.2/3", room: "ห้องปฏิบัติการคอมฯ 2" },
    { day: "ศุกร์", periods: "คาบ 6-7", subject: "ชุมนุม", grade: "ทุกระดับชั้น", room: "ห้องปฏิบัติการหุ่นยนต์และ IoT" }
  ],

  // สีประจำรายวิชา (ใช้ร่วมกับ Tailwind CSS CDN)
  SUBJECTS: {
    "วิทยาการคำนวณ": {
      key: "computing",
      label: "วิทยาการคำนวณ",
      shortLabel: "วิทยาการคำนวณ",
      colorName: "blue",
      hex: "#2563eb",
      bgClass: "bg-blue-600",
      bgSoftClass: "bg-blue-50",
      textClass: "text-blue-700",
      borderClass: "border-blue-200",
      badgeClass: "bg-blue-100 text-blue-800 border border-blue-200",
      hoverClass: "hover:bg-blue-700",
      ringClass: "focus:ring-blue-500",
      gradientClass: "from-blue-600 to-indigo-600"
    },
    "EEC": {
      key: "eec",
      label: "วิชา EEC",
      shortLabel: "EEC",
      colorName: "green",
      hex: "#16a34a",
      bgClass: "bg-green-600",
      bgSoftClass: "bg-green-50",
      textClass: "text-green-700",
      borderClass: "border-green-200",
      badgeClass: "bg-green-100 text-green-800 border border-green-200",
      hoverClass: "hover:bg-green-700",
      ringClass: "focus:ring-green-500",
      gradientClass: "from-green-600 to-emerald-600"
    },
    "ชุมนุม": {
      key: "club",
      label: "กิจกรรมชุมนุม",
      shortLabel: "ชุมนุม",
      colorName: "purple",
      hex: "#9333ea",
      bgClass: "bg-purple-600",
      bgSoftClass: "bg-purple-50",
      textClass: "text-purple-700",
      borderClass: "border-purple-200",
      badgeClass: "bg-purple-100 text-purple-800 border border-purple-200",
      hoverClass: "hover:bg-purple-700",
      ringClass: "focus:ring-purple-500",
      gradientClass: "from-purple-600 to-violet-600"
    }
  },

  // สีเริ่มต้นกรณีรายวิชาไม่ตรงกับรายการหลัก
  DEFAULT_SUBJECT_STYLE: {
    key: "general",
    label: "ทั่วไป",
    shortLabel: "ทั่วไป",
    colorName: "slate",
    hex: "#475569",
    bgClass: "bg-slate-600",
    bgSoftClass: "bg-slate-50",
    textClass: "text-slate-700",
    borderClass: "border-slate-200",
    badgeClass: "bg-slate-100 text-slate-800 border border-slate-200",
    hoverClass: "hover:bg-slate-700",
    ringClass: "focus:ring-slate-500",
    gradientClass: "from-slate-600 to-slate-700"
  },

  /**
   * คืนค่าชุดสีประจำรายวิชาตามชื่อวิชาที่ส่งเข้ามา
   * @param {string} subjectName
   * @returns {Object}
   */
  getSubjectStyle(subjectName) {
    if (!subjectName) return this.DEFAULT_SUBJECT_STYLE;
    const normalized = String(subjectName).trim();

    if (this.SUBJECTS[normalized]) {
      return this.SUBJECTS[normalized];
    }

    const lower = normalized.toLowerCase();
    if (lower.includes("วิทยาการคำนวณ") || lower.includes("computing")) {
      return this.SUBJECTS["วิทยาการคำนวณ"];
    }
    if (lower.includes("eec")) {
      return this.SUBJECTS["EEC"];
    }
    if (lower.includes("ชุมนุม") || lower.includes("club")) {
      return this.SUBJECTS["ชุมนุม"];
    }

    return this.DEFAULT_SUBJECT_STYLE;
  }
};

// เปิดให้เข้าถึงได้แบบ Global ในไฟล์ JS อื่นๆ
window.APP_CONFIG = APP_CONFIG;
