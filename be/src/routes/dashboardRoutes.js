import express from 'express';
import { getClientDashboard, getSalesDashboard } from '../controllers/dashboardController.js';

const router = express.Router();

router.route('/clientes').get(getClientDashboard);
router.route('/vendas').get(getSalesDashboard);

export default router;