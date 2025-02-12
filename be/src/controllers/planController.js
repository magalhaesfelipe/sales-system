import Plan from "../models/planModel.js";

// (POST) CREATE PLAN
export const createPlan = async (req, res, next) => {
  try {
    const { name, description, basePrice } = req.body;
    const planData = { name, description, basePrice };

    const newPlan = await Plan.create(planData);

    res.status(201).json({
      status: "success",
      message: "Plan created!",
      data: newPlan,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      error.statusCode = 400;
    }

    next(error);
  }
};

// (GET) PLANS
export const getPlans = async (req, res, next) => {
  try {
    const plans = await Plan.find();

    if (!plans) {
      return res.status(404).json({
        status: "failed",
        message: "No plans found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Plans found!",
      count: plans.length,
      data: plans,
    });
  } catch (error) {
    next(error);
  }
};

// (GET) PLANS BY ID
export const getPlanById = async (req, res, next) => {
  try {
    const plan = await Plan.findById(req.params.id);

    if (!plan) {
      return res.status(404).json({
        status: "failed",
        message: "Plan not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Plan found!",
      data: plan,
    });
  } catch (error) {
    next(error);
  }
};

// (PUT) UPDATE PLAN
export const updatePlan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedPlan = await Plan.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedPlan) {
      return res.status(404).json({
        status: "failed",
        message: "Plan not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Plan updated",
      data: updatedPlan,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      error.statusCode = 400;
    }

    next(error);
  }
};

// (DELETE) PLAN
export const deletePlan = async (req, res, next) => {
  try {
    const deletedPlan = await Plan.findByIdAndDelete(req.params.id);

    if (!deletedPlan) {
      return res.status(404).json({
        status: "failed",
        message: "Plan not found",
      });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
