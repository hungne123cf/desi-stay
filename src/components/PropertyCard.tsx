'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Property } from '@/types';
import { useProperties } from '@/context/PropertyContext';
import {
  MapPin,
  GraduationCap,
  ShieldCheck,
  Star,
  CheckCircle2,
  Utensils,
  Wifi,
  Sparkles,
  ArrowRight,
  Phone
} from 'lucide-react';

interface PropertyCardProps {
  property: Property;
  onBookNow: (property: Property) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, onBookNow }) => {
  const { formatPrice } = useProperties();
  const [activeImgIndex, setActiveImgIndex] = useState(0);

  const getFoodBadge = () => {
    switch (property.foodType) {
      case 'pure_veg':
        return { label: 'Pure Veg Mess', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'jain_available':
        return { label: 'Jain Food Available', bg: 'bg-teal-50 text-teal-700 border-teal-200' };
      case 'self_cook':
        return { label: 'Self Cooking Kitchen', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
      default:
        return { label: 'Veg & Non-Veg', bg: 'bg-slate-50 text-slate-700 border-slate-200' };
    }
  };

  const getGenderBadge = () => {
    switch (property.gender) {
      case 'boys':
        return { label: '👦 Boys Only', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'girls':
        return { label: '👧 Girls Only', bg: 'bg-pink-50 text-pink-700 border-pink-200' };
      default:
        return { label: '🏢 Co-Ed Residency', bg: 'bg-purple-50 text-purple-700 border-purple-200' };
    }
  };

  const foodBadge = getFoodBadge();
  const genderBadge = getGenderBadge();

  // WhatsApp click handler
  const handleWhatsAppChat = (e: React.MouseEvent) => {
    e.stopPropagation();
    const phone = property.landlord.phoneWhatsApp.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `Hello! I found "${property.title}" (Code: ${property.code}) on YuvaStays. Is a ${property.roomType} room currently available for move-in?`
    );
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-orange-200 transition-all duration-300 flex flex-col">
      {/* Image Preview & Carousel Thumbnails */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        <img
          src={property.images[activeImgIndex] || property.images[0]}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Floating Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          {property.isZeroBrokerage && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-orange-600 text-white shadow-sm">
              ₹0 Brokerage
            </span>
          )}
          {property.isVerified && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-600 text-white shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified
            </span>
          )}
        </div>

        {/* Rating chip */}
        <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-lg shadow-md flex items-center gap-1 text-xs font-bold text-slate-800">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>{property.rating}</span>
          <span className="text-slate-400 font-normal">({property.reviewsCount})</span>
        </div>

        {/* Multiple image dots if more than 1 image */}
        {property.images.length > 1 && (
          <div className="absolute bottom-3 left-3 flex gap-1 z-10">
            {property.images.slice(0, 4).map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImgIndex(idx);
                }}
                className={`w-2 h-2 rounded-full transition-all ${
                  activeImgIndex === idx ? 'bg-white w-4' : 'bg-white/60 hover:bg-white'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Chips row */}
        <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${genderBadge.bg}`}>
            {genderBadge.label}
          </span>
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${foodBadge.bg}`}>
            {foodBadge.label}
          </span>
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 uppercase tracking-wider">
            {property.roomType} Sharing
          </span>
        </div>

        {/* Title & Code */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <Link
            href={`/properties/${property.id}`}
            className="text-base font-bold text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-1"
          >
            {property.title}
          </Link>
          <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
            {property.code}
          </span>
        </div>

        {/* Distance to University */}
        <div className="flex items-center gap-1.5 text-xs text-indigo-700 font-semibold mb-2 bg-indigo-50/70 px-2.5 py-1 rounded-lg">
          <GraduationCap className="w-4 h-4 text-indigo-600 shrink-0" />
          <span className="truncate">{property.distanceToCampus} to {property.nearbyUniversity}</span>
        </div>

        {/* Area & City */}
        <div className="flex items-center gap-1 text-xs text-slate-500 mb-3">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{property.area}, {property.city}</span>
        </div>

        {/* Quick Highlights */}
        <div className="space-y-1 mb-4 text-xs text-slate-600 flex-1">
          {property.highlights.slice(0, 2).map((h, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="line-clamp-1">{h}</span>
            </div>
          ))}
        </div>

        {/* Price & Action Buttons */}
        <div className="pt-3 border-t border-slate-100 mt-auto">
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <span className="text-xl font-black text-slate-900">
                {formatPrice(property.pricePerMonthINR)}
              </span>
              <span className="text-xs text-slate-500 font-normal"> / month</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">Token Deposit:</span>
              <span className="text-xs font-bold text-orange-600">
                {formatPrice(property.tokenDepositINR)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* WhatsApp Direct Chat */}
            <button
              onClick={handleWhatsAppChat}
              className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              <span>WhatsApp</span>
            </button>

            {/* Book / View Details */}
            <button
              onClick={() => onBookNow(property)}
              className="flex items-center justify-center gap-1 py-2 px-3 text-xs font-bold text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 rounded-xl shadow-sm transition-all"
            >
              <span>Book Token</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
