import express from "express";
import http from "http";
import mainRoute from "./routes";
import cors from "cors";
import { initSocket } from "./libs/socket";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import path from "path";

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("public/uploads")); // Dengan baris ini, gambar yang ter-upload bisa diakses oleh frontend melalui URL: http://localhost:3000/uploads/nama-file-gambar.png.

const swaggerDocument = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../swagger.json"), "utf8"),
);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/api/v1", mainRoute);

const server = http.createServer(app);

initSocket(server);

// Jalankan server menggunakan HTTP server (bukan app.listen)
server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
  console.log(`Dokumentasi API aktif di http://localhost:${port}/api-docs`);
});
