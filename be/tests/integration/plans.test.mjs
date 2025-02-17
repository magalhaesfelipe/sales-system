import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "../../src/app.js";
import request from "supertest";
import User from "../../src/models/userModel.js";
import Plan from "../../src/models/planModel.js";
import { signToken } from "../../src/controllers/authController.js";
import { afterAll, beforeAll, expect, jest } from "@jest/globals";
import { createTestUserAndToken } from "../../src/utils/testUtils.js";

jest.setTimeout(10000);
dotenv.config();
const DATABASE = process.env.DATABASE;

describe("Plans API", () => {
  let testUserId, token;
  let planId;

  beforeAll(async () => {
    try {
      //1. DATABASE CONNECTION
      await mongoose.connect(DATABASE);
      console.log("Database connected.");

      // 2. CREATE TEST USER | GENERATE TOKEN
      ({ testUserId, token } = await createTestUserAndToken());

      console.log("Test user id and token:",testUserId, token);
    } catch (error) {
      console.error("Error in beforeAll:", error);
      throw error;
    }
  });

  // TESTS

  // POST /planos
  test("POST /planos should return a new plan document", async () => {
    const planData = {
      name: "premium",
      description: "This is the premium plan.",
      basePrice: 100,
    };

    const planResponse = await request(app)
      .post("/api/planos")
      .set("Authorization", `Bearer ${token}`)
      .send(planData);

    console.log("POST Plan response body:", planResponse.body);

    expect(planResponse.status).toBe(201);
    expect(planResponse.body.data).toHaveProperty("_id");

    planId = planResponse.body.data._id;
    console.log("Plan id:", planId);
  });

  // GET /planos
  test("GET /planos should return all Plan documents", async () => {
    const planResponse = await request(app)
      .get("/api/planos")
      .set("Authorization", `Bearer ${token}`);

    expect(planResponse.status).toBe(200);
    expect(planResponse.body).toHaveProperty("data");
  });

  // GET /planos/:id
  test("GET planos/:id should return a Plan document", async () => {
    const planResponse = await request(app)
      .get(`/api/planos/${planId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(planResponse.status).toBe(200);
    expect(planResponse.body.data).toHaveProperty("_id");
  });

  // PUT /planos/:id
  test("PUT planos/:id should return the modified document", async () => {
    const updateData = {
      basePrice: 499.99,
    };

    const planResponse = await request(app)
      .put(`/api/planos/${planId}`)
      .set("Authorization", `Bearer ${token}`)
      .send(updateData);

    expect(planResponse.status).toBe(200);
    expect(planResponse.body.data).toHaveProperty("_id");
    expect(planResponse.body.data.basePrice).toBe(updateData.basePrice);
  });

  // DELETE /planos/:id
  test("DELETE planos/:id should return a 204 status code", async () => {
    const planResponse = await request(app)
      .delete(`/api/planos/${planId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(planResponse.status).toBe(204);
  });

  // CLEAN UP
  afterAll(async () => {
    console.log("Cleaning up after all Plan tests...");

    if (testUserId) await User.findByIdAndDelete(testUserId);
    if (planId) await Plan.findByIdAndDelete(planId);

    await mongoose.connection.close();
  });
});
