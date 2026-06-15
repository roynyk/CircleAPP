import { Router } from "express";
import {
  createThread,
  getThreads,
  toggleLike,
  getThreadById,
  getReplies,
  createReply,
  updateThread,
} from "../controllers/threadController";
import { upload } from "../libs/multer";

const router = Router();

router.post("/create", upload.single("image"), createThread);
router.get("/", getThreads);
router.post("/:threadId/like", toggleLike);
router.get("/:id", getThreadById);
router.post("/:threadId/reply", upload.single("image"), createReply);
router.get("/:id/replies", getReplies);
router.patch("/:id", upload.single("image"), updateThread);

export default router;
