import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "../../src/app.js";
import request from "supertest";
import User from "../../src/models/userModel.js";
import Service from "../../src/models/serviceModel.js";
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
      console.log("Database connected in Plans API test.");

      // 2. CREATE USER | GENERATE TOKEN
      ({ testUserId, token } = await createTestUserAndToken());
    } catch (error) {
      console.error("Error in beforeAll:", error);
      throw error;
    }
  });

  // TESTS

  // POST /servicos
  test("POST /servicos should return a new Plan document", async () => {
    const serviceData = {
      name: "Test service",
      description: "This is the test service.",
      price: 30,
    };

    const serviceResponse = await request(app)
      .post("/api/servicos")
      .set("Authorization", `Bearer ${token}`)
      .send(serviceData);

    serviceId = serviceResponse.body.data._id;

    expect(serviceResponse.status).toBe(201);
    expect(serviceResponse.body.data).toHaveProperty("_id");
  });

  // GET /servicos
  test("GET /servicos should return all Services documents", async () => {
    const serviceResponse = await request(app)
      .get("/api/servicos")
      .set("Authorization", `Bearer ${token}`);

    expect(serviceResponse.status).toBe(200);
    expect(serviceResponse.body).toHaveProperty("data");
  });

  // GET /servicos/:id
  test("GET /servicos/:id should return a Service document", async () => {
    const serviceResponse = await request(app)
      .get(`/api/servicos/${serviceId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(serviceResponse.status).toBe(200);
    expect(serviceResponse.body.data).toHaveProperty("_id");
  });

  // PUT /servicos/:id
  test("PUT /servicos/:id should return the modified document", async () => {
    const updateData = {
      price: 70,
    };

    const serviceResponse = await request(app)
      .put(`/api/servicos/${serviceId}`)
      .set("Authorization", `Bearer ${token}`)
      .send(updateData);

    expect(serviceResponse.status).toBe(200);
    expect(serviceResponse.body.data.price).toBe(updateData.price);
  });

  // DELETE /servicos/:id
  test("DELETE servicos/:id should return a 204 status code", async () => {
    const serviceResponse = await request(app)
      .delete(`/api/servicos/${serviceId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(serviceResponse.status).toBe(204);
  });

  // CLEAN UP
  afterAll(async () => {
    console.log("Cleaning up after all Service tests...");

    if (testUserId) await User.findByIdAndDelete(testUserId);
    if (serviceId) await Service.findByIdAndDelete(serviceId);

    await mongoose.connection.close();
  });
});
