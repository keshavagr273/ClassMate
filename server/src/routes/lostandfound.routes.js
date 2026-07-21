import express from "express";
import {
  createLostItem,
  updateLostItem,
  deleteLostItem,
  getLostItem,
  getAllLostItems,
} from "../controllers/lostandfound.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import filterInputMiddleware from "../middlewares/filter.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = express.Router();



router.post("/lost-items", upload.single("image"), authMiddleware, filterInputMiddleware, createLostItem);
router.put(
  "/lost-items/:id",
  upload.single("image"),
  authMiddleware,
  filterInputMiddleware,
  updateLostItem
);
router.delete("/lost-items/:id", authMiddleware, deleteLostItem);
router.get("/lost-items/:id", authMiddleware, getLostItem);
router.get("/lost-items", authMiddleware, getAllLostItems);



export default router;
