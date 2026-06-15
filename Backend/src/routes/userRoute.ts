import { Router } from "express";
import {
  getFollows,
  getSuggestedUsers,
  getUser,
  updateProfile,
  followUser,
  unfollowUser,
  searchUser,
  getThreadsByUserId,
} from "../controllers/userController";
import { getUserById } from "../controllers/authController";
import { upload } from "../libs/multer";

const router = Router();

router.get("/user", getUser);
router.patch("/update", upload.single("photoProfile"), updateProfile);
router.get("/suggested", getSuggestedUsers);
router.get("/follows", getFollows);
router.get("/search", searchUser);
router.get("/:id", getUserById);
router.post("/follow/:id", followUser);
router.delete("/unfollow/:id", unfollowUser);
router.get("/user/:userId", getThreadsByUserId);

export default router;
