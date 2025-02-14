import mongoose from "mongoose";

const saleSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },
    shoppingCart: {
      type: [
        {
          plan: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Plan",
            required: true,
          },
          services: [{ type: mongoose.Schema.Types.ObjectId, ref: "Service" }],
        },
      ],
      required: true,
      validate: [
        function (value) {
          return Array.isArray(value) && value.length > 0;
        },
        "shoppingCart must be a non-empty array",
      ],
    },
    discount: { type: Number, default: 0 },
    totalPrice: { type: Number },
    date: { type: Date, default: Date.now },
  },
  { strict: "throw" }
);

// PRE-VALIDATE MIDDLEWARE TO LIMIT ACTIVE SALES FOR EACH CLIENT IN THE LAST 3 MONTHS
saleSchema.pre("validate", async function (next) {
  const MAX_ACTIVE_SALES = 10;
  const THREE_MONTHS_AGO = new Date();
  THREE_MONTHS_AGO.setMonth(THREE_MONTHS_AGO.getMonth() - 3);

  const activeSalesCount = await mongoose.model("Sale").countDocuments({
    client: this.client,
    date: { $gte: THREE_MONTHS_AGO }, // Sales in the last 3 months
  });

  if (activeSalesCount >= MAX_ACTIVE_SALES) {
    const error = new Error(
      `This client has reached the maximum number of active sales (${MAX_ACTIVE_SALES}).`
    );
    error.statusCode = 400;
    return next(error);
  }
  next();
});

// PRE-SAVE MIDDLEWARE TO LIMIT THE AMOUNT OF SERVICES IN THE SHOPPING CART
saleSchema.pre("save", async function (next) {
  const MAX_SERVICES_IN_CART = 3;

  let totalItems = 0;
  for (const item of this.shoppingCart) {
    totalItems += item.services.length;
  }

  if (totalItems > MAX_SERVICES_IN_CART) {
    return next(
      new Error(
        `You have exceeded the maximum number of services (${MAX_SERVICES_IN_CART}) in the shopping cart.`
      )
    );
  }
});

// PRE-SAVE MIDDLEWARE TO DETERMINE PRICES DEPENDING ON THE UF
saleSchema.pre("save", async function (next) {
  try {
    let total = 0;

    // Fetch client details to get the UF
    const client = await mongoose.model("Client").findById(this.client);
    if (!client) return next(new Error("Client not found"));

    const uf = client.uf; // Get the state (UF)

    for (const item of this.shoppingCart) {
      // Fetch plan price
      const plan = await mongoose.model("Plan").findById(item.plan);
      if (!plan) return next(new Error("Plan not found"));

      let planPrice = plan.basePrice; // Base price of the plan

      // Fetch services prices
      let servicesPrice = 0;
      for (const serviceId of item.services) {
        const service = await mongoose.model("Service").findById(serviceId);
        if (!service) return next(new Error("Service not found"));
        servicesPrice += service.price;
      }

      // Apply state (UF) adjustment (example: increase by 10% for SP)
      let percentage = getPriceAdjustmentByUF(uf);
      planPrice += planPrice * percentage;
      servicesPrice += servicesPrice * percentage;

      total += planPrice + servicesPrice;
    }

    this.totalPrice = total - this.discount; //  total price with discount
  } catch (error) {
    next(error);
  }
});

//Function to return a percentage
function getPriceAdjustmentByUF(uf) {
  const adjustments = {
    MS: 0.1,
    AC: 0.1, // +10%
    AL: 0.2, // +20%
    AM: 0.05, // +5%
    AP: 0.2,
    BA: 0.12,
    CE: 0.05,
    DF: 0.5,
    ES: 0.5,
    GO: 0.5,
    MA: 0.1,
    MG: 0.09,
    MT: 0.1,
    PA: 0.2,
    PB: 0.25,
    PE: 0.1,
    PI: 0.1,
    PR: 0.0,
    RJ: 0.15,
    RN: 0.1,
    RO: 0.15,
    RR: 0.0,
    RS: 0.0,
    SC: 0.95,
    SE: 0.1,
    SP: 0.15,
    TO: 0.3,
  };
  return adjustments[uf] || 0;
}

export default mongoose.model("Sale", saleSchema);
