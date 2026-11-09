import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function POST(req) {
  try {
    const { password } = await req.json();

    if (password === process.env.DASHBOARD_PASSWORD) {
      const token = jwt.sign({ auth: true }, process.env.JWT_SECRET || 'secret_key', { expiresIn: '7d' });
      
      const response = NextResponse.json({ success: true, message: 'Logged in successfully' });
      response.cookies.set('auth_token', token, {
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });

      return response;
    }

    return NextResponse.json({ success: false, message: 'Invalid Password' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}