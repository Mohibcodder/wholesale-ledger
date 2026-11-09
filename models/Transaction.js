import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    type: { type: String, enum: ['CREDIT', 'PAYMENT'], required: true }, // CREDIT = Maal Diya, PAYMENT = Wasool Kiye
    amount: { type: Number, required: true },
    description: { type: String, default: '' },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);