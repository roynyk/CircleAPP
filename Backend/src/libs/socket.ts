//#region mengimpor WebSocketServer
// mengimpor WebSocketServer (kelas untuk membuat server socket) dan tipe data WebSocket (mewakili koneksi satu browser/klien) dari modul ws yang sudah kita instal.
//#endregion
import { WebSocketServer, WebSocket } from "ws";
//#region
// Mengimpor modul HTTP bawaan Node.js. Ini diperlukan agar WebSocket bisa menumpang di server HTTP yang sama dengan Express.
//#endregion
import http from "http";

//#region
// Kita membuat variabel global wss di luar fungsi. Tujuannya agar server WebSocket yang sudah dibuat nanti bisa diakses oleh fungsi mana pun di dalam file ini (khususnya fungsi broadcast).
//#endregion
let wss: WebSocketServer;

//#region
// export const initSocket = (server: http.Server)
// Fungsi ini dipanggil sekali di index.ts saat server pertama kali dinyalakan. Fungsi ini menerima server HTTP Express sebagai rumahnya.
// wss = new WebSocketServer({ server });
// Baris ini membuat server WebSocket baru. Dengan memasukkan { server }, WebSocket akan berjalan di port yang sama dengan Express (port 3000).
// wss.on("connection", (ws: WebSocket) => { ... })
// Ini adalah pendengar (event listener). Setiap kali ada tab browser user baru(dalam kasusnya aku membuat nya di dalam threadController.ts untuk yang create thread) yang membuka website dan menjalankan new WebSocket(), blok kode ini akan langsung terpicu. Parameter ws mewakili saluran telepon/koneksi khusus ke user tersebut.
// ws.on("close", () => { ... })
// Di dalam koneksi user tersebut, kita pasang pendengar lagi. Jika user tersebut menutup tab browser, me-refresh halaman, atau log out, baris ini mendeteksinya dan mencetak pesan di terminal backend bahwa user tersebut telah terputus.
//#endregion
export const initSocket = (server: http.Server) => {
  wss = new WebSocketServer({ server });

  wss.on("connection", (ws: WebSocket) => {
    console.log("⚡ Client terhubung ke WebSocket");

    ws.on("close", () => {
      console.log("🔌 Client terputus dari WebSocket");
    });
  });
};

//#region
// Fungsi untuk mengirim pesan ke seluruh client yang aktif
// export const broadcast = (event: string, data: any)
// Ini adalah fungsi mandiri yang bisa kita impor di file lain (seperti di threadController.ts). Fungsi ini menerima nama kejadian (event, misal: "NEW_THREAD") dan data objek yang ingin dikirim (data).
// if (!wss) return;
// Validasi keamanan. Jika server WebSocket belum dinyalakan, batalkan proses agar tidak error.
// const payload = JSON.stringify({ event, data });
// WebSocket hanya bisa mengirimkan teks mentah atau biner. Oleh karena itu, data objek kita ubah menjadi teks string berformat JSON menggunakan JSON.stringify.
// wss.clients.forEach((client) => { ... })
// wss.clients adalah daftar (Set) berisi seluruh browser user yang saat ini sedang aktif terhubung ke website kita. Kita melakukan perulangan (looping) untuk mengirimkan data ke mereka satu per satu.
// if (client.readyState === WebSocket.OPEN)
// Kita pastikan status koneksi browser tersebut sedang benar-benar aktif/terbuka (bukan sedang loading menyambungkan atau sedang proses memutus koneksi).
// client.send(payload)
// Kirimkan teks JSON tadi ke browser tersebut.
//#endregion
export const broadcast = (event: string, data: any) => {
  if (!wss) return;

  const payload = JSON.stringify({ event, data });

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
};
