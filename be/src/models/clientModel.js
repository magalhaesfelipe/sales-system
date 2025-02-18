import mongoose from "mongoose";
import validator from "validator";
import axios from "axios";
import { cpf, cnpj } from "cpf-cnpj-validator";
import {
  isValidPhoneNumber,
  parsePhoneNumberFromString,
} from "libphonenumber-js";

const clientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    cpfCnpj: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: function (value) {
          return isValidCpfCnpj(value);
        },
        message: "Invalid CPF/CNPJ",
      },
    },
    phone: {
      type: String,
      validate: {
        validator: isValidPhone,
        message: "Invalid phone number",
      },
    },
    address: { type: String },
    email: {
      type: String,
      required: true,
      validate: [validator.isEmail, "Invalid email"],
      unique: true,
    },
    birthDate: {
      type: Date,
      validate: {
        validator: (value) => value <= Date.now(), // Custom validator for birthDate
        message: "Birth date must be in the past",
      },
    },
    type: {
      type: String,
      enum: ["pessoa-fisica", "pessoa-juridica"],
      required: true,
      lowercase: true,
    },
    uf: { type: String, lowercase: true },
    cep: { type: String, required: true },
  },
  { strict: "throw" }
);

// MIDDLEWARE TO FETCH THE ADDRESS WITH ViaCEP
clientSchema.pre("save", async function (next) {
  if (this.cep) {
    try {
      // Fetch address using the external API (e.g., ViaCEP)
      const response = await axios.get(
        `https://viacep.com.br/ws/${this.cep}/json/`
      );

      if (response.data && !response.data.erro) {
        this.address = `${response.data.logradouro}, ${response.data.bairro}, ${response.data.localidade} - ${response.data.uf}`;
        this.uf = response.data.uf;
      } else {
        throw new Error("Invalid CEP");
      }
    } catch (error) {
      return next(error); // Handle API errors
    }
  }

  next(); // Continue with the save operation
});

// CPF/CNPJ VALIDATION FUNCTION
function isValidCpfCnpj(value) {
  if (!value) return false;

  const cleanValue = value.replace(/[^\d]+/g, ""); // Remove non-numeric characters

  if (cleanValue.length === 11) {
    return cpf.isValid(cleanValue);
  } else if (cleanValue.length === 14) {
    return cnpj.isValid(cleanValue);
  } else {
    return false;
  }
}

// PHONE NUMBER VALIDATION FUNCTION
function isValidPhone(value) {
  if (!value) return true;

  const phoneNumber = parsePhoneNumberFromString(value, "BR");
  return phoneNumber ? phoneNumber.isValid() : false;
}

export default mongoose.model("Client", clientSchema);
