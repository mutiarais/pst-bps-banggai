import express from "express";
import "dotenv/config";
export const app = express();
import { config } from "dotenv";
config(); // Ini memuat variabel lingkungan dari file .env

/** Note
 * this constant is defined using backticks (`) for each string,
 * which allows for multiline text formatting. This method ensures that the line breaks and spacing in the strings are preserved
 * exactly as intended when the menu is displayed to users.
 *  */
const WELCOME_MESSAGE = `📊 Halo Sahabat Data!
Selamat datang di *AstaBot*, Asisten Statistik Terpadu BPS Kabupaten Banggai.
Saya siap membantu Anda mengakses informasi statistik dari BPS Kabupaten Banggai.

✨ *MENU UTAMA LAYANAN* ✨
Silakan memilih layanan yang Anda butuhkan:

👉 Ketik angka (1-5) sesuai pilihan Anda!
`;
export const FOOTER = `
*Website*    : banggaikab.bps.go.id
*Instagram* : bps_banggai
`;
//Ketik *2* untuk tanya CS

export const UNSUPPORTED_TYPE_MESSAGE = `Mohon maaf. Kami hanya mendukung percakapan berbasis teks. \n\n👉 *Ketik '0' untuk kembali ke Menu Utama.*`;
export const BACK_ONLINE = "Bot telah kembali!";
export const WRONG_COMMAND = `*Mohon maaf. Silahkan pilih opsi berikut untuk melanjutkan.*\n\n`;
export const BACK_TO_MENU = `\n\n👉 *Ketik '0' untuk kembali ke Menu Utama.*`;
export const OPTION_ONE = `Kirim pertanyaan seputar statistik banggai: `;
export const OPTION_TWO = `Kirim pertanyaan seputar statistik secara umum: `;
// export const OPTION_AI = `Kirim pertanyaan untuk AI: `;
export const OPTION_FOUR = `Tunggu beberapa saat, kami sedang menghubungi pegawai yang bertugas.`;
export const NOT_IN_WORKING_HOURS = `Maaf, Admin hanya menjawab di Jam Kerja:
🗓 Senin–Kamis: 08.00 – 15.30 WITA
🗓 Jumat: 08.00 – 16.00 WITA`;
export const VALID_OPTIONS = Array.from({ length: 5 }, (_, i) => (i + 1).toString());

export const { WEBHOOK_VERIFY_TOKEN, GRAPH_API_TOKEN, PORT_NODE, PORT_PY, BOT_NUMBER, BOT_NAME, PEGAWAI_NUMBER } = process.env;

/** OBJEK UNTUK MELACAK STATUS SESI PENGGUNA
 * SESSION_STATUS[USER_PHONE_NUMBER]={CLIENT:CLIENT, LAST_ACTIVE: DATE, OPTION_SESSION: NULL, BUSINESS_PHONE_NUMBER_ID: REQUIRED, PEGAWAI_PHONE_NUMBER: NULL}
 */
export const SESSION_STATUS = {};

// DAFTAR NOMOR PEGAWAI
const PEGAWAI_NUMBER_JSON = process.env.PEGAWAI_NUMBER;
export const PEGAWAI_NUMBERS = JSON.parse(PEGAWAI_NUMBER_JSON);
export const BROADCAST_PEGAWAI = `Terdapat responden yang meminta asistensi!
    Klik *Mulai Sesi!* untuk memulai sesi`;

export const CONNECTED_WITH_PEGAWAI = `Anda telah terhubung dengan admin!~`;

export const SESSION_LIMIT = 300000; // 5 menit (milisekon) / 1 menit 60.000 milisekon

export const NO_AVAILABLE_PEGAWAI = `Maaf, saat ini tidak ada pegawai yang tersedia. Coba beberapa saat lagi.`;
export const SESSION_QNA_EXPIRED_MESSAGE = `Sesi QNA telah ditutup.`;
export const SESSION_EXPIRED_MESSAGE = `
*Terima kasih telah menggunakan layanan kami!* 🙏 

Bantu BPS Kabupaten Banggai meningkatkan kualitas layanan data dengan berpartisipasi dalam Survei Kebutuhan Data 2025 📊

🎯 Survei ini bertujuan untuk:
* Memahami kebutuhan data masyarakat
* Menilai kepuasan terhadap layanan data BPS

💡 Masukan Anda sangat berharga untuk mewujudkan data yang lebih relevan, akurat, dan bermanfaat bagi berbagai keperluan.

*Silakan isi e-form melalui tautan berikut*:
🔗 http://s.bps.go.id/SKD2025_7202

Mari bersama wujudkan data yang lebih baik untuk Indonesia! `;

export const MAX_MESSAGES_PER_MINUTE = 15; // Set the maximum number of messages allowed per minute
export const SPAM_THRESHOLD = 2; // Set the number of warnings before blocking

export const BOT_ERROR = `Maaf, bot sedang bermasalah. Kami sedang berupaya sebaik mungkin.`;
// export const DISCLAIMER_AI = `
// *Disclaimer*: Jawaban ini dihasilkan oleh AI Gemini sehingga terdapat kemungkinan untuk salah.
// SIlahkan Kirim Kritik dan Saran untuk pengembangan Asisten Digital yang lebih baik
// Kunjungi https://banggaikab.bps.go.id/ untuk mencari informasi yang lebih tepat`;

// const JENIS_STATISTIK = `
//     1. Publikasi
//     2. Tabel Statistik
//     `;
export const HOME_MESSAGE = `${WELCOME_MESSAGE}
    1. Perpustakaan (Tabel/Publikasi/BRS/dll)
    2. Konsultasi Statistik
    3. Penjualan Produk Statistik
    4. Rekomendasi Statistik
    5. Layanan Pengaduan
    `;

// cat 1 == Sosial dan Kependudukan, cat 2 Ekonomi dan Perdagangan, cat 3 Pertanian dan Pertambangan
export const statisticData = [
  { cat: 1, id: 519, value: "Kependudukan dan Migrasi" },
  { cat: 1, id: 520, value: "Tenaga Kerja" },
  { cat: 1, id: 521, value: "Pendidikan" },
  { cat: 1, id: 522, value: "Kesehatan" },
  { cat: 1, id: 523, value: "Konsumsi dan Pendapatan" },
  { cat: 1, id: 524, value: "Perlindungan Sosial" },
  { cat: 1, id: 525, value: "Pemukiman dan Perumahan" },
  { cat: 1, id: 526, value: "Hukum dan Kriminal" },
  { cat: 1, id: 527, value: "Budaya" },
  { cat: 1, id: 528, value: "Aktivitas Politik dan Komunitas Lainnya" },
  { cat: 1, id: 529, value: "Penggunaan Waktu" },
  { cat: 2, id: 530, value: "Statistik Makroekonomi" },
  { cat: 2, id: 531, value: "Neraca Ekonomi" },
  { cat: 2, id: 532, value: "Statistik Bisnis" },
  { cat: 2, id: 533, value: "Statistik Sektoral" },
  { cat: 2, id: 534, value: "Keuangan Pemerintah Fiskal dan Statistik Sektor Publik" },
  { cat: 2, id: 535, value: "Perdagangan International dan Neraca Pembayaran" },
  { cat: 2, id: 536, value: "Harga-Harga" },
  { cat: 2, id: 537, value: "Biaya Tenaga Kerja" },
  { cat: 2, id: 538, value: "Ilmu Pengetahuan Teknologi Inovasi" },
  { cat: 2, id: 557, value: "Pertanian Kehutanan Perikanan" },
  { cat: 2, id: 558, value: "Energi" },
  { cat: 2, id: 559, value: "Pertambangan Manufaktur Konstruksi" },
  { cat: 2, id: 560, value: "Transportasi" },
  { cat: 2, id: 561, value: "Pariwisata" },
  { cat: 2, id: 562, value: "Perbankan Asuransi Finansial" },
  { cat: 3, id: 539, value: "Lingkungan" },
  { cat: 3, id: 540, value: "Statistik Regional dan Statistik Area Kecil" },
  { cat: 3, id: 541, value: "Statistik dan Indikator Multi Domain" },
  { cat: 3, id: 542, value: "Buku Tahunan dan Ringkasan Sejenis" },
  { cat: 3, id: 563, value: "Kondisi Tempat Tinggal Kemiskinan dan Permasalahan Sosial Lintas Sektor" },
  { cat: 3, id: 564, value: "Gender dan Kelompok Populasi Khusus" },
  { cat: 3, id: 565, value: "Masyarakat Informasi" },
  { cat: 3, id: 566, value: "Globalisasi" },
  { cat: 3, id: 567, value: "Indikator Milenium Development Goals(MDGs)" },
  { cat: 3, id: 568, value: "Perkembangan Berkelanjutan" },
  { cat: 3, id: 569, value: "Kewiraswastaan" },
];

const BASE_URL = "https://banggaikab.bps.go.id/id/statistics-table";

function buildMenuFromData(statisticData) {
  const menu = {
    0: { message: HOME_MESSAGE + FOOTER, options: ["Perpustakaan", "Konsultasi Statistik", "Penjualan Produk Statistik", "Rekomendasi Statistik", "Layanan Pengaduan"] },
    1: {
      message: `📚 *PERPUSTAKAAN*
    Berikut layanan perpustakaan yang tersedia:
    *Ketik angka (1-9) sesuai pilihan Anda!*`,
      options: ["1. Publikasi", "2. Statistik Menurut Subjek", "3. Berita Resmi Statistik", "4. Data Sensus", "5. Data Ekspor Impor", "6. Infografis", "7. Berita dan Siaran Pers", "8. Data Sektoral", "9. Rencana Terbit"],
    },
    1.1: {
      message: `Silahkan Kunjungi Link Berikut untuk Melihat Publikasi dari BPS Kabupaten Banggai\nhttps://banggaikab.bps.go.id/id/publication`,
      options: [],
    },
    1.2: {
      message: `📚 *PERPUSTAKAAN*
    Silakan pilih Tabel Statistik yang Anda cari:`,
      options: ["1. Statistik Demografi dan Sosial", "2. Statistik Ekonomi", "3. Statistik Lingkungan Hidup dan Multi Domain"],
    },
    1.3: {
      message: `Silahkan Kunjungi Link Berikut untuk Melihat Berita Resmi Statistik dari BPS Kabupaten Banggai\nhttps://banggaikab.bps.go.id/id/pressrelease`,
      options: [],
    },
    1.4: {
      message: `Silahkan Kunjungi Link Berikut untuk Melihat Data Sensus\nhttps://sensus.bps.go.id/?_gl=1*1ltye2h*_ga*MTc3MTE1NDQ5MC4xNzI0MDM0NTEw*_ga_XXTTVXWHDB*MTcyNDMwMjE3NS41LjAuMTcyNDMwMjE3NS4wLjAuMA..`,
      options: [],
    },
    1.5: {
      message: `Silahkan Kunjungi Link Berikut untuk Melihat Data Ekspor-Impor\nhttps://banggaikab.bps.go.id/id/exim`,
      options: [],
    },
    1.6: {
      message: `Silahkan Kunjungi Link Berikut untuk Melihat Infografis dari BPS Kabupaten Banggai\nhttps://banggaikab.bps.go.id/id/infographic`,
      options: [],
    },
    1.7: {
      message: `Silahkan Kunjungi Link Berikut untuk Melihat Berita dan Siaran Pers dari BPS Kabupaten Banggai\nhttps://banggaikab.bps.go.id/id/news`,
      options: [],
    },
    1.8: {
      message: `Silahkan Kunjungi Link Berikut untuk Melihat Data Sektoral di Kabupaten Banggai\nhttps://data.banggaikab.go.id`,
      options: [],
    },
    1.9: {
      message: `Silahkan Kunjungi Link Berikut untuk Melihat Rencana Terbit dari BPS Kabupaten Banggai\nhttps://banggaikab.bps.go.id/id/arc`,
      options: [],
    },
    2: {
      message: `📊 *KONSULTASI STATISTIK*
Halo, Anda sudah terhubung dengan admin PST BPS Kabupaten Banggai. Silakan tuliskan pertanyaan atau kebutuhan Anda. 🙏
    
    ⏰ *Waktu layanan konsultasi dengan petugas*:
    Senin – Kamis : 08.00 – 15.30 WITA
    Jumat              : 08.00 – 16.00 WITA
    
Apabila pertanyaan diajukan di luar jam layanan, akan dibalas pada hari/jam kerja berikutnya.`,
      options: [],
    },
    3: {
      message: `🛒 *PENJUALAN PRODUK STATISTIK*

  Silakan kunjungi website Silastik untuk pembelian produk statistik BPS:
  🔗 https://silastik.bps.go.id
    
  Melalui layanan ini, Anda dapat memperoleh:
  1. Data mikro
  2. Publikasi
  3. Peta digital Wilkerstat
    `,
      options: [],
    },
    4: {
      message: `📑 *REKOMENDASI STATISTIK*
    Ingin mendapatkan rekomendasi kegiatan statistik dari BPS? 🤔
      
    ✨ Kunjungi tautan berikut:
    🔗 https://romantik.web.bps.go.id
      
    Melalui layanan ini, Anda dapat:
    ✅ Mengajukan rekomendasi kegiatan statistik
    ✅ Memperoleh rekomendasi sesuai kebutuhan Anda
      `,
      options: [],
    },
    5: {
      message: `📢 *LAYANAN PENGADUAN*
      Apabila Anda mempunyai keluhan terkait pelayanan kami atau mengetahui adanya sikap/perilaku petugas layanan yang diduga melanggar ketentuan disiplin dan/atau kode etik, silakan sampaikan pengaduan kepada kami.
      *Kerahasiaan pelapor dijamin dari kemungkinan terungkapnya identitas kepada publik.*
      
    📌 *SP4N-LAPOR! (Sistem Pengelolaan Pengaduan Pelayanan Publik Nasional)*
    🔗 https://www.lapor.go.id
      
    🏢 *Pengaduan Langsung*
    📍 Ruang Pengaduan BPS Kabupaten Banggai (Jl. S. Parman No. 27 Luwuk)
      `,
      options: [],
    },
  };

  // Build top level categories
  const categories = {
    1: "Statistik Demografi dan Sosial",
    2: "Statistik Ekonomi",
    3: "Statistik Lingkungan Hidup dan Multi Domain",
  };

  function formatStatisticValue(value) {
    return value
      .replace(/ /g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }
  // Map each category to its submenus
  Object.entries(categories).forEach(([cat, label]) => {
    const submenus = statisticData.filter((item) => item.cat == cat);

    // Menu per kategori
    menu[`1.2.${cat}`] = {
      message: `Pilih Subjek ${label}:`,
      options: submenus.map((item, index) => `${index + 1}. ${item.value}`),
    };

    // Submenu langsung kasih link (tanpa pilih Publikasi/Tabel Statistik)
    submenus.forEach((item, index) => {
      menu[`1.2.${cat}.${index + 1}`] = {
        message: `Silahkan kunjungi link berikut untuk Statistik ${formatStatisticValue(item.value)}:\n${BASE_URL}?subject=${item.id}`,
        options: [],
      };
    });
  });

  return menu;
}

function buildMenuStructure(config) {
  const structure = {};
  Object.entries(config).forEach(([key, { message, options }]) => {
    // Default isi pesan
    let menuMessage = key === "0" ? message : message + "\n" + options.join("\n");

    // Tambahkan "99. Kembali" hanya kalau bukan menu konsultasi (key !== "2")
    if (key !== "0" && key !== "2") {
      menuMessage += "\n99. Kembali";
    }

    // Build options
    const menuOptions = options.reduce((acc, opt, i) => {
      acc[`${key}.${i + 1}`] = opt;
      return acc;
    }, {});

    // Tambahkan opsi "99. Kembali" juga hanya kalau bukan menu konsultasi
    if (key !== "0" && key !== "2") {
      menuOptions[`${key}.99`] = "Kembali";
    }

    structure[key] = {
      message: menuMessage,
      options: menuOptions,
    };
  });
  return structure;
}

const MENU_CONFIG = buildMenuFromData(statisticData);
export const MENU_STRUCTURE = buildMenuStructure(MENU_CONFIG);
