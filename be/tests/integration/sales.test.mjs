import mongoose from "mongoose";
import request from "supertest";
import app from "../../src/app.js"; // Points to the Express app
import { signToken } from "../../src/controllers/authController.js";
import User from "../../src/models/userModel.js";
import { afterAll, jest } from "@jest/globals";
import dotenv from "dotenv";
import Sale from "../../src/models/saleModel.js";

// DATABASE CONNECTION
dotenv.config();
const DATABASE = process.env.DATABASE;
jest.setTimeout(10000);

beforeAll(async () => {
  await mongoose.connect(DATABASE).then(() => {
    console.log("Database connected!");
  });
});

describe("Sales API", () => {
  let token;
  let testUser;
  let testSaleId;
  let testClientId;

  beforeAll(async () => {
    // 1. CREATE/RETRIEVE TEST USER | GENERATE TOKEN
    testUser = await User.findOne({ email: "test@example.com" });

    if (!testUser) {
      console.log("No user test user found");
      testUser = await User.create({
        name: "Test User",
        email: "test@example.com",
        password: "123456789",
        passwordConfirm: "123456789",
      });
    }
    token = signToken(testUser._id);
    console.log("THIS IS THE TEST USER: ", testUser);

    // 2. CREATE TEST CLIENT for testing
    const newClientData = {
      name: "Banco Safra",
      cpfCnpj: "58.160.789/0001-28",
      phone: "11987654321",
      email: "bancossafra@gmail.com",
      birthDate: "1985-07-15",
      type: "pessoa-juridica",
      cep: "01310-930",
    };

    const clientResponse = await request(app)
      .post("/api/clients")
      .set("Authorization", `Bearer ${token}`)
      .send(newClientData);

    expect(clientResponse.status).toBe(201);
    expect(clientResponse.body).toHaveProperty("_id");
    testClientId = clientResponse.body.data._id;

    // 3. CREATE TEST SALE
    const newSaleData = {
      client: testClientId,
      date: "2025-01-20T12:34:56.789Z",
      shoppingCart: [
        {
          plan: "67acd0e44c68edbe83a6805b",
          services: ["67ab81793dc3204b83940d66", "67aba3d66b9a4054d351aee3"],
        },
      ],
      discount: 5.0,
    };

    const saleResponse = await request(app)
      .post("/api/vendas")
      .set("Authorization", `Bearer ${token}`)
      .send(newSaleData);

    // Check if the sale was created successfully
    expect(saleResponse.status).toBe(201);
    expect(saleResponse.body).toHaveProperty("_id");
    testSaleId = saleResponse.body.data._id; // Store the ID for later use
    console.log("TEST SALE ID:", testSaleId);
  });

  // GET /vendas
  test("GET /vendas should return a list of sales", async () => {
    const response = await request(app)
      .get("/api/vendas")
      .set("Authorization", `Bearer ${token}`); // Set the token in the header

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.results.data)).toBe(true);
  });

  test("GET /vendas should return 401 without token", async () => {
    const response = await request(app).get("/api/vendas");
    expect(response.status).toBe(401);
  });

  test("GET /vendas should return 401 with invalid token", async () => {
    const response = await request(app)
      .get("/api/vendas")
      .set("Authorization", `Bearer invalidtoken`);

    expect(response.status).toBe(401);
  });

  // GET /vendas/:id
  test("GET /vendas/:id should return a sale by ID", async () => {
    const response = await request(app)
      .get(`/api/vendas/${testSaleId}`)
      .set("Authoroization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect();
  });

  // POST /vendas

  // PUT /vendas

  // DELETE /vendas

  // CLEAN UP
  afterAll(async () => {
    console.log("Cleaning up after all tests...");

    await User.findByIdAndDelete(testUser._id);
    await Client.findByIdAndDelete(testClientId);
    await Sale.findByIdAndDelete(testSaleId);
    await mongoose.disconnect();
  });
});
