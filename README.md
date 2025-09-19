npm# Membangun Bot WhatsApp dengan Node.js dan Python

Panduan ini akan membimbing Anda dalam proses pembuatan bot WhatsApp menggunakan Node.js dan Python.

## Daftar Isi

- [Prasyarat](#prasyarat)
- [Pengenalan Node.js](#pengenalan-nodejs)
- [Pengenalan Python](#pengenalan-python)
- [AI Handler](#ai-handler)
- [Masalah](#masalah)

## Prasyarat

Sebelum memulai, pastikan Anda telah mempersiapkan hal-hal berikut:

- Node.js
- Python
- Kunci API Gemini AI
- `.env` (sesuaikan)

## Pengenalan Node.js

Terdapat dua file utama dalam proyek ini yaitu `server-wpp.js` dan `server.py`:

### server-webhook.js

kode lama yang sejatinya ingin digunakan jika memakai cloud-api dari facebook

### server-wpp.js

File ini berisi kode JavaScript yang menggunakan pustaka WPPConnect untuk berkomunikasi dengan WhatsApp. WPPConnect memanfaatkan Puppeteer untuk merekayasa WhatsApp Web pada sistem.

Untuk memulai, jalankan perintah berikut:

```bash
npm install ## install dependensi
npx puppeteer browsers install chrome ## install chrome dan puppeteer
npm run start ## jalankan program
```

Anda akan melihat QR code atau kode pairing pada terminal (cek dokumentasi wppconnect untuk menyesuaikan). Pindai QR code tersebut atau masukkan kode pairing kenvm aplikasi WhatsApp untuk melakukan sinkronisasi.

Pastikan untuk mengubah nomor HP bot pada file `.env`.

Whatsapp Bot Siap Menerima Pesan!

### server.py

File ini adalah aplikasi Flask yang menangani POST request untuk meminta prompt yang akan dimasukkan ke dalam handler Node.js dengan Gemini AI. Flask memanfaatkan ChromaDB untuk menyimpan data. Data yang digunakan adalah teks yang diparse dari file PDF (hasil parse tersedia di [parsed_data_v1.json](./parsed_data_v1.json)).

Untuk memulai, jalankan perintah berikut:

- Install dependensi Python: `pip install -r requirements.txt`
- Jalankan server Flask: `python server.py`

```bash
pip install -r requirements.txt ## install dependensi
python server.py ## menjalankan server
```

## AI Handler

sesuaikan url post pada [aiHandlers.js](./aiHandlers.js)
sesuaikan GEMINI_API_KEY pada `.env`

```javascript
const response = await axios.post(
  "your-py-url/get_prompt",
  {
    query: userMessage,
  },
  {
    headers: {
      "Content-Type": "application/json",
    },
  }
);
```

## ChromaDb

ChromaDB dirancang untuk menyimpan dokumen dan mencari konten yang relevan berdasarkan kueri yang diberikan. Dalam implementasi ini, kita menggunakan ChromaDB untuk menyimpan dokumen dalam bentuk vektor dan mengambil bagian dokumen yang relevan berdasarkan kueri pengguna.

### Implementasi

Pada [aiUtil.py](./aiUtil.py), kami membuat vectordb dari tiap dokumen dan meng-embednya ke gemini, kemudian ketika terdapat permintaan maka akan mengquery dokumen yang paling relevan, setelah itu dilakukan pencarian kalimat serta kalimat sekitarnya yang paling cocok dengan query dengan TfIdf (hanya untuk meringkas sehingga tidak terkena limit prompt)

Implementasi dengan memotong pdf kebeberapa bagian sehingga tidak memerlukan TfIdf dalam mengambil kalimat relevan sangat disarankan

## Masalah

Jika Anda mengalami masalah, Anda dapat membaca dokumentasi berikut untuk bantuan terkait ChromaDB:

- [Masalah terkait ChromaDB](https://github.com/chroma-core/chroma/issues/189#issuecomment-1454418844)
- [Tidak bisa deploy](./puppeteer.config.cjs) nonaktifkan kode ini
