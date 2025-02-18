import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "../../src/app.js";
import request from "supertest";
import User from "../../src/models/userModel.js";
import Client from "../../src/models/clientModel.js";
import { afterAll, beforeAll, describe, expect, jest } from "@jest/globals";
import { createTestUserAndToken } from "../../src/utils/testUtils";
import { v4 as uuidv4 } from "uuid";
import e from "express";

jest.setTimeout(10000);
dotenv.config();
const DATABASE = process.env.DATABASE;
const uniqueId = uuidv4();

describe("Clients API", () => {
  let testUserId, token, clientId;

  beforeAll(async () => {
    try {
      // 1. DATABASE CONNECTION
      await mongoose.connect(DATABASE);
      console.log("Database connected in Clients API test.");

      // 2. CREATE USER | GENERATE TOKEN
      ({ testUserId, token } = await createTestUserAndToken());
    } catch (error) {
      console.error("Error in beforeAll:", error);
      throw error;
    }
  });

  // TESTS

  // POST /clientes
  test("POST /clientes should return a new Client document", async () => {
    const clientData = {
      name: "Test Client",
      cpfCnpj: `47.960.950/0001-21`,
      phone: "11987654321",
      email: `test${uniqueId}@example.com`,
      birthDate: "1985-07-15",
      type: "pessoa-fisica",
      cep: "80530-908",
    };

    const clientResponse = await request(app)
      .post("/api/clientes")
      .set("Authorization", `Bearer ${token}`)
      .send(clientData);

    console.log("POST /clientes response body:", clientResponse.body);
    clientId = clientResponse.body.data._id;

    expect(clientResponse.status).toBe(201);
    expect(clientResponse.body.data).toHaveProperty("_id");
  });

  // GET /clientes
  test("GET /clientes should return all Client documents", async () => {
    const clientResponse = await request(app)
      .get("/api/clientes")
      .set("Authorization", `Bearer ${token}`);

    expect(clientResponse.status).toBe(200);
    expect(clientResponse.body).toHaveProperty("results");
  });

  // GET /clientes/:id
  test("GET /clientes/:id should return a Client document", async () => {
    const clientResponse = await request(app)
      .get(`/api/clientes/${clientId}`)
      .set("Authorization", `Bearer ${token}`);

    console.log(clientResponse.body);

    expect(clientResponse.status).toBe(200);
    expect(clientResponse.body.data).toHaveProperty("_id");
  });

  // PUT /clientes/:id
  test("PUT /clientes/:id should return the modified document", async () => {
    const updateData = { phone: "(67) 99289-6001"}
    
    const clientReponse = await request(app)
      .put()
      .set()
      .send() 



  })

  // DELETE /clientes/:id

  afterAll(async () => {
    console.log("Cleaning up after all Client tests...");

    if (testUserId) await User.findByIdAndDelete(testUserId);
    if (clientId) await Client.findByIdAndDelete(clientId);

    await mongoose.connection.close();
  });
});
