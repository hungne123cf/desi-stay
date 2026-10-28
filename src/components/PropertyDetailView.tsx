'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useProperties } from '@/context/PropertyContext';
import { BookingModal } from '@/components/BookingModal';
import {
  MapPin,
  GraduationCap,
  ShieldCheck,
  Star,
  CheckCircle2,
  Clock,
  Phone,
  ArrowLeft,
  Share2,
  Lock
} from 'lucide-react';

interface PropertyDetailViewProps {
  propertyId: string;
}

export const PropertyDetailView: React.FC<PropertyDetailViewProps> = ({ propertyId }) => {
  const { properties, formatPrice } = useProperties();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const property = properties.find((p) => p.id === propertyId);

  if (!property) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Property Not Found</h2>
        <p className="text-sm text-slate-500 mt-2 mb-6">
          The accommodation you are looking for is either occupied or has been removed.
        </p>
        <Link
          href="/"
          className="px-6 py-2.5 bg-orange-600 text-white font-bold text-sm rounded-xl"
        >
          Back to Listings
        </Link>
      </div>
    );
  }

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleWhatsAppContact = () => {
    const phone = property.landlord.phoneWhatsApp.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `Hello! I am viewing "${property.title}" (Code: ${property.code}) on YuvaStays. I'd like to ask a few questions about the room and food mess.`
    );
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20">
      {/* Top Breadcrumb & Share */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between text-xs text-slate-500">
        <Link
          href="/"
          className="flex items-center gap-1 font-semibold text-slate-700 hover:text-orange-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to all PGs</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{isCopied ? 'Link Copied!' : 'Share'}</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Photo Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 rounded-3xl overflow-hidden mb-8 border border-slate-200 bg-white p-2">
          {/* Main Large Image */}
          <div className="md:col-span-2 aspect-[16/10] relative overflow-hidden rounded-2xl bg-slate-100">
            <img
              src={property.images[activeImageIndex] || property.images[0]}
              alt={property.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 flex gap-2">
              <span className="px-3 py-1 rounded-md text-xs font-bold bg-orange-600 text-white shadow-md">
                ₹0 Brokerage
              </span>
              {property.isVerified && (
                <span className="px-3 py-1 rounded-md text-xs font-bold bg-emerald-600 text-white shadow-md flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified Listing
                </span>
              )}
            </div>
          </div>

          {/* Side Thumbnail List */}
          <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto">
            {property.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`relative aspect-[16/10] md:h-1/3 rounded-xl overflow-hidden border-2 transition-all shrink-0 w-28 md:w-full ${
                  activeImageIndex === idx ? 'border-orange-500 ring-2 ring-orange-500/20' : 'border-transparent opacity-80 hover:opacity-100'
                }`}
              >
                <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Two-Column Details Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Property Information */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title & Badges */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-mono">
                  Code: {property.code}
                </span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-orange-100 text-orange-800 uppercase">
                  {property.roomType} Sharing
                </span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 capitalize">
                  {property.foodType.replace('_', ' ')}
                </span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-800 capitalize">
                  {property.gender === 'all' ? 'Co-Ed Residency' : `${property.gender} Only`}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {property.title}
              </h1>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs text-slate-600">
                <div className="flex items-center gap-1.5 font-medium text-slate-700">
                  <MapPin className="w-4 h-4 text-orange-600 shrink-0" />
                  <span>{property.address}, {property.area}, {property.city}</span>
                </div>
                <div className="flex items-center gap-1 text-slate-800 font-bold bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{property.rating} / 5.0</span>
                  <span className="text-slate-400 font-normal">({property.reviewsCount} student reviews)</span>
                </div>
              </div>

              {/* Campus Proximity Banner */}
              <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200/80 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-indigo-900 font-bold">Campus Proximity:</p>
                  <p className="text-xs text-indigo-700">
                    Just <strong>{property.distanceToCampus}</strong> from <strong>{property.nearbyUniversity}</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Description & Key Highlights */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">About this Student PG</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{property.description}</p>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
                  Key Highlights
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {property.highlights.map((h, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs sm:text-sm text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Amenities Grid */}
              <div>
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
                  Included Amenities &amp; Facilities
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {property.amenities.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 flex items-center gap-2 shadow-xs"
                    >
                      <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Curfew & Safety */}
              {property.curfewTime && (
                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 flex items-center gap-3">
                  <Clock className="w-5 h-5 text-amber-700 shrink-0" />
                  <div className="text-xs text-amber-900">
                    <span className="font-bold">Entry &amp; Curfew Policy: </span>
                    <span>{property.curfewTime}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Landlord / Warden Profile */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 text-white font-bold text-lg flex items-center justify-center shadow-md">
                  {property.landlord.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{property.landlord.name}</h4>
                  <p className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {property.landlord.badge}
                  </p>
                </div>
              </div>

              <button
                onClick={handleWhatsAppContact}
                className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors"
              >
                <Phone className="w-4 h-4 text-emerald-600" />
                <span>Chat on WhatsApp</span>
              </button>
            </div>
          </div>

          {/* Right Column: Pricing & Booking Card (Sticky) */}
          <div className="space-y-6">
            <div className="sticky top-24 bg-white p-6 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/60 space-y-5">
              <div>
                <span className="text-xs text-slate-400 font-semibold block">Monthly Rent</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-3xl font-black text-slate-900">
                    {formatPrice(property.pricePerMonthINR)}
                  </span>
                  <span className="text-xs text-slate-500 font-normal">/ month (all bills incl.)</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Monthly Maintenance &amp; WiFi</span>
                  <span className="font-bold text-emerald-600">FREE (Included)</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Brokerage Fee</span>
                  <span className="font-bold text-emerald-600">₹0 (Zero Brokerage)</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Refundable Security Deposit</span>
                  <span className="font-bold text-slate-800">{formatPrice(property.securityDepositINR)}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-900 block">Holding Token Deposit</span>
                    <span className="text-[10px] text-slate-400">Holds your bed for 48 hrs</span>
                  </div>
                  <span className="text-base font-black text-orange-600">
                    {formatPrice(property.tokenDepositINR)}
                  </span>
                </div>
              </div>

              <div className="space-y-2.5 pt-2">
                <button
                  onClick={() => setIsBookingOpen(true)}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>Reserve Bed with Token ({formatPrice(property.tokenDepositINR)})</span>
                </button>

                <button
                  onClick={handleWhatsAppContact}
                  className="w-full py-3 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4 text-emerald-600" />
                  <span>Schedule In-Person Campus Visit</span>
                </button>
              </div>

              <div className="pt-2 text-center">
                <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>100% Refund Guarantee if room differs from images</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <BookingModal
        property={isBookingOpen ? property : null}
        onClose={() => setIsBookingOpen(false)}
      />
    </div>
  );
};
