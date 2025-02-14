import express from "express";
import {
  createClient,
  getClients,
  getClientById,
  updateClient,
  deleteClient,
} from "../controllers/clientController.js";
import { protect } from "../controllers/authController.js";

// create the router
const router = express.Router();

// assign the controllers to the right routes
router.route("/").post(protect, createClient).get(protect, getClients);
router
  .route("/:id")
  .get(protect, getClientById)
  .put(protect, updateClient)
  .delete(protect, deleteClient);

export default router;
