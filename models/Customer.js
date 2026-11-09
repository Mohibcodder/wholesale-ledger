import mongoose from 'mongoose';

const CustomerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    number: { type: String, required: true },
    city: { type: String, required: true, uppercase: true }, // e.g. LHR, KRH, MLT
    address: { type: String, required: true },
    currentBalance: { type: Number, default: 0 }, // Credit / Udhaar Amount
  },
  { timestamps: true }
);

export default mongoose.models.Customer || mongoose.model('Customer', CustomerSchema);