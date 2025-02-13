import Client from "../models/clientModel.js";

// (POST) CREATE CLIENT
export const createClient = async (req, res, next) => {
  try {
    const { name, cpfCnpj, address, phone, email, birthDate, type, cep, uf } =
      req.body;

    const clientData = {
      name: name,
      cpfCnpj: cpfCnpj,
      address: address,
      phone: phone,
      email: email,
      birthDate: birthDate,
      type: type,
      cep: cep,
      uf: uf,
    };

    const client = new Client(clientData);
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
    const clients = await Client.find();

    if (!clients) {
      return res.status(404).json({
        status: "failed",
        message: "No clients found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Clients found!",
      count: clients.length,
      data: clients,
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
