import { Router } from "express";
import {
  createThread,
  getThreads,
  toggleLike,
  getThreadById,
} from "../controllers/threadController";
import { upload } from "../libs/multer";

const router = Router();

router.post("/create", upload.single("image"), createThread);
router.get("/", getThreads);
router.post("/:threadId/like", toggleLike);
router.get("/:id", getThreadById);

export default router;
