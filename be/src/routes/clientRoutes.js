import express from "express";
import {
  createClient,
  getClients,
  getClientById,
  updateClient,
  deleteClient,
} from "../controllers/clientController.js";

// create the router
const router = express.Router();

// assign the controllers to the right routes
router.route("/").post(createClient).get(getClients);
router
  .route("/:id")
  .get(getClientById)
  .put(updateClient)
  .delete(deleteClient);

export default router;
