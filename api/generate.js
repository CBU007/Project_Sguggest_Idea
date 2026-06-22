// api/generate.js
// Vercel Serverless Function (Node.js).
// Memanggil Google Gemini API dengan aman — API key HANYA ada di server (environment variable),
// tidak pernah dikirim ke browser.
//
// Environment variables yang dipakai:
//   GEMINI_API_KEY  (wajib)  -> API key dari Google AI Studio
//   APP_PASSWORD    (opsional, disarankan) -> password akses untuk member
//   GEMINI_MODEL    (opsional) -> default "gemini-2.5-flash"

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

const LEVEL_GUIDANCE = {
  "Section":
    "Pembaca laporan adalah level Section/Leader. Gunakan bahasa operasional dan teknis lapangan: fokus pada detail proses, alat, dan aktivitas harian. Langsung, praktis, dan membumi.",
  "Department Head":
    "Pembaca laporan adalah Department Head. Gunakan bahasa taktis: kaitkan dengan target dan indikator departemen (output, downtime, defect rate, man-hour), serta dampak pada lini/area kerja.",
  "Division Head":
    "Pembaca laporan adalah Division Head. Gunakan bahasa manajerial-strategis: kaitkan dengan KPI divisi, efisiensi biaya, produktivitas, dan dampak lintas seksi/area.",
  "Direktur":
    "Pembaca laporan adalah Direktur. Gunakan bahasa eksekutif dan strategis: tekankan dampak bisnis, ROI, daya saing, keselamatan, dan citra perusahaan. Ringkas namun berbobot dan visioner.",
};

const BENEFIT_OPTIONS = [
  { label: "Safety", options: [
    "Lebih aman dari sebelumnya",
    "Dalam kondisi apapun bisa dicegah (kecelakaan berakibat masuk RS / kematian)",
    "Tanpa disadari keselamatan dapat terjaga",
    "Mencegah kecelakaan meskipun berhati-hati (kecuali berakibat masuk rumah sakit)",
    "Mencegah kecelakaan karena kecerobohan (tidak masuk rumah sakit)",
    "Menjadi lebih aman dari biasanya" ] },
  { label: "Ergonomi Kerja", options: [
    "Meningkatkan kenyamanan bekerja",
    "Meniadakan penggunaan alat pelindung diri",
    "Menghilangkan kebiasaan yang abnormal",
    "Mengurangi penggunaan alat/mesin",
    "Kaizen pekerjaan yang tidak menyenangkan",
    "Lingkungan kerja menjadi lebih baik",
    "Mengurangi batas waktu kerja",
    "Menghilangkan pekerjaan yang melelahkan",
    "Menghilangkan pekerjaan ekstra/tambahan",
    "Kaizen pekerjaan yang membosankan" ] },
  { label: "Quality", options: [
    "Menjaga kualitas produk/barang/jasa (mencegah cacat)",
    "Peningkatan pemeliharaan kualitas jasa/produk/barang (menurunkan cacat)",
    "Menjamin proses tidak menimbulkan cacat (proses tidak diperlukan lagi)",
    "Meningkatkan nilai produk/barang/jasa dan citra perusahaan",
    "Meningkatkan kualitas dan menstabilkannya" ] },
  { label: "Environment", options: [
    "Ada pokayoke/sistem yang mencegah kemungkinan terjadinya pencemaran lingkungan hidup",
    "Memperbaiki standar tentang lingkungan tempat kerja",
    "Standar baru untuk lingkungan tempat kerja (dari tidak ada menjadi ada)",
    "Memperbaiki standar yang mempengaruhi aspek lingkungan hidup",
    "Standar baru yang memberi pengaruh pada aspek lingkungan hidup" ] },
  { label: "Manfaat", options: [
    "Dapat dimanfaatkan bagian kaizen di plant/divisi sendiri",
    "Dapat dimanfaatkan juga oleh bagian kaizen di plant/divisi lain",
    "Dapat dimanfaatkan oleh bagian kaizen di plant/divisi lain",
    "Dapat dimanfaatkan juga pada industri yang berbeda (supplier, dealer, dll)",
    "Dapat dimanfaatkan oleh semua karyawan plant/divisi sendiri" ] },
  { label: "Usaha", options: [
    "Ada perhitungan-perhitungan teknis dan pemenuhan syarat terhadap aturan resmi",
    "Perlu kesungguhan untuk merealisasikan",
    "Perlu kesungguhan dan memerlukan waktu yang panjang untuk merealisasikan",
    "Realisasinya menghadapi masalah kompleks dan perlu persetujuan pihak lain",
    "Dapat direalisasikan dengan mudah" ] },
  { label: "Kepekaan", options: [
    "Memperbaiki hal-hal yang terabaikan",
    "Ide baru di mana orang lain tidak menyadarinya",
    "Memperbaiki atas saran/keluhan orang lain",
    "Memperbaiki hal-hal yang telah berjalan tetapi tidak tepat tujuan/sasaran",
    "Inisiatif sendiri pada masalah yang parah" ] },
  { label: "Keaslian", options: [
    "Merupakan gabungan dari ide-ide yang lain",
    "Kombinasi dari ide-ide yang lain, tapi ada penyempurnaan dari idenya sendiri",
    "Ide baik yang dapat didaftarkan hak patennya",
    "Merupakan ide yang kreatif dan inovatif",
    "Gagasannya ada tetapi kecil" ] },
];

function buildPrompt({ jabatan, temuanProblem, idePerbaikan, level }) {
  const benefitOptionsText = BENEFIT_OPTIONS
    .map((c) => "[" + c.label + "]\n" + c.options.map((o) => "- " + o).join("\n"))
    .join("\n\n");

  return `Anda adalah seorang engineer senior sekaligus fasilitator Kaizen / Continuous Improvement (CI) di industri manufaktur Indonesia, yang sudah puluhan kali menulis laporan ide perbaikan resmi.

DATA INPUT DARI PENGUSUL:
- Jabatan pengusul : ${jabatan}
- Temuan Problem  : ${temuanProblem}
- Ide Perbaikan   : ${idePerbaikan}
- Level pembaca/penilai laporan : ${level}

GAYA BAHASA SESUAI LEVEL PEMBACA:
${LEVEL_GUIDANCE[level]}

TUGAS:
Susun analisa ide perbaikan (Kaizen) yang lengkap, profesional, dan TERDENGAR NATURAL seperti ditulis oleh praktisi lapangan sungguhan — bukan AI. Hindari kalimat kaku/robotik, hindari frasa klise AI. Tulis dalam Bahasa Indonesia yang mengalir. Gunakan istilah teknis manufaktur yang wajar. Karena evaluasi membutuhkan data teknis, sertakan angka before/after yang REALISTIS dan KONSERVATIF (mis. estimasi penghematan waktu, penurunan defect, man-hour, dsb) sesuai konteks problem.

Untuk bagian "benefit": PILIH TEPAT SATU opsi dari setiap kategori (salin teksnya PERSIS seperti daftar di bawah) yang paling sesuai dengan improvement ini, lalu jelaskan alasannya secara spesifik dan terkait langsung dengan ide ini.

DAFTAR OPSI BENEFIT (pilih satu per kategori, salin persis):
${benefitOptionsText}

Kembalikan HANYA SATU objek JSON valid. Tanpa teks pembuka, tanpa penjelasan, tanpa markdown. Struktur PERSIS:

{
  "judul": "judul project yang menarik & menggambarkan ide perbaikan, maksimal ~12 kata",
  "latarBelakang": "2-3 paragraf, mudah dipahami pimpinan kerja. Pisahkan paragraf dengan baris kosong.",
  "analisaMasalah": {
    "uraian": "hasil analisa langsung di lapangan, 2-3 paragraf, pisahkan dengan baris kosong",
    "coreProblem": "1-2 kalimat akar masalah inti (core problem)",
    "sebabAkibat": "1 paragraf penjelasan hubungan sebab-akibat yang mengerucut ke core problem",
    "fishbone": {
      "effect": "akibat/problem utama secara ringkas (maks ~8 kata)",
      "Manusia": ["penyebab singkat", "..."],
      "Mesin": ["penyebab singkat", "..."],
      "Metode": ["penyebab singkat", "..."],
      "Material": ["penyebab singkat", "..."],
      "Lingkungan": ["penyebab singkat", "..."]
    }
  },
  "usulanPerbaikan": "kalimat usulan perbaikan yang sudah ditingkatkan/diperjelas, 1-2 paragraf",
  "metodeBaruSetelahPerbaikan": "uraian proses/metode baru setelah ide diimplementasikan, 1-2 paragraf",
  "evaluasiHasil": "evaluasi hasil perbaikan secara teknis & detail; sertakan perbandingan before vs after dan angka konkret, 2-3 paragraf",
  "ringkasanProject": "ringkasan aktivitas yang telah dilakukan untuk merealisasikan ide, padat",
  "benefit": {
    "safety": { "pilihan": "salin persis salah satu opsi Safety", "alasan": "alasan spesifik 1-2 kalimat" },
    "ergonomi": { "pilihan": "salin persis salah satu opsi Ergonomi Kerja", "alasan": "..." },
    "quality": { "pilihan": "salin persis salah satu opsi Quality", "alasan": "..." },
    "environment": { "pilihan": "salin persis salah satu opsi Environment", "alasan": "..." },
    "manfaat": { "pilihan": "salin persis salah satu opsi Manfaat", "alasan": "..." },
    "usaha": { "pilihan": "salin persis salah satu opsi Usaha", "alasan": "..." },
    "kepekaan": { "pilihan": "salin persis salah satu opsi Kepekaan", "alasan": "..." },
    "keaslian": { "pilihan": "salin persis salah satu opsi Keaslian", "alasan": "..." }
  }
}

Untuk tiap kategori fishbone berikan 2-4 penyebab berupa frasa pendek. Jika kategori kurang relevan, isi 1 penyebab yang paling mungkin. Ingat: balas hanya JSON valid.`;
}

function extractJSON(text) {
  if (!text) throw new Error("empty");
  let t = String(text).trim();
  t = t.replace(/^```(?:json)?/i, "").replace(/```\s*$/i, "").trim();
  const s = t.indexOf("{");
  const e = t.lastIndexOf("}");
  if (s === -1 || e === -1 || e < s) throw new Error("no json");
  return JSON.parse(t.slice(s, e + 1));
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed." });
    return;
  }

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  body = body || {};

  const jabatan = body.jabatan;
  const temuanProblem = body.temuanProblem;
  const idePerbaikan = body.idePerbaikan;
  let level = body.level;
  const password = body.password;

  // Gate password (opsional). Aktif hanya jika APP_PASSWORD di-set di server.
  const required = process.env.APP_PASSWORD;
  if (required && password !== required) {
    res.status(401).json({ error: "Password salah atau belum diisi." });
    return;
  }

  if (!jabatan || !temuanProblem || !idePerbaikan) {
    res.status(400).json({ error: "Lengkapi Jabatan, Temuan Problem, dan Ide Perbaikan." });
    return;
  }
  if (!LEVEL_GUIDANCE[level]) level = "Section";

  if (!process.env.GEMINI_API_KEY) {
    res.status(500).json({ error: "GEMINI_API_KEY belum di-set di server (Environment Variables)." });
    return;
  }

  try {
    const url = "https://generativelanguage.googleapis.com/v1beta/models/" + GEMINI_MODEL + ":generateContent";
    const gres = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": process.env.GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: buildPrompt({ jabatan, temuanProblem, idePerbaikan, level }) }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.65,
          maxOutputTokens: 16384,
        },
      }),
    });

    const data = await gres.json().catch(() => ({}));

    if (!gres.ok) {
      const msg = (data && data.error && data.error.message) || ("HTTP " + gres.status);
      res.status(502).json({ error: "Gemini API: " + msg });
      return;
    }

    const cand = data && data.candidates && data.candidates[0];
    if (!cand) {
      const block = data && data.promptFeedback && data.promptFeedback.blockReason;
      res.status(502).json({ error: block ? ("Permintaan diblokir Gemini (" + block + "). Ubah deskripsi lalu coba lagi.") : "Tidak ada hasil dari Gemini. Coba lagi." });
      return;
    }

    const parts = (cand.content && cand.content.parts) || [];
    const text = parts.map((p) => p.text || "").join("");

    let result;
    try {
      result = extractJSON(text);
    } catch (err) {
      const truncated = cand.finishReason === "MAX_TOKENS";
      res.status(502).json({
        error: truncated
          ? "Output terpotong (MAX_TOKENS). Coba lagi, atau naikkan maxOutputTokens di api/generate.js."
          : "Gagal membaca JSON dari Gemini. Silakan coba lagi.",
      });
      return;
    }

    res.status(200).json({ result });
  } catch (e) {
    res.status(500).json({ error: "Kesalahan server: " + ((e && e.message) || "tidak diketahui") });
  }
};
