import { Router } from "express";
import userRoute from "./userRoute";
import authRoute from "./authRoute";
import threadRoute from "./threadRoute";
import { authentication } from "../middlewares/authMiddleware";

const router = Router();

router.use("/users", userRoute);
router.use("/auth", authRoute);
router.use("/threads", authentication, threadRoute);

export default router;
