# Website Portfolio 3D Interaktif

Website portfolio profesional dengan tema dark mode menggunakan Three.js untuk menampilkan elemen 3D interaktif berupa ikan bioluminescent dan sungai mengalir.

## Demo

[Link Demo](https://yourusername.github.io/website3d)

![Screenshot Website](screenshot.jpg)

## Fitur Utama

- **Scene 3D Interaktif** dengan Three.js
- **Ikan Bioluminescent** yang bergerak secara alami dengan algoritma flocking
- **Sungai 3D** dengan aliran dinamis dan efek ripple
- **Efek Partikel** yang menghasilkan cahaya bioluminescent
- **Interaksi Mouse** untuk berinteraksi dengan objek 3D
- **Tema Dark Mode** dengan estetika minimalis
- **Responsif** untuk berbagai ukuran layar
- **Optimasi Performa** untuk kinerja rendering yang cepat

## Teknologi

- HTML5, CSS3, JavaScript
- Three.js untuk rendering 3D
- GSAP untuk animasi
- Font Awesome untuk ikon

## Cara Penggunaan

### Kebutuhan Sistem

- Web browser modern (Chrome, Firefox, Safari, Edge)
- Koneksi internet (untuk memuat library eksternal)

### Instalasi

1. Clone repository:
   ```bash
   git clone https://github.com/yourusername/website3d.git
   cd website3d
   ```

2. Buka `index.html` di browser atau gunakan server lokal:
   ```bash
   # Menggunakan Python
   python -m http.server 8000
   
   # Atau menggunakan Node.js & npm
   npx serve
   ```

3. Buka browser dan akses `http://localhost:8000` atau `http://localhost:3000`

### Deploy ke GitHub Pages

1. Buat repository GitHub baru dengan nama `website3d`
2. Push kode ke repository tersebut:
   ```bash
   git remote add origin https://github.com/yourusername/website3d.git
   git branch -M main
   git push -u origin main
   ```

3. Di repository GitHub, buka Settings > Pages
4. Di Source, pilih branch `main` dan klik Save
5. Website Anda akan tersedia di `https://yourusername.github.io/website3d`

## Struktur Proyek

```
website3d/
├── index.html           # File HTML utama
├── assets/              # Asset untuk website
│   ├── models/          # Model 3D
│   ├── textures/        # Tekstur
│   └── fonts/           # Font
├── css/                 # Stylesheet
│   └── style.css        # CSS utama
├── js/                  # JavaScript
│   ├── main.js          # Script utama
│   ├── scene.js         # Pengaturan scene Three.js
│   ├── fish.js          # Logika ikan
│   ├── river.js         # Logika sungai
│   ├── lights.js        # Sistem pencahayaan
│   ├── particles.js     # Sistem partikel
│   └── utils.js         # Fungsi utilitas
└── README.md            # Dokumentasi
```

## Interaksi

- **Mouse Movement**: Gerakkan mouse untuk interaksi dengan ikan dan air
- **Click**: Klik pada sungai untuk membuat ripple
- **Scroll**: Gulir untuk navigasi dan mengubah posisi kamera

## Optimasi

Website ini telah dioptimasi untuk:

- Waktu render cepat (<3 detik)
- Kompatibilitas lintas browser
- Performa pada perangkat dengan kemampuan rendering terbatas

## Kustomisasi

### Mengubah Ikan

Untuk mengubah jumlah ikan atau karakteristiknya, edit file `js/fish.js`:

```javascript
// Mengubah jumlah ikan
this.fishCount = 20; // Default: 15

// Mengubah warna ikan
const glowColors = [
    0x00ffff, // Cyan
    0x4dffa6, // Aqua green
    0x00a3ff, // Light blue
    0x4da6ff  // Blue
    // Tambahkan warna kustom di sini
];
```

### Mengubah Sungai

Untuk mengubah karakteristik sungai, edit file `js/river.js`:

```javascript
// Mengubah ukuran sungai
this.width = 40;  // Default: 30
this.length = 80; // Default: 60

// Mengubah kecepatan aliran
this.flowSpeed = 0.5; // Default: 0.3

// Mengubah tinggi dan frekuensi gelombang
this.waveHeight = 0.3;     // Default: 0.2
this.waveFrequency = 0.6;  // Default: 0.5
```

## Lisensi

[MIT License](LICENSE)

## Kredit

- Three.js - https://threejs.org/
- GSAP - https://greensock.com/gsap/
- Font Awesome - https://fontawesome.com/