import Sale from "../models/saleModel.js";
import mongoose from "mongoose";

// (POST) CREATE SALE
export const createSale = async (req, res, next) => {
  try {
    const newSale = await Sale.create(req.body);

    // Populate sale with client, plans, and services
    const populatedSale = await newSale.populate({
      path: "client shoppingCart.plan shoppingCart.services", // Paths to populate
    });

    res.status(201).json({
      status: "success",
      message: "Sale created!",
      data: populatedSale, // Sending the populated data
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      error.statusCode = 400;
    }

    next(error);
  }
};

// (GET) SALES
export const getSales = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const sales = await Sale.find().skip(startIndex).limit(limit);
    const totalSales = await Sale.countDocuments();

    if (!sales) {
      return res.status(404).json({
        status: "failed",
        message: "No sales found",
      });
    }

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

    res.status(200).json({
      status: "success",
      message: "Sales found!",
      count: sales.length,
      results: results,
    });
  } catch (error) {
    next(error);
  }
};

// (GET) SALES BY ID
export const getSaleById = async (req, res, next) => {
  try {
    const sale = await Sale.findById(req.params.id);

    if (!sale) {
      return res.status(404).json({
        status: "failed",
        message: "Sale NOT found",
      });
    }

    const populatedSale = await sale.populate({
      path: "client shoppingCart.plan shoppingCart.services",
    });

    res.status(200).json({
      status: "success",
      message: "Sale found!",
      data: populatedSale,
    });
  } catch (error) {
    next(error);
  }
};

// (PUT) UPDATE SALE
export const updateSale = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { client, date, shoppingCart, totalPrice, discount } = req.body;

    if (shoppingCart && !Array.isArray(shoppingCart)) {
      return res.status(400).json({ message: "shoppingCart must be an array" });
    }

    if (totalPrice !== undefined && (totalPrice <= 0 || totalPrice > 100000)) {
      return res
        .status(400)
        .json({ message: "totalPrice must be between 0 and 100000" });
    }

    const updateData = {
      client,
      date,
      shoppingCart,
      totalPrice,
      discount,
    };

    const updatedSale = await Sale.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedSale) {
      return res.status(404).json({
        status: "failed",
        message: "Sale NOT found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Sale found!",
      data: updatedSale,
    });
  } catch (error) {
    next(error);
  }
};

// (DELETE) SALE
export const deleteSale = async (req, res, next) => {
  try {
    const deletedSale = await Sale.findByIdAndDelete(req.params.id);

    if (!deletedSale) {
      return res.status(404).json({
        status: "failed",
        message: "Sale NOT found",
      });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
