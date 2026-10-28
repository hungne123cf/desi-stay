'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useProperties } from '@/context/PropertyContext';
import { Property, RoomType, FoodType, GenderPreference } from '@/types';
import {
  ShieldCheck,
  Building,
  Plus,
  Trash2,
  Phone,
  CheckCircle,
  Clock,
  DollarSign,
  Users,
  Search,
  Settings,
  Layers,
  ArrowUpRight,
  Sparkles,
  Lock,
  X
} from 'lucide-react';

export default function AdminPage() {
  const { user, switchRole } = useAuth();
  const {
    properties,
    bookings,
    formatPrice,
    addProperty,
    deleteProperty,
    updateBookingStatus
  } = useProperties();

  const [activeTab, setActiveTab] = useState<'listings' | 'leads' | 'settings'>('listings');
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Settings form state
  const [razorpayKey, setRazorpayKey] = useState('rzp_test_98as7d6fa5sdf');
  const [whatsappNumber, setWhatsappNumber] = useState('+91 98765 43210');
  const [defaultTokenINR, setDefaultTokenINR] = useState(2000);

  // Add Property Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCity, setNewCity] = useState('Bengaluru');
  const [newArea, setNewArea] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newUniversity, setNewUniversity] = useState('Christ University (Central Campus)');
  const [newDistance, setNewDistance] = useState('400m (5 mins walk)');
  const [newRoomType, setNewRoomType] = useState<RoomType>('double');
  const [newGender, setNewGender] = useState<GenderPreference>('boys');
  const [newFoodType, setNewFoodType] = useState<FoodType>('pure_veg');
  const [newPriceINR, setNewPriceINR] = useState(12000);
  const [newDepositINR, setNewDepositINR] = useState(15000);
  const [newTokenINR, setNewTokenINR] = useState(2000);
  const [newImageUrl, setNewImageUrl] = useState(
    'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80'
  );
  const [newDescription, setNewDescription] = useState('');

  // Total Token Revenue calculation
  const totalRevenueINR = bookings
    .filter((b) => b.paymentStatus === 'token_paid' || b.paymentStatus === 'confirmed')
    .reduce((sum, b) => sum + b.tokenPaidINR, 0);

  const handleCreateProperty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    addProperty({
      title: newTitle,
      slug: newTitle.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      address: newAddress || `${newArea}, ${newCity}`,
      city: newCity,
      area: newArea || 'Campus Area',
      nearbyUniversity: newUniversity,
      distanceToCampus: newDistance,
      roomType: newRoomType,
      gender: newGender,
      foodType: newFoodType,
      pricePerMonthINR: Number(newPriceINR),
      securityDepositINR: Number(newDepositINR),
      tokenDepositINR: Number(newTokenINR),
      images: [newImageUrl],
      description: newDescription || 'Fully furnished modern student PG with high speed WiFi and hygienic meals.',
      highlights: [
        'Zero Brokerage Direct Landlord',
        `Near ${newUniversity}`,
        'High Speed WiFi & Housekeeping'
      ],
      amenities: [
        'High-Speed WiFi',
        'Air Conditioner',
        'Attached Bathroom',
        'Study Table & Chair',
        'Power Backup'
      ],
      curfewTime: '10:30 PM',
      isVerified: true,
      isZeroBrokerage: true,
      availableRooms: 3,
      landlord: {
        name: user?.name || 'Verified Landlord',
        phoneWhatsApp: whatsappNumber,
        badge: 'Owner Certified'
      }
    });

    setShowAddModal(false);
    // Reset form
    setNewTitle('');
    setNewArea('');
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2500);
  };

  // If user is currently in student mode, offer quick switch
  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white max-w-md w-full p-8 rounded-3xl border border-slate-200 shadow-xl text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Admin Mode Required</h3>
            <p className="text-xs text-slate-500 mt-1">
              You are currently viewing the website in <strong>Student Mode</strong> ({user?.name || 'Guest'}).
              Switch to <strong>Admin Mode</strong> to manage properties and view student leads.
            </p>
          </div>
          <button
            onClick={() => switchRole('admin')}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md transition-all"
          >
            Switch to Admin Role Now
          </button>
          <div>
            <Link href="/" className="text-xs text-slate-400 hover:text-slate-600">
              Return to Student View
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20">
      {/* Top Banner Header */}
      <div className="bg-slate-900 text-white pt-8 pb-14 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-orange-400 font-bold uppercase tracking-wider mb-1">
                <ShieldCheck className="w-4 h-4 text-orange-400" />
                <span>Housing Management Portal</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                Welcome back, {user?.name.split(' ')[0]} 👋
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Oversee listings, monitor student token deposits, and manage lead conversations.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition-transform active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Listing</span>
              </button>
              <Link
                href="/"
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
              >
                View Live Site
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards (Negative margin for overlapping effect) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 block">Total Active PGs</span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              {properties.length}
            </div>
            <span className="text-[11px] text-emerald-600 font-semibold">100% Zero Brokerage</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 block">Student Inquiries / Leads</span>
            <div className="text-2xl sm:text-3xl font-black text-indigo-600 mt-1">
              {bookings.length}
            </div>
            <span className="text-[11px] text-slate-400">From WhatsApp &amp; Web</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 block">Token Deposits Collected</span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">
              {formatPrice(totalRevenueINR)}
            </div>
            <span className="text-[11px] text-emerald-700 font-semibold">Via Razorpay / UPI</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 block">Lead Conversion Rate</span>
            <div className="text-2xl sm:text-3xl font-black text-orange-600 mt-1">
              74.2%
            </div>
            <span className="text-[11px] text-orange-700 font-semibold">High student intent</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex border-b border-slate-200 gap-6 text-sm font-bold">
          <button
            onClick={() => setActiveTab('listings')}
            className={`pb-3.5 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'listings'
                ? 'border-orange-600 text-orange-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Manage Properties ({properties.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('leads')}
            className={`pb-3.5 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'leads'
                ? 'border-orange-600 text-orange-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Student Bookings &amp; Leads ({bookings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-3.5 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'settings'
                ? 'border-orange-600 text-orange-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Payment &amp; WhatsApp Settings</span>
          </button>
        </div>

        {/* Tab 1: Properties List */}
        {activeTab === 'listings' && (
          <div className="mt-6 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-4">Property</th>
                      <th className="p-4">City / Area</th>
                      <th className="p-4">Nearby Campus</th>
                      <th className="p-4">Sharing</th>
                      <th className="p-4">Food</th>
                      <th className="p-4">Rent</th>
                      <th className="p-4">Token</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {properties.map((prop) => (
                      <tr key={prop.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-4 flex items-center gap-3">
                          <img
                            src={prop.images[0]}
                            alt=""
                            className="w-12 h-10 object-cover rounded-lg shrink-0"
                          />
                          <div>
                            <span className="font-bold text-slate-900 block truncate max-w-[200px]">
                              {prop.title}
                            </span>
                            <span className="font-mono text-[10px] text-slate-400">
                              {prop.code}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-slate-600 font-medium">{prop.city}</td>
                        <td className="p-4 text-indigo-700 font-medium truncate max-w-[160px]">
                          {prop.nearbyUniversity}
                        </td>
                        <td className="p-4 capitalize">{prop.roomType}</td>
                        <td className="p-4 capitalize">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              prop.foodType === 'pure_veg'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {prop.foodType.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-4 font-bold text-slate-900">
                          {formatPrice(prop.pricePerMonthINR)}
                        </td>
                        <td className="p-4 font-bold text-orange-600">
                          {formatPrice(prop.tokenDepositINR)}
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => deleteProperty(prop.id)}
                            title="Delete Listing"
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Bookings & Leads */}
        {activeTab === 'leads' && (
          <div className="mt-6 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-4">Student Name</th>
                      <th className="p-4">College / Uni</th>
                      <th className="p-4">Property</th>
                      <th className="p-4">Move-in</th>
                      <th className="p-4">Token Paid</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Contact</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {bookings.map((lead) => (
                      <tr key={lead.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-4">
                          <span className="font-bold text-slate-900 block">{lead.studentName}</span>
                          <span className="text-[10px] text-slate-400">{lead.studentEmail}</span>
                        </td>
                        <td className="p-4 text-slate-700 font-medium">{lead.universityOrCollege}</td>
                        <td className="p-4">
                          <span className="font-bold text-slate-800">{lead.propertyCode}</span>
                        </td>
                        <td className="p-4 text-slate-600 font-medium">{lead.moveInDate}</td>
                        <td className="p-4 font-bold text-emerald-700">
                          {formatPrice(lead.tokenPaidINR)}
                        </td>
                        <td className="p-4">
                          <select
                            value={lead.paymentStatus}
                            onChange={(e) =>
                              updateBookingStatus(
                                lead.id,
                                e.target.value as 'pending' | 'token_paid' | 'confirmed' | 'cancelled'
                              )
                            }
                            className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none"
                          >
                            <option value="token_paid">Paid Token</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="pending">Pending</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="p-4 text-right">
                          <a
                            href={`https://wa.me/${lead.studentWhatsApp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                              `Hello ${lead.studentName}, this is regarding your room booking (${lead.propertyCode}) on YuvaStays.`
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-lg border border-emerald-200 hover:bg-emerald-100"
                          >
                            <Phone className="w-3 h-3 text-emerald-600" />
                            <span>WhatsApp</span>
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Settings */}
        {activeTab === 'settings' && (
          <div className="mt-6 max-w-2xl bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Payment &amp; Gateway Configuration</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure your Razorpay UPI keys and WhatsApp business alerts.
              </p>
            </div>

            {settingsSaved && (
              <div className="p-3 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Settings successfully saved!</span>
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Razorpay Key ID (For Indian UPI &amp; Cards)
                </label>
                <input
                  type="text"
                  value={razorpayKey}
                  onChange={(e) => setRazorpayKey(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Find this in your Razorpay Dashboard &gt; Settings &gt; API Keys
                </span>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Owner WhatsApp Number (Receives booking notices)
                </label>
                <input
                  type="text"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Default Token Deposit Amount (INR ₹)
                </label>
                <input
                  type="number"
                  value={defaultTokenINR}
                  onChange={(e) => setDefaultTokenINR(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-sm transition-all"
              >
                Save Settings
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Add Property Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <h3 className="text-base font-bold">List a New Student PG / Accommodation</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProperty} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Property Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Oxford Student PG"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">City *</label>
                  <select
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Bengaluru">Bengaluru</option>
                    <option value="Pune">Pune</option>
                    <option value="Delhi NCR">Delhi NCR</option>
                    <option value="Kota">Kota</option>
                    <option value="Can Tho / Vietnam Hub">Can Tho / Vietnam Hub</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Area / Locality</label>
                  <input
                    type="text"
                    placeholder="e.g. Koramangala 4th Block"
                    value={newArea}
                    onChange={(e) => setNewArea(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nearby University</label>
                  <input
                    type="text"
                    value={newUniversity}
                    onChange={(e) => setNewUniversity(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Distance (Walk time)</label>
                  <input
                    type="text"
                    value={newDistance}
                    onChange={(e) => setNewDistance(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Sharing Type</label>
                  <select
                    value={newRoomType}
                    onChange={(e) => setNewRoomType(e.target.value as RoomType)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="single">Single</option>
                    <option value="double">Twin Sharing</option>
                    <option value="triple">Triple</option>
                    <option value="studio">Studio</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Gender</label>
                  <select
                    value={newGender}
                    onChange={(e) => setNewGender(e.target.value as GenderPreference)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="boys">Boys Only</option>
                    <option value="girls">Girls Only</option>
                    <option value="all">Co-Ed</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Food / Mess</label>
                  <select
                    value={newFoodType}
                    onChange={(e) => setNewFoodType(e.target.value as FoodType)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="pure_veg">Pure Veg Mess</option>
                    <option value="jain_available">Jain Food Available</option>
                    <option value="non_veg">Veg & Non-Veg</option>
                    <option value="self_cook">Self Cook Kitchen</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Monthly Rent (₹)</label>
                  <input
                    type="number"
                    value={newPriceINR}
                    onChange={(e) => setNewPriceINR(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Security Deposit (₹)</label>
                  <input
                    type="number"
                    value={newDepositINR}
                    onChange={(e) => setNewDepositINR(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Holding Token (₹)</label>
                  <input
                    type="number"
                    value={newTokenINR}
                    onChange={(e) => setNewTokenINR(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Image URL</label>
                <input
                  type="text"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Describe the rooms, food menu, and surroundings..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-md"
                >
                  Publish Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
