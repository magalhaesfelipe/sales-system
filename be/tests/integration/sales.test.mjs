import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "../../src/app.js"; // Points to the Express app
import request from "supertest";
import User from "../../src/models/userModel.js";
import Client from "../../src/models/clientModel.js";
import Plan from "../../src/models/planModel.js";
import Service from "../../src/models/serviceModel.js";
import Sale from "../../src/models/saleModel.js";
import { jest } from "@jest/globals";
import { createTestUserAndToken } from "../../src/utils/testUtils.js";

jest.setTimeout(10000);
dotenv.config();
const DATABASE = process.env.DATABASE;

describe("Sales API", () => {
  let testUserId, token, clientId, planId, serviceId, saleId;

  beforeAll(async () => {
    try {
      // 1. DATABASE CONNECTION
      await mongoose.connect(DATABASE);
      console.log("Database connected in Sales API test.");

      // 2. CREATE USER | GENERATE TOKEN
      ({ testUserId, token } = await createTestUserAndToken());

      // 3. CREATE CLIENT, PLAN AND SERVICE

      // CLIENT
      const clientData = {
        name: "Test Client",
        cpfCnpj: "33.592.510/0001-54",
        phone: "11987654321",
        email: "bancosafra@gmail.com",
        birthDate: "1985-07-15",
        type: "pessoa-juridica",
        cep: "01310-930",
      };

      const clientResponse = await request(app)
        .post("/api/clientes")
        .set("Authorization", `Bearer ${token}`)
        .send(clientData);

      if (clientResponse.status !== 201) {
        throw new Error(`Failed to create client: ${clientResponse.body}`);
      }

      clientId = clientResponse.body.data._id;

      // PLAN
      const planData = {
        name: "basico",
        description: "This is a test Plan.",
        basePrice: 250,
      };

      const planResponse = await request(app)
        .post("/api/planos")
        .set("Authorization", `Bearer ${token}`)
        .send(planData);

      if (planResponse.status !== 201) {
        throw new Error(`Failed to create plan: ${planResponse.body}`);
      }

      planId = planResponse.body.data._id;

      // SERVICE
      const serviceData = {
        name: "Test Service",
        description: "This is a test Service.",
        price: 130,
      };

      const serviceResponse = await request(app)
        .post("/api/servicos")
        .set("Authorization", `Bearer ${token}`)
        .send(serviceData);

      if (serviceResponse.status !== 201) {
        throw new Error(`Failed to create service: ${serviceResponse.body}`);
      }

      serviceId = serviceResponse.body.data._id;
    } catch (error) {
      console.error("Error in beforeAll:", error);
      throw error;
    }
  });

  // TESTS

  // POST /vendas
  test("POST /vendas should return a new sale document", async () => {
    const saleData = {
      client: clientId,
      date: "2025-01-20T12:34:56.789Z",
      shoppingCart: [
        {
          plan: `${planId}`,
          services: [`${serviceId}`],
        },
      ],
      discount: 5.0,
    };


    const saleResponse = await request(app)
      .post("/api/vendas")
      .set("Authorization", `Bearer ${token}`)
      .send(saleData);

    saleId = saleResponse.body.data._id;
    console.log("SALE ID:", saleId);

    expect(saleResponse.status).toBe(201);
    expect(saleResponse.body.data).toHaveProperty("_id");
  });

  // GET /vendas
  test("GET /vendas should return all Sale documents", async () => {
    const saleResponse = await request(app)
      .get("/api/vendas")
      .set("Authorization", `Bearer ${token}`); // Set the token in the header

    expect(saleResponse.status).toBe(200);
    expect(saleResponse.body).toHaveProperty("results");
  });

  test("GET /vendas should return 401 without token", async () => {
    const saleResponse = await request(app).get("/api/vendas");
    expect(saleResponse.status).toBe(401);
  });

  test("GET /vendas should return 401 with invalid token", async () => {
    const saleResponse = await request(app)
      .get("/api/vendas")
      .set("Authorization", `Bearer invalidtoken`);

    expect(saleResponse.status).toBe(401);
  });

  // GET /vendas/:id
  test("GET /vendas/:id should return a sale by ID", async () => {
    const saleResponse = await request(app)
      .get(`/api/vendas/${saleId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(saleResponse.status).toBe(200);
    expect(saleResponse.body.data).toHaveProperty("_id");
  });

  // PUT /vendas/:id
  test("PUT /vendas/:id should return a sale document", async () => {
    const updateData = { discount: 10 };

    const saleReponse = await request(app)
      .put(`/api/vendas/${saleId}`)
      .set("Authorization", `Bearer ${token}`)
      .send(updateData);

    expect(saleReponse.status).toBe(200);
    expect(saleReponse.body.data.discount).toBe(10);
  });

  // DELETE /vendas/:id
  test("DELETE /vendas/:id should return a 204 status code", async () => {
    const saleResponse = await request(app)
      .delete(`/api/vendas/${saleId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(saleResponse.status).toBe(204);
  });

  // CLEAN UP
  afterAll(async () => {
    console.log("Cleaning up after all Sale tests...");

    if (testUserId) await User.findByIdAndDelete(testUserId);
    if (clientId) await Client.findByIdAndDelete(clientId);
    if (planId) await Plan.findByIdAndDelete(planId);
    if (serviceId) await Service.findByIdAndDelete(serviceId);
    if (saleId) await Sale.findByIdAndDelete(saleId);

    await mongoose.connection.close();
  });
});
