import { Router } from "express";
import { getUser } from "../controllers/userController";
import { authentication } from "../middlewares/authMiddleware";

const router = Router();

router.get("/user", authentication, getUser);

export default router;
