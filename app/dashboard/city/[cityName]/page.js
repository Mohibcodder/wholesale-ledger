'use client';
import { useState, useEffect, use } from 'react';
import Link from 'next/link';

export default function CityCustomersPage({ params }) {
  const { cityName } = use(params);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchCityCustomers() {
      try {
        const res = await fetch(`/api/customers?city=${cityName}`);
        const data = await res.json();
        if (data.success) {
          setCustomers(data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchCityCustomers();
  }, [cityName]);

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.number.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-5xl mx-auto">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/dashboard" className="text-slate-400 hover:text-emerald-400 text-sm font-semibold">
            ← Back to All Cities
          </Link>
          <span className="text-xs bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20 font-mono">
            CITY: {cityName?.toUpperCase()}
          </span>
        </div>

        <h1 className="text-3xl font-black mb-6 text-emerald-400">
          {cityName?.toUpperCase()} Customer Directory
        </h1>

        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search by customer name or number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 p-3 rounded-lg mb-6 text-white outline-none focus:border-emerald-500"
        />

        {/* Customer List */}
        {loading ? (
          <p className="text-slate-400">Loading customers...</p>
        ) : filteredCustomers.length === 0 ? (
          <p className="text-slate-400 bg-slate-800 p-6 rounded-lg text-center">
            No customers found for {cityName?.toUpperCase()}.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredCustomers.map((cust) => (
              <Link
                key={cust._id}
                href={`/dashboard/city/${cityName}/${cust._id}`}
                className="bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-emerald-500 p-5 rounded-xl transition flex justify-between items-center group"
              >
                <div>
                  <h3 className="text-lg font-bold text-slate-100 group-hover:text-emerald-400">
                    {cust.name}
                  </h3>
                  <p className="text-sm text-slate-400">📞 {cust.number} | 📍 {cust.address}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">Current Balance</p>
                  <p className="text-lg font-bold text-emerald-400">
                    Rs. {cust.currentBalance?.toLocaleString() || 0}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}