import { Router } from "express";
import {
  createThread,
  getThreads,
  toggleLike,
} from "../controllers/threadController";
import { upload } from "../libs/multer";

const router = Router();

router.post("/create", upload.single("image"), createThread);
router.get("/", getThreads);
router.post("/:threadId/like", toggleLike);

export default router;
