import Client from "../models/clientModel.js";
import Sale from "../models/saleModel.js";
import Plan from "../models/planModel.js";

// (GET) CLIENTS DASHBOARD WITH MORE FILTERS
export const getClientDashboard = async (req, res, next) => {
  try {
    const { type, minPurchases, maxPurchases, plan, uf } = req.query;

    let filters = {};
    if (type) filters.type = type;
    if (uf) filters.uf = { $regex: new RegExp(uf, "i") }; // Case-insensitive regex

    let clientIds = null;

    if (plan) {
      const foundPlan = await Plan.findOne({ name: plan });
      if (!foundPlan) {
        return res.status(404).json({
          status: "failed",
          message: "Plan not found",
        });
      }

      // Aggregate sales to find clients who bought the specified plan(the aggregation returns and array with objects'[{"id_": ObjectId("123"), "purchaseCount": 3}]')
      const salesWithPlan = await Sale.aggregate([
        { $unwind: "$shoppingCart" },
        { $match: { "shoppingCart.plan": foundPlan._id } },
        { $group: { _id: "$client", purchaseCount: { $sum: 1 } } }, // Count purchases per client
        { $project: { _id: 1, purchaseCount: 1 } }, // Include purchaseCount for range filtering
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

      const idsAndSalesCounts = await Sale.aggregate([
        { $group: { _id: "$client", purchaseCount: { $sum: 1 } } },
        { $match: { purchaseCount: { $gte: min, $lte: max } } },
      ]);
      clientIds = idsAndSalesCounts.map((idSalecount) => idSalecount._id);
    }

    // Applying TYPE and UF filters BEFORE checking clientIds to ensure they are aways applied
    let clientsQuery = Client.find(filters); // The result is a query object, not the actual data yet

    // 
    if (clientIds && clientIds.length > 0) {
      clientsQuery.where("_id").in(clientIds); // Filters by id the clientsQuery ids that already passed by other filters(if any(type/uf))
    } else if (clientIds !== null && clientIds.length === 0) {
      return res.json([]);
    }

    const clients = await clientsQuery; // Execute the query

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
