import { Router } from "express";
import { createThread, getThreads, toggleLike } from "../controllers/threadController";

const router = Router();

router.post("/create", createThread);
router.get("/", getThreads);
router.post("/:threadId/like", toggleLike);

export default router;
