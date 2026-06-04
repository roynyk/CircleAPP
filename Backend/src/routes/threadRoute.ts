import { Router } from "express";
import { createThread, getThreads } from "../controllers/threadController";

const router = Router();

router.post("/create", createThread);
router.get("/", getThreads);

export default router;
