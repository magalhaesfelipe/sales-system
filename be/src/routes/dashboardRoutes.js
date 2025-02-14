import express from "express";
import {
  getClientDashboard,
  getSalesDashboard,
} from "../controllers/dashboardController.js";
import { protect } from "../controllers/authController.js";

const router = express.Router();

router.route("/clientes").get(protect, getClientDashboard);
router.route("/vendas").get(protect, getSalesDashboard);

export default router;
