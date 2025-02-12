import Client from "../models/clientModel.js";
import Sale from "../models/saleModel.js";
import Plan from "../models/planModel.js";

// (GET) CLIENTS DASHBOARD WITH MORE FILTERS
export const getClientDashboard = async (req, res, next) => {
  try {
    const { type, minPurchases, maxPurchases, plan, uf } = req.query;

    let filters = {};
    if (type) filters.type = type;
    if (uf) filters.uf = uf;

    let clientIds = null;

    if (plan) {
      const foundPlan = await Plan.findOne({ name: plan });
      if (!foundPlan) {
        return res.status(404).json({
          status: "failed",
          message: "Plan not found",
        });
      }

      // Aggregate sales to find clients who bought the specified plan
      const salesWithPlan = await Sale.aggregate([
        { $unwind: "$shoppingCart" },
        { $match: { "shoppingCart.plan": foundPlan._id } },
        { $group: { _id: "$client", purchaseCount: { $sum: 1 } } }, // Count purchases per client
        { $project: { _id: 1, purchaseCount: 1 } }, // Include purchaseCount for later filtering
      ]);

      // 'salesWithPlan' is an array with objects that have two fields, the sale _id, and purchaseCount for the other filter
      clientIds = salesWithPlan.map((sale) => sale._id);

      if (minPurchases || maxPurchases) {
        const min = Number(minPurchases) || 0;
        const max = Number(maxPurchases) || Infinity;

        // First filter only the sales with purchased count inside the range 'min' and 'max'. Then extract the ids
        clientIds = salesWithPlan 
          .filter( 
            (sale) => sale.purchaseCount >= min && sale.purchaseCount <= max
          )
          .map((sale) => sale._id);

        if (clientIds.length === 0) {
          return res.json([]); // No clients match both plan and purchase criteria
        }
      }
    } else if (minPurchases || maxPurchases) {
      // Handle purchase range filtering only when plan is NOT specified
      const min = Number(minPurchases) || 0;
      const max = Number(maxPurchases) || Infinity;

      const salesCounts = await Sale.aggregate([
        { $group: { _id: "$client", purchaseCount: { $sum: 1 } } },
        { $match: { purchaseCount: { $gte: min, $lte: max } } },
      ]);
      clientIds = salesCounts.map((sale) => sale._id);
    }

    if (clientIds !== null && clientIds.length > 0) {
      filters._id = { $in: clientIds };
    } else {
      return res.json([]);
    }

    const clients = await Client.find(filters);
    res.json(clients);
  } catch (error) {
    next(error);
  }
};

// (GET) SALES DASHBOARD
export const getSalesDashboard = async (req, res, next) => {
  try {
  } catch (error) {}
};
