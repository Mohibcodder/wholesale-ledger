import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/dbConnect';
import Transaction from '../../../../models/Transaction';
import Customer from '../../../../models/Customer';

// PUT: Edit a transaction & adjust customer balance
export async function PUT(req, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const { type, amount, description, date } = await req.json();

    const oldTx = await Transaction.findById(id);
    if (!oldTx) {
      return NextResponse.json({ success: false, error: 'Transaction not found' }, { status: 404 });
    }

    // 1. Purani transaction ka balance effect reverse karein
    const oldEffect = oldTx.type === 'CREDIT' ? oldTx.amount : -oldTx.amount;

    // 2. Nayi transaction ka balance effect calculate karein
    const newAmount = Number(amount);
    const newEffect = type === 'CREDIT' ? newAmount : -newAmount;

    const netDifference = newEffect - oldEffect;

    // 3. Transaction update karein
    const updatedTx = await Transaction.findByIdAndUpdate(
      id,
      {
        type,
        amount: newAmount,
        description: description || '',
        ...(date && { date: new Date(date) }),
      },
      { new: true }
    );

    // 4. Customer balance update karein
    await Customer.findByIdAndUpdate(oldTx.customerId, {
      $inc: { currentBalance: netDifference },
    });

    return NextResponse.json({ success: true, data: updatedTx });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE: Delete a transaction & revert customer balance
export async function DELETE(req, { params }) {
  try {
    await dbConnect();
    const { id } = await params;

    const tx = await Transaction.findById(id);
    if (!tx) {
      return NextResponse.json({ success: false, error: 'Transaction not found' }, { status: 404 });
    }

    // Reverse balance effect (agar CREDIT tha toh balance kam hoga, PAYMENT tha toh balance badhega)
    const revertAmount = tx.type === 'CREDIT' ? -tx.amount : tx.amount;

    await Customer.findByIdAndUpdate(tx.customerId, {
      $inc: { currentBalance: revertAmount },
    });

    await Transaction.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: 'Transaction deleted' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}