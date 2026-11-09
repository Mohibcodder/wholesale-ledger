'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

// Pakistan ki major cities ki standard list taake spelling uniform rahe
const PAKISTAN_CITIES = [
  'Lahore',
  'Karachi',
  'Faisalabad',
  'Rawalpindi',
  'Multan',
  'Gujranwala',
  'Peshawar',
  'Quetta',
  'Islamabad',
  'Sialkot',
  'Bahawalpur',
  'Sargodha',
  'Sukkur',
  'Larkana',
  'Sheikhupura',
  'Rahim Yar Khan',
  'Jhang',
  'Dera Ghazi Khan',
  'Gujrat',
  'Sahiwal',
  'Wah Cantonment',
  'Mardan',
  'Kasur',
  'Okara',
  'Mingora',
  'Nawabshah',
  'Chiniot',
  'Kotri',
  'Kāmoke',
  'Hafizabad',
  'Sadiqabad',
  'Mirpur Khas',
  'Burewala',
  'Kohat',
  'Khanewal',
  'Dera Ismail Khan',
  'Turbat',
  'Muzaffargarh',
  'Abbottabad',
  'Mandi Bahauddin',
  'Shikarpur',
  'Jacobabad',
  'Jhelum',
  'Khanpur',
  'Khairpur',
  'Daska',
  'Gojra',
  'Muridke',
  'Bahawalnagar',
  'Samundri',
  'Tando Adam',
  'Jaranwala',
  'Chishtian',
  'Attock',
  'Vehari',
  'Kot Adu',
  'Chakwal',
  'Chichawatni',
  'Mastung',
  'Other'
];

export default function DashboardPage() {
  const [showModal, setShowModal] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    number: '',
    city: 'Lahore', // Default first city
    address: '',
    currentBalance: 0,
  });

  const fetchCustomers = async () => {
    try {
      const res = await fetch('/api/customers');
      const data = await res.json();
      if (data.success) setCustomers(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    if (data.success) {
      setShowModal(false);
      setFormData({ name: '', number: '', city: 'Lahore', address: '', currentBalance: 0 });
      fetchCustomers();
    } else {
      alert(data.error || 'Failed to add customer');
    }
  };

  // Unique cities jinke database mein customers mojood hain
  const activeCities = Array.from(new Set(customers.map((c) => c.city))).filter(Boolean);

  const getCityCount = (cityName) => customers.filter((c) => c.city === cityName).length;
  const getCityTotalBalance = (cityName) =>
    customers
      .filter((c) => c.city === cityName)
      .reduce((sum, c) => sum + (c.currentBalance || 0), 0);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Top Header */}
        <div className="flex justify-between items-center mb-8 bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-md">
          <div>
            <h1 className="text-2xl font-bold text-emerald-400">Wholesale Ledger Dashboard</h1>
            <p className="text-slate-400 text-sm">Manage city ledgers and customer accounts</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-lg font-semibold shadow-lg transition"
          >
            + Add Customer
          </button>
        </div>

        {/* City Wise Section */}
        <h2 className="text-xl font-bold mb-4 text-slate-200">City Name List</h2>
        {activeCities.length === 0 ? (
          <p className="text-slate-400 bg-slate-800 p-6 rounded-xl border border-slate-700 text-center">
            Abhi tak koi customer add nahi hua. "+ Add Customer" par click karein.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {activeCities.map((cityName) => (
              <Link
                key={cityName}
                href={`/dashboard/city/${cityName}`}
                className="bg-slate-800 hover:bg-slate-750 p-6 rounded-xl border border-slate-700 transition hover:border-emerald-500 block shadow-md group"
              >
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xl font-black text-emerald-400 group-hover:scale-105 transition transform">
                    {cityName}
                  </span>
                  <span className="text-xs bg-slate-700 text-slate-300 px-3 py-1 rounded-full">
                    {getCityCount(cityName)} Customers
                  </span>
                </div>
                <p className="text-sm text-slate-400">Total Credit Outstanding:</p>
                <p className="text-xl font-bold text-emerald-300 mt-1">
                  Rs. {getCityTotalBalance(cityName).toLocaleString()}
                </p>
              </Link>
            ))}
          </div>
        )}

        {/* Add Customer Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-lg p-6 shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-emerald-400">Add New Customer</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 hover:text-white text-xl"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm mb-1 text-slate-300">Customer Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2.5 text-white focus:border-emerald-500 outline-none"
                    placeholder="e.g. Ali Traders"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1 text-slate-300">Phone Number</label>
                    <input
                      type="text"
                      required
                      value={formData.number}
                      onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2.5 text-white focus:border-emerald-500 outline-none"
                      placeholder="0300-1234567"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1 text-slate-300">Select City</label>
                    <select
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2.5 text-white focus:border-emerald-500 outline-none"
                    >
                      {PAKISTAN_CITIES.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm mb-1 text-slate-300">Address</label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2.5 text-white focus:border-emerald-500 outline-none"
                    placeholder="Shop #, Market, Road..."
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1 text-slate-300">Opening Balance (Rs.)</label>
                  <input
                    type="number"
                    value={formData.currentBalance}
                    onChange={(e) => setFormData({ ...formData, currentBalance: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2.5 text-white focus:border-emerald-500 outline-none"
                    placeholder="0"
                  />
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 font-semibold rounded text-white"
                  >
                    Save Customer
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}