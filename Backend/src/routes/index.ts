import { Router } from "express";
import userRoute from "./userRoute";
import authRoute from "./authRoute";
import threadRoute from "./threadRoute";
import mobileRoute from "./mobileRoute";
import { authentication } from "../middlewares/authMiddleware";

const router = Router();

router.use("/users", authentication, userRoute);
router.use("/auth", authRoute);
router.use("/threads", authentication, threadRoute);
router.use("/mobile", authentication, mobileRoute);

export default router;
