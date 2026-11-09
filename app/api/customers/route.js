import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Customer from '@/models/Customer';

// GET: Fetch all customers or filter by city
export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const city = searchParams.get('city');

    let query = {};
    if (city) {
      query.city = city.toUpperCase();
    }

    const customers = await Customer.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: customers });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Add new customer
export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const { name, number, city, address, currentBalance } = body;

    if (!name || !number || !city || !address) {
      return NextResponse.json({ success: false, error: 'All fields are required' }, { status: 400 });
    }

    const customer = await Customer.create({
      name,
      number,
      city: city.toUpperCase(),
      address,
      currentBalance: Number(currentBalance) || 0,
    });

    return NextResponse.json({ success: true, data: customer }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}