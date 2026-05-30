# Generator Analisa Ide Perbaikan — Panduan Deploy (Gemini + Vercel)

Web app untuk meng-generate analisa ide perbaikan (Kaizen / CI) lengkap dengan **8 bagian + diagram Fishbone + penilaian Benefit**, ditenagai **Google Gemini**. Member cukup membuka sebuah alamat web dari device apa pun (HP/laptop) — **tanpa perlu akun Claude maupun akun Gemini**.

Cara kerja aman: API key Gemini hanya disimpan di server (backend kecil), tidak pernah ada di browser member.

```
analisa-ide-gemini/
├── index.html        → tampilan aplikasi (frontend)
├── api/generate.js   → backend: memanggil Gemini, menyimpan API key, cek password
├── package.json      → konfigurasi minimal
└── .env.example      → contoh environment variables
```

---

## Yang perlu disiapkan (semua punya versi gratis)
1. **Akun Google** → untuk mengambil API key Gemini.
2. **Akun Vercel** → untuk hosting (bisa login pakai akun Google/GitHub/email).

---

## LANGKAH 1 — Ambil API Key Gemini (gratis)
1. Buka **https://aistudio.google.com/apikey**
2. Login dengan akun Google, lalu klik **Create API key / Get API key**.
3. Salin key-nya (formatnya diawali `AIza...`). Simpan baik-baik, jangan dibagikan.

> Gemini punya tier gratis yang lumayan untuk pemakaian internal. Kalau pemakaian besar, Anda bisa mengaktifkan billing di Google.

---

## LANGKAH 2 — Deploy ke Vercel

### Cara A — Lewat website (paling mudah, tanpa terminal)
1. Buat akun di **https://vercel.com**.
2. Upload folder project ini ke **GitHub**:
   - Buka https://github.com → **New repository** → beri nama (mis. `analisa-ide`) → **Create**.
   - Di halaman repo, klik **uploading an existing file** → seret semua isi folder ini (termasuk folder `api/`) → **Commit**.
3. Di Vercel: **Add New… → Project** → pilih repo `analisa-ide` → **Import**.
4. **Sebelum klik Deploy**, buka bagian **Environment Variables**, tambahkan:
   | Name | Value |
   |------|-------|
   | `GEMINI_API_KEY` | (paste API key dari Langkah 1) |
   | `APP_PASSWORD` | (password yang akan dibagikan ke member — opsional tapi disarankan) |
   | `GEMINI_MODEL` | `gemini-2.5-flash` (opsional) |
5. Klik **Deploy**. Tunggu sekitar 1 menit.
6. Vercel memberi URL seperti `https://analisa-ide.vercel.app`. **Bagikan URL ini ke member.**

### Cara B — Lewat terminal (tanpa GitHub)
1. Install **Node.js**: https://nodejs.org (pilih versi LTS).
2. Buka terminal di dalam folder project ini, jalankan:
   ```bash
   npm i -g vercel
   vercel login
   vercel
   ```
   (jawab pertanyaan dengan default — tekan Enter).
3. Set environment variables:
   ```bash
   vercel env add GEMINI_API_KEY
   vercel env add APP_PASSWORD
   ```
   (paste nilainya, pilih semua environment: Production, Preview, Development).
4. Deploy ke produksi:
   ```bash
   vercel --prod
   ```
5. Pakai URL produksi yang muncul, bagikan ke member.

---

## LANGKAH 3 — Cara member memakainya
1. Buka URL di browser (HP/laptop apa pun).
2. Jika diproteksi, masukkan **password** (cukup sekali per device — otomatis tersimpan di browser).
3. Isi **Jabatan**, **Temuan Problem**, **Ide Perbaikan**, pilih **Level Assessment** → klik **Generate**.
4. Hasil 8 bagian muncul. Bisa **Salin Teks**, **Unduh (.txt)**, atau **Buat Ulang**.

---

## Mengubah pengaturan
- **Ganti / tambah password:** Vercel → project → **Settings → Environment Variables** → ubah `APP_PASSWORD` → lalu **Redeploy** (Deployments → ⋯ → Redeploy).
- **Ganti model:** ubah `GEMINI_MODEL` (mis. `gemini-2.5-flash-lite` agar lebih hemat) → Redeploy.
- **Akses tanpa password:** hapus variabel `APP_PASSWORD`, lalu Redeploy.

---

## Biaya
- **Gemini:** ada tier gratis; cek kuota Anda di Google AI Studio. Pemakaian besar → aktifkan billing Google.
- **Vercel:** paket Hobby (gratis) sudah cukup untuk pemakaian tim internal.

---

## Keamanan
- API key **tidak pernah** dikirim ke browser — hanya dipakai di `api/generate.js` (server).
- `APP_PASSWORD` mencegah orang luar memakai kredit Gemini Anda. Bagikan hanya ke member.
- Ini proteksi tingkat dasar (cocok untuk tool internal). Untuk login per-user/audit, bisa dikembangkan lebih lanjut.

---

## Kalau ada masalah (troubleshooting)
- **"GEMINI_API_KEY belum di-set"** → variabel belum ditambahkan / belum Redeploy setelah menambah.
- **"Gemini API: API key not valid"** → key salah ketik; ambil ulang dari AI Studio.
- **"Password salah atau belum diisi"** → cek `APP_PASSWORD` yang dibagikan.
- **"Output terpotong (MAX_TOKENS)"** → coba klik Generate lagi; jarang terjadi.
- **Model error / not found** → ganti `GEMINI_MODEL` ke `gemini-2.5-flash` atau model terbaru yang tersedia di akun Anda.
