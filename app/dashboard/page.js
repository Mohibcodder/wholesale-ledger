'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

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
  'Kamoke',
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
  'Other',
];

export default function DashboardPage() {
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    number: '',
    city: 'Lahore',
    address: '',
    currentBalance: 0,
  });

  const fetchCustomers = async () => {
    try {
      setLoading(true);
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

  const openAddModal = () => {
    setEditingCustomer(null);
    setFormData({ name: '', number: '', city: 'Lahore', address: '', currentBalance: 0 });
    setShowModal(true);
  };

  const openEditModal = (cust) => {
    setEditingCustomer(cust);
    setFormData({
      name: cust.name,
      number: cust.number,
      city: cust.city,
      address: cust.address,
      currentBalance: cust.currentBalance || 0,
    });
    setShowModal(true);
  };

  const handleDeleteCustomer = async (custId, custName) => {
    const confirmDelete = confirm(
      `Kya aap waqai "${custName}" aur uski tamam ledger entries delete karna chahte hain?`
    );
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/customers/${custId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        fetchCustomers();
      } else {
        alert(data.error || 'Failed to delete customer');
      }
    } catch (err) {
      alert('Error deleting customer');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = editingCustomer ? `/api/customers/${editingCustomer._id}` : '/api/customers';
      const method = editingCustomer ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        setEditingCustomer(null);
        setFormData({ name: '', number: '', city: 'Lahore', address: '', currentBalance: 0 });
        fetchCustomers();
      } else {
        alert(data.error || 'Failed to save customer');
      }
    } catch (err) {
      alert('Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const activeCities = Array.from(new Set(customers.map((c) => c.city?.toUpperCase()))).filter(Boolean);

  const getCityCount = (cityName) =>
    customers.filter((c) => c.city?.toUpperCase() === cityName).length;

  const getCityTotalBalance = (cityName) =>
    customers
      .filter((c) => c.city?.toUpperCase() === cityName)
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
            onClick={openAddModal}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-lg font-semibold shadow-lg transition cursor-pointer"
          >
            + Add Customer
          </button>
        </div>

        {/* City Name List Section */}
        <h2 className="text-xl font-bold mb-4 text-slate-200">City Name List</h2>

        {loading ? (
          <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 text-center mb-10">
            <p className="text-emerald-400 font-semibold animate-pulse">Loading City Name List...</p>
          </div>
        ) : activeCities.length === 0 ? (
          <p className="text-slate-400 bg-slate-800 p-6 rounded-xl border border-slate-700 text-center mb-10">
            Abhi tak koi customer add nahi hua. &quot;+ Add Customer&quot; par click karein.
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

        {/* Customers Management Table (Edit / Delete) */}
        <h2 className="text-xl font-bold mb-4 text-slate-200">All Customers</h2>
        {loading ? (
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 text-center">
            <p className="text-slate-400">Loading customers...</p>
          </div>
        ) : (
          <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-x-auto shadow-lg">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/80 text-slate-400 text-xs uppercase border-b border-slate-700">
                  <th className="p-4">Name</th>
                  <th className="p-4">City</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4 text-right">Balance</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700 text-sm">
                {customers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-6 text-center text-slate-400">
                      No customers found.
                    </td>
                  </tr>
                ) : (
                  customers.map((cust) => (
                    <tr key={cust._id} className="hover:bg-slate-750">
                      <td className="p-4 font-semibold text-slate-100">
                        <Link
                          href={`/dashboard/city/${cust.city?.toUpperCase()}/${cust._id}`}
                          className="hover:text-emerald-400"
                        >
                          {cust.name}
                        </Link>
                      </td>
                      <td className="p-4 text-slate-300">{cust.city}</td>
                      <td className="p-4 text-slate-300">{cust.number}</td>
                      <td className="p-4 text-right font-bold text-emerald-400">
                        Rs. {(cust.currentBalance || 0).toLocaleString()}
                      </td>
                      <td className="p-4 text-center space-x-2">
                        <button
                          onClick={() => openEditModal(cust)}
                          className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded text-xs font-semibold cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCustomer(cust._id, cust.name)}
                          className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 rounded text-xs font-semibold cursor-pointer"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Add / Edit Customer Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-lg p-6 shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-emerald-400">
                  {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 hover:text-white text-xl cursor-pointer"
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
                  <label className="block text-sm mb-1 text-slate-300">Current Balance (Rs.)</label>
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
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-slate-200 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 font-semibold rounded text-white cursor-pointer"
                  >
                    {submitting ? 'Saving...' : editingCustomer ? 'Update Customer' : 'Save Customer'}
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