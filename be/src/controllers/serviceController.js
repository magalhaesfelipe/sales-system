import Service from "../models/serviceModel.js";

// (POST) CREATE SERVICE
export const createService = async (req, res, next) => {
  try {
    const newService = await Service.create(req.body);

    res.status(201).json({
      status: "success",
      message: "Service created!",
      data: newService,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      error.statusCode = 400;
    }

    next(error);
  }
};

// (GET) SERVICES
export const getServices = async (req, res, next) => {
  try {
    const services = await Service.find();

    if (!services) {
      return res.status(404).json({
        status: "Failed",
        message: "Not services found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Services found!",
      count: services.length,
      data: services,
    });
  } catch (error) {
    next(error);
  }
};

// (GET) SERVICE BY ID
export const getServiceById = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        status: "failed",
        message: "Service NOT found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Service found!",
      data: service,
    });
  } catch (error) {
    next(error);
  }
};

// (PUT) UPDATE SERVICE
export const updateService = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedService = await Service.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedService) {
      return res.status(404).json({
        status: "failed",
        message: "Service NOT found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Service updated!",
      data: updatedService,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      error.statusCode = 400;
    }
    next(error);
  }
};

// (DELETE) SERVICE
export const deleteService = async (req, res, next) => {
  try {
    const deletedService = await Service.findByIdAndDelete(req.params.id);

    if (!deletedService) {
      return res.status(404).json({
        status: "failed",
        message: "Service NOT found",
      });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
