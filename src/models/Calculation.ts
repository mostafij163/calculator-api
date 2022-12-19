import { Schema, Document, model } from "mongoose";

export interface Calculation extends Document {
  title: string;
  equation: string;
  fileUri: string;
  result: number;
  index: number;
}

const calculationSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  equation: {
    type: String,
    required: true,
  },
  fileUri: {
    type: String,
    required: true,
  },
  result: {
    type: Number,
    required: true,
  },

  index: {
    type: Number,
    default: 0,
    required: true,
  },
});

export const CalculationModel = model<Calculation>(
  "calculation",
  calculationSchema
);
