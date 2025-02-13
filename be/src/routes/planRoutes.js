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

router.route("/").post(createPlan).get(protect, getPlans);
router.route("/:id").get(getPlanById).put(updatePlan).delete(deletePlan);

export default router;
