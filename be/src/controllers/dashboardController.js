import Client from "../models/clientModel.js";
import Sale from "../models/saleModel.js";
import Plan from "../models/planModel.js";

// (GET) CLIENTS DASHBOARD WITH MORE FILTERS
export const getClientDashboard = async (req, res, next) => {
  try {
    const { type, minPurchases, maxPurchases, plan } = req.query;

    let filters = {}; // We build the filter first, then pass it to fetch the documents

    // Simple filters
    if (type) filters.type = type;
    if (uf) filters.uf = uf;

    // Fetch client purchase counts if filtering by volume of purchases
    if (minPurchases || maxPurchases) {
      const salesCounts = await Sale.aggregate([
        { $group: { _id: "$client", purchaseCount: { $sum: 1 } } },
        {
          $match: {
            purchaseCount: {
              $gte: Number(minPurchases) || 0,
              $lte: Number(maxPurchases) || Infinity,
            },
          },
        },
      ]);

      var clientIdsPurchase = salesCounts.map((sale) => sale._id);
    }

    // Filter by Plan type
    if (plan) {
      // Find the plan by its name
      const foundPlan = await Plan.findOne({ name: plan });

      if (!foundPlan) {
        return res.status(404).json({
          status: "failed",
          message: "Plan not found",
        });
      }

      const salesWithPlan = await Sale.aggregate([
        { $unwind: "$shoppingCart" },
        { $match: { "shoppingCart.plan": foundPlan._id } },
        { $group: { _id: "$client" } },
      ]);

      var clientIdsWithPlan = salesWithPlan.map((sale) => sale._id);
    }

    // I'm using this to ensure all filters apply together
    if (minPurchases || maxPurchases || plan) {
      if (clientIdsPurchase && clientIdsWithPlan) {
        filters._id = {
          $in: clientIdsPurchase.filter((id) => clientIdsWithPlan.includes(id)),
        };
      } else {
        filters._id = { $in: clientIdsPurchase || clientIdsWithPlan };
      }
    }

    const clients = await Client.find(filters); // All the filters applied together

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
