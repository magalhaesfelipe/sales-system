import app from "./app.js";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const DATABASE = process.env.DATABASE;
const PORT = process.env.PORT || 3000;

mongoose.connect(DATABASE).then(() => {
  console.log("Database connected!");
});

const server = app.listen(PORT, () => {
  console.log(`App running on PORT ${PORT}`);
});
