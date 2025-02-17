import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "../../src/app.js";
import request from "supertest";
import User from "../../src/models/userModel.js";
import Service from "../../src/models/serviceModel.js";
import { signToken } from "../../src/controllers/authController.js";
import { afterAll, beforeAll, describe, expect, jest } from "@jest/globals";
import { createTestUserAndToken } from "../../src/utils/testUtils.js";

jest.setTimeout(10000);
dotenv.config();
const DATABASE = process.env.DATABASE;

describe("Services API", () => {
  let testUserId, token, serviceId;

  beforeAll(async () => {
    try {
      // 1. DATABASE CONNECTION
      await mongoose.connect(DATABASE);
      console.log("Database connected.");

      // 2. CREATE TEST USER | GENERATE TOKEN
      ({ testUserId, token } = await createTestUserAndToken());
      console.log("Test user id and token:", testUserId, token);
    } catch (error) {
      console.error("Error in beforeAll:", error);
      throw error;
    }
  });

  // TESTS

  // POST /servicos
  test("POST /servicos should return a new plan document", async () => {
    const serviceData = {
      name: "Test service",
      description: "This is the test service.",
      price: 30,
    };

    const serviceResponse = await request(app)
      .post("/api/servicos")
      .set("Authorization", `Bearer ${token}`)
      .send(serviceData);

    console.log("POST /servicos response body:", serviceResponse.body);

    serviceId = serviceResponse.body.data._id;
    console.log("Service id:", serviceId);

    expect(serviceResponse.status).toBe(201);
    expect(serviceResponse.body.data).toHaveProperty("_id");
  });

  // GET /servicos

  // GET /servicos/:id

  // PUT /servicos/:id

  // DELETE /servicos/:id

  // CLEAN UP
  afterAll(async () => {
    console.log("Cleaning up after all Service tests...");

    if (testUserId) await User.findByIdAndDelete(testUserId);

    await mongoose.connection.close();
  });
});
