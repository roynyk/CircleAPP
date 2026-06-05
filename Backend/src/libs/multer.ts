import multer from "multer";
import path from "path";

// aslinya mah express tidak bisa menghandle data dalam bentuk file, makanya kita butuh multer, nah aslinya juga yang kesimpan di dalam database itu bukan file upload nya tapi nama nya aja yang udh kita rancang di bawah ini, kalau file aslinya tersimpan di dalam destination: (req, file, callback) => {callback(null, "public/uploads"); },

const storage = multer.diskStorage({
  // ini destinasinya bakal di mana file nya di upload
  destination: (req, file, callback) => {
    callback(null, "public/uploads");
  },
  //   ini untuk file name nya, yang uniqueSuffix itu di buat supaya kalau misalnya ada nama file upload yang sama tetap bisa di bedakan, lalu path.extname(file.originalname) untuk mengambil path asli file nya, kaya .jpg .png or something
  filename(req, file, callback) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e5);

    // file.fieldname ini untuk mengambil nama field kita karena di dalam route yang kita gunakan itu kan memanggil multer dengan upload.single("image"), nah nama fieldnya berarti image, maka file.fieldname itu image isinya, nah untuk yang path.extname(file.originalname) itu untuk mengambil path extension name filenya kaya misalnya .png atau .jpg
    callback(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname),
    );
  },
});

const fileFilter = (req: any, file: any, callback: any) => {
  if (file.mimetype.startsWith("image/")) {
    callback(null, true);
  } else {
    callback(new Error("Hanya file gambar yang diperbolehkan"), false);
  }
};

export const upload = multer({ storage, fileFilter });
