import { Router } from "express";
import { getUser, updateProfile } from "../controllers/userController";
import { upload } from "../libs/multer";

const router = Router();

router.get("/user", getUser);
router.patch("/update", upload.single("photoProfile"), updateProfile);

export default router;
