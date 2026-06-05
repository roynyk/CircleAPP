import express from "express";
import http from "http";
import mainRoute from "./routes";
import cors from "cors";
import { initSocket } from "./libs/socket";

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json()); // ini berfungsi agar express/backend bisa menerima atau memproses data dalam bentuk json
app.use("/uploads", express.static("public/uploads")); // Dengan baris ini, gambar yang ter-upload bisa diakses oleh frontend melalui URL: http://localhost:3000/uploads/nama-file-gambar.png.
app.use("/api/v1", mainRoute);

// 1. Buat HTTP server yang membungkus Express
const server = http.createServer(app);
// 2. Inisialisasi WebSocket server
initSocket(server);
// 3. Jalankan server menggunakan HTTP server (bukan app.listen)
server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
