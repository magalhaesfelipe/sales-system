import Client from "../models/clientModel.js";

// (POST) CREATE CLIENT
export const createClient = async (req, res, next) => {
  try {
    const client = new Client(req.body);
    await client.save();

    res.status(201).json({
      status: "success",
      message: "Client created!",
      data: client,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      error.statusCode = 400;
    }

    next(error);
  }
};

// (GET) CLIENTS
export const getClients = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const clients = await Client.find().skip(startIndex).limit(limit);
    const totalClients = await Client.countDocuments();

    if (!clients) {
      return res.status(404).json({
        status: "failed",
        message: "No clients found",
      });
    }

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

    res.status(200).json({
      status: "success",
      message: "Clients found!",
      count: clients.length,
      results: results,
    });
  } catch (error) {
    next(error);
  }
};

// (GET) CLIENT BY ID
export const getClientById = async (req, res, next) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      return res.status(404).json({
        status: "failed",
        message: "Client NOT found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Client found!",
      data: client,
    });
  } catch (error) {
    next(error);
  }
};

// (PUT) UPDATE CLIENT
export const updateClient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedClient = await Client.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updateClient) {
      return res.status(404).json({
        status: "failed",
        message: "Client not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Client updated!",
      data: updatedClient,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      error.statusCode = 400;
    }

    next(error);
  }
};

// (DELETE) CLIENT
export const deleteClient = async (req, res, next) => {
  try {
    const deletedClient = await Client.findByIdAndDelete(req.params.id);

    if (!deletedClient) {
      return res.status(404).json({
        status: "failed",
        message: "Client not found",
      });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
