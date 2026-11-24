import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/dbConnect';
import Customer from '../../../../models/Customer';
import Transaction from '../../../../models/Transaction';

// PUT: Edit Customer details
export async function PUT(req, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await req.json();

    const updatedCustomer = await Customer.findByIdAndUpdate(
      id,
      {
        name: body.name,
        number: body.number,
        city: body.city,
        address: body.address,
        currentBalance: Number(body.currentBalance) || 0,
      },
      { new: true }
    );

    if (!updatedCustomer) {
      return NextResponse.json({ success: false, error: 'Customer not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedCustomer });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE: Delete Customer & their transactions
export async function DELETE(req, { params }) {
  try {
    await dbConnect();
    const { id } = await params;

    const deletedCustomer = await Customer.findByIdAndDelete(id);
    if (!deletedCustomer) {
      return NextResponse.json({ success: false, error: 'Customer not found' }, { status: 404 });
    }

    await Transaction.deleteMany({ customerId: id });

    return NextResponse.json({ success: true, message: 'Customer deleted' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}