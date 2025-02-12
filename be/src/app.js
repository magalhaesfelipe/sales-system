import express from "express";
import { errorHandler } from "./middlewares/errorHandler.js";
// import the routers
import clientRouter from "./routes/clientRoutes.js";
import planRouter from "./routes/planRoutes.js";
import serviceRouter from "./routes/serviceRoutes.js";
import saleRouter from "./routes/saleRoutes.js";
import dashboardRouter from "./routes/dashboardRoutes.js";

const app = express();
app.use(express.json());

// ROUTES - Pass the router as a middleware for the route
app.use("/api/clientes", clientRouter);
app.use("/api/planos", planRouter);
app.use("/api/servicos", serviceRouter);
app.use("/api/vendas", saleRouter);
app.use("/api/dashboard", dashboardRouter);

// Error handling middleware
app.use(errorHandler);

export default app;
