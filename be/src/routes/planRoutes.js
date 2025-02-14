import express from "express";
import { protect } from "./../controllers/authController.js";
import {
  createPlan,
  getPlans,
  getPlanById,
  updatePlan,
  deletePlan,
} from "../controllers/planController.js";

const router = express.Router();

router.route("/").post(protect, createPlan).get(protect, getPlans);
router.route("/:id").get(protect, getPlanById).put(protect, updatePlan).delete(protect, deletePlan);

export default router;
