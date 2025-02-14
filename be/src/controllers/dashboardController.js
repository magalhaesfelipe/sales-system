import Client from "../models/clientModel.js";
import Sale from "../models/saleModel.js";
import Plan from "../models/planModel.js";
import Service from "../models/serviceModel.js";

// (GET) CLIENTS DASHBOARD WITH MORE FILTERS
export const getClientDashboard = async (req, res, next) => {
  try {
    const { type, minPurchases, maxPurchases, plan, uf } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limi) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

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
        { $project: { _id: 1, purchaseCount: 1 } }, // Include purchaseCount for minPurchase and maxPurchase filter
      ]);

      // 'salesWithPlan' is an array with objects that have two fields, the sale _id, and purchaseCount for the other filter
      clientIds = salesWithPlan.map((s) => s._id);

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

    if (clientIds && clientIds.length > 0) {
      clientsQuery.where("_id").in(clientIds); // Filters by id the clientsQuery ids that already passed by other filters(if any(type/uf))
    } else if (clientIds !== null && clientIds.length === 0) {
      return res.json([]);
    }

    const totalClients = await Client.countDocuments(clientsQuery.getFilter()); // Count with applied filters
    const clients = await clientsQuery.skip(startIndex).limit(limit); // Execute the query with pagination

    const results = {};

    if (endIndex < totalClients) {
      results.next = {
        page: page + 1,
        limit: limit,
      };
    }

    if (startIndex > 0) {
      results.previous = {
        page: page - 1,
        limit: limit,
      };
    }

    results.data = clients;
    results.totalClients = totalClients;
    results.totalPages = Math.ceil(totalClients / limit);
    results.currentPage = page;

    res.json({
      status: "success",
      message: "Clients found!",
      count: clients.length,
      results: results,
    });
  } catch (error) {
    next(error);
  }
};

// (GET) SALES DASHBOARD
export const getSalesDashboard = async (req, res, next) => {
  try {
    const { clientId, plan, startDate, endDate, uf, services, clientType } =
      req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    let clientFilters = {}; // Filters for client-related criteria

    // Filter by client ID
    if (clientId) clientFilters._id = clientId;

    // Filter by client type
    if (clientType) {
      clientFilters.type = { $regex: new RegExp(clientType, "i") };
    }
    // Filter by UF
    if (uf) clientFilters.uf = { $regex: new RegExp(uf, "i") };

    // Find matching clients FIRST
    let matchingClients = await Client.find(clientFilters).select("_id");
    let clientIds = matchingClients.map((client) => client._id);

    if (clientIds.length === 0 && (clientType || uf || clientId)) {
      // If any client filter is present and no client is found should return empty array
      return res.json([]);
    }

    let filters = {};

    if (clientType || uf || clientId) {
      filters.client = { $in: clientIds };
    }

    // Filter by date range
    if (startDate || endDate) {
      filters.date = {};
      if (startDate) filters.date.$gte = new Date(startDate);
      if (endDate) filters.date.$lte = new Date(endDate);
    }

    // Filter by plan
    if (plan) {
      const foundPlan = await Plan.findOne({ name: plan });
      if (!foundPlan) {
        return res.status(404).json({
          status: "failed",
          message: "Plan not found",
        });
      }
      filters["shoppingCart.plan"] = foundPlan._id;
    }

    // Filter by services
    if (services) {
      const serviceNames = services.split(",");
      const foundServices = await Service.find({
        name: { $in: serviceNames.map((name) => new RegExp(`^${name}$`, "i")) },
      }).select("_id");
      const serviceIds = foundServices.map((s) => s._id);
      filters["shoppingCart.services"] = { $in: serviceIds };
    }

    const salesQuery = Sale.find(filters).populate(
      "client shoppingCart.plan shoppingCart.services"
    );

    const totalSales = await Sale.countDocuments(salesQuery.getFilter()); // Count with filters
    const sales = await salesQuery.skip(startIndex).limit(limit);

    const results = {};

    if (endIndex < totalSales) {
      results.next = {
        page: page + 1,
        limit: limit,
      };
    }

    if (startIndex > 0) {
      results.previous = {
        page: page - 1,
        limit: limit,
      };
    }

    results.data = sales;
    results.totalSales = totalSales;
    results.totalPages = Math.ceil(totalSales / limit);
    results.currentPage = page;

    res.json({
      status: "success",
      message: "Sales found!",
      count: sales.length,
      results: results,
    });
  } catch (error) {
    next(error);
  }
};
