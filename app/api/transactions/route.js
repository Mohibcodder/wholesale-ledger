import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/dbConnect';
import Transaction from '../../../models/Transaction';
import Customer from '../../../models/Customer';

// GET: Fetch transactions for a specific customer
export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get('customerId');

    if (!customerId) {
      return NextResponse.json({ success: false, error: 'Customer ID is required' }, { status: 400 });
    }

    const transactions = await Transaction.find({ customerId }).sort({ date: -1 });
    return NextResponse.json({ success: true, data: transactions });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Add new entry (Credit / Payment Received)
export async function POST(req) {
  try {
    await dbConnect();
    const { customerId, type, amount, description } = await req.json();

    if (!customerId || !type || !amount) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Transaction save karein
    const transaction = await Transaction.create({
      customerId,
      type, // 'CREDIT' or 'PAYMENT'
      amount: Number(amount),
      description: description || '',
    });

    // 2. Customer balance auto-adjust karein
    // CREDIT increases debt (+), PAYMENT reduces debt (-)
    const balanceAdjustment = type === 'CREDIT' ? Number(amount) : -Number(amount);

    await Customer.findByIdAndUpdate(customerId, {
      $inc: { currentBalance: balanceAdjustment },
    });

    return NextResponse.json({ success: true, data: transaction }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}