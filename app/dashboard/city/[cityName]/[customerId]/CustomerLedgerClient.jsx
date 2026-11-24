'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

function formatPhoneForWhatsApp(rawPhone = '') {
  const digits = String(rawPhone).replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('92')) return digits;
  if (digits.startsWith('0')) return `92${digits.slice(1)}`;
  return `92${digits}`;
}

function buildWhatsAppUrl({
  phone,
  customerName,
  actionLabel,
  type,
  amount,
  description,
  newBalance,
}) {
  const formattedPhone = formatPhoneForWhatsApp(phone);
  const typeLabel =
    type === 'CREDIT' ? 'Maal Dia (Credit)' : 'Payment Wasool (Cash In)';

  const text = [
    `Assalam-o-Alaikum ${customerName},`,
    `${actionLabel}:`,
    `• Type: ${typeLabel}`,
    `• Amount: Rs. ${Number(amount).toLocaleString()}`,
    description ? `• Note: ${description}` : null,
    `•Total Balance: Rs. ${Number(newBalance ?? 0).toLocaleString()}`,
  ]
    .filter(Boolean)
    .join('\n');

  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`;
}

export default function CustomerLedgerClient({ cityName, customerId }) {
  const [customer, setCustomer] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State (Add / Edit)
  const [showModal, setShowModal] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const [entryType, setEntryType] = useState('CREDIT');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // One-click WhatsApp link state
  const [lastWhatsApp, setLastWhatsApp] = useState(null);

  const fetchData = useCallback(async () => {
    if (!customerId || !cityName) {
      setLoading(false);
      return null;
    }

    try {
      setLoading(true);

      let latestCustomer = null;

      // Fetch Customer Details
      const custRes = await fetch(
        `/api/customers?city=${encodeURIComponent(cityName)}`
      );

      if (!custRes.ok) {
        throw new Error('Failed to fetch customer details');
      }

      const custData = await custRes.json();

      if (custData.success) {
        const found = custData.data.find(
          (c) => String(c._id) === String(customerId)
        );
        latestCustomer = found || null;
        setCustomer(latestCustomer);
      }

      // Fetch Transactions
      const txRes = await fetch(
        `/api/transactions?customerId=${encodeURIComponent(customerId)}`
      );

      if (!txRes.ok) {
        throw new Error('Failed to fetch transactions');
      }

      const txData = await txRes.json();

      if (txData.success) {
        setTransactions(txData.data || []);
      }

      return latestCustomer;
    } catch (err) {
      console.error('Ledger fetch error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [customerId, cityName]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openAddModal = (type) => {
    setEditingTx(null);
    setEntryType(type);
    setAmount('');
    setDescription('');
    setShowModal(true);
  };

  const openEditModal = (tx) => {
    setEditingTx(tx);
    setEntryType(tx.type);
    setAmount(tx.amount);
    setDescription(tx.description || '');
    setShowModal(true);
  };

  const handleDeleteTransaction = async (txId) => {
    const confirmed = window.confirm(
      'Kya aap is entry ko delete karna chahte hain? Customer ka balance auto-update ho jayega.'
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/transactions/${txId}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (data.success) {
        setLastWhatsApp(null);
        await fetchData();
      } else {
        alert(data.error || 'Failed to delete entry');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Something went wrong while deleting.');
    }
  };

  const handleSaveTransaction = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = editingTx
        ? `/api/transactions/${editingTx._id}`
        : '/api/transactions';
      const method = editingTx ? 'PUT' : 'POST';

      const savedAmount = Number(amount);
      const savedType = entryType;
      const savedDesc = description;
      const wasEditing = Boolean(editingTx);

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId,
          type: savedType,
          amount: savedAmount,
          description: savedDesc,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setShowModal(false);
        setEditingTx(null);
        setAmount('');
        setDescription('');

        const updatedCustomer = await fetchData();
        const targetCustomer = updatedCustomer || customer;

        if (targetCustomer?.number) {
          setLastWhatsApp({
            customerName: targetCustomer.name,
            url: buildWhatsAppUrl({
              phone: targetCustomer.number,
              customerName: targetCustomer.name,
              actionLabel: wasEditing
                ? 'Entry update ki gayi hai'
                : 'Nayi entry add hui hai',
              type: savedType,
              amount: savedAmount,
              description: savedDesc,
              newBalance: targetCustomer.currentBalance ?? 0,
            }),
          });
        }
      } else {
        alert(data.error || 'Failed to record entry');
      }
    } catch (err) {
      console.error('Transaction error:', err);
      alert('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !customer) {
    return (
      <div className="p-8 text-white bg-slate-900 min-h-screen">
        Loading Ledger...
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-8">
        <div className="max-w-5xl mx-auto">
          <p className="text-red-400 mb-4">Customer not found.</p>

          <Link
            href={`/dashboard/city/${encodeURIComponent(cityName)}`}
            className="text-emerald-400 hover:underline"
          >
            ← Back to City Directory
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-5xl mx-auto">
        <Link
          href={`/dashboard/city/${encodeURIComponent(cityName)}`}
          className="text-slate-400 hover:text-emerald-400 text-sm font-semibold mb-4 inline-block"
        >
          ← Back to {cityName.toUpperCase()} Directory
        </Link>

        {/* Customer Header Card */}
        <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-emerald-400">
              {customer.name}
            </h1>

            <p className="text-slate-300 mt-1">
              📞 {customer.number} | 📍 {customer.address}
            </p>
          </div>

          <div className="bg-slate-900 p-4 rounded-lg border border-slate-700 text-right min-w-[200px]">
            <p className="text-xs text-slate-400 uppercase font-semibold">
              Total Outstanding Balance
            </p>

            <p className="text-2xl font-black text-emerald-400">
              Rs. {customer.currentBalance?.toLocaleString() || 0}
            </p>
          </div>
        </div>

        {/* One-Click WhatsApp Share Banner */}
        {lastWhatsApp && (
          <div className="mb-6 bg-emerald-950/50 border border-emerald-500/40 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <p className="text-sm text-emerald-200">
              Ledger save ho gaya!{' '}
              <span className="font-semibold">{lastWhatsApp.customerName}</span>{' '}
              ko WhatsApp message bhejein:
            </p>
            <div className="flex items-center gap-2">
              <a
                href={lastWhatsApp.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
              >
                Send on WhatsApp
              </a>
              <button
                onClick={() => setLastWhatsApp(null)}
                className="text-xs text-slate-400 hover:text-white px-2 py-1 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => openAddModal('CREDIT')}
            className="flex-1 bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 text-red-300 font-semibold py-3 rounded-xl transition cursor-pointer"
          >
            + Maal Dia (Credit / Udhaar)
          </button>

          <button
            onClick={() => openAddModal('PAYMENT')}
            className="flex-1 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/50 text-emerald-300 font-semibold py-3 rounded-xl transition cursor-pointer"
          >
            - Payment Wasool Hui (Cash In)
          </button>
        </div>

        {/* Ledger Table */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/80 text-slate-400 text-xs uppercase border-b border-slate-700">
                  <th className="p-4">Date</th>
                  <th className="p-4">Description</th>
                  <th className="p-4 text-right">Maal Dia (Debit)</th>
                  <th className="p-4 text-right">Wasooli (Credit)</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-700 text-sm">
                {transactions.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="p-6 text-center text-slate-400"
                    >
                      No transactions recorded yet.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr key={tx._id} className="hover:bg-slate-700/60">
                      <td className="p-4 text-slate-300">
                        {new Date(tx.date).toLocaleDateString('en-PK', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>

                      <td className="p-4 text-slate-200">
                        {tx.description || '-'}
                      </td>

                      <td className="p-4 text-right font-semibold text-red-400">
                        {tx.type === 'CREDIT'
                          ? `Rs. ${Number(tx.amount).toLocaleString()}`
                          : '-'}
                      </td>

                      <td className="p-4 text-right font-semibold text-emerald-400">
                        {tx.type === 'PAYMENT'
                          ? `Rs. ${Number(tx.amount).toLocaleString()}`
                          : '-'}
                      </td>

                      <td className="p-4 text-center space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => openEditModal(tx)}
                          className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded text-xs font-semibold cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteTransaction(tx._id)}
                          className="px-2.5 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 rounded text-xs font-semibold cursor-pointer"
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
        </div>

        {/* Add / Edit Entry Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-md p-6 shadow-2xl">
              <h3 className="text-xl font-bold mb-4 text-emerald-400">
                {editingTx
                  ? entryType === 'CREDIT'
                    ? 'Edit Credit (Maal Dia)'
                    : 'Edit Payment (Wasooli)'
                  : entryType === 'CREDIT'
                  ? 'Add Credit (Maal Dia)'
                  : 'Record Payment (Wasooli)'}
              </h3>

              <form onSubmit={handleSaveTransaction} className="space-y-4">
                <div>
                  <label className="block text-sm mb-1 text-slate-300">
                    Entry Type
                  </label>
                  <select
                    value={entryType}
                    onChange={(e) => setEntryType(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2.5 text-white outline-none focus:border-emerald-500"
                  >
                    <option value="CREDIT">Maal Dia (Credit / Udhaar)</option>
                    <option value="PAYMENT">Payment Wasool Hui (Cash In)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm mb-1 text-slate-300">
                    Amount (Rs.)
                  </label>

                  <input
                    type="number"
                    min="1"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2.5 text-white outline-none focus:border-emerald-500"
                    placeholder="e.g. 50000"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1 text-slate-300">
                    Details / Bill Note
                  </label>

                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2.5 text-white outline-none focus:border-emerald-500"
                    placeholder="e.g. Tiles Invoice #402 ya Weekly Cash"
                  />
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingTx(null);
                    }}
                    className="px-4 py-2 bg-slate-700 rounded text-slate-200 cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 font-semibold rounded text-white cursor-pointer"
                  >
                    {submitting
                      ? 'Saving...'
                      : editingTx
                      ? 'Update Entry'
                      : 'Save Entry'}
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