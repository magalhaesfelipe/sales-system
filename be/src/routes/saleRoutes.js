import express from "express";
import {
  createSale,
  getSales,
  getSaleById,
  updateSale,
  deleteSale,
} from "../controllers/saleController.js";
import { protect } from "../controllers/authController.js";

const router = express.Router();

router.route("/").post(protect, createSale).get(protect, getSales);

router.route("/:id").get(protect, getSaleById).put(protect, updateSale).delete(protect, deleteSale);

export default router;
