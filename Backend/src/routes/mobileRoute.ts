import { Router } from "express";
import {
  getMetriksHome,
  getRecentActivityMobile,
  getTopThreadsMobile,
  getUserMobile,
} from "../controllers/mobileController";

const router = Router();

router.get("/user", getUserMobile);
router.get("/home", getMetriksHome);
router.get("/topThreads", getTopThreadsMobile);
router.get("/activity", getRecentActivityMobile);

export default router;
