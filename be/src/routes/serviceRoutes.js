import express from "express";
import {
  createService,
  getServices,
  getServiceById,
  updateService,
  deleteService,
} from "../controllers/serviceController.js";
import { protect } from "../controllers/authController.js";

const router = express.Router();

router.route("/").post(protect, createService).get(protect, getServices);
router
  .route("/:id")
  .get(protect, getServiceById)
  .put(protect, updateService)
  .delete(protect, deleteService);

export default router;
