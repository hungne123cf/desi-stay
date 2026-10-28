'use client';

import React from 'react';
import { Search, MapPin, GraduationCap, Utensils, Users, Shield, Sparkles } from 'lucide-react';
import { CITIES, UNIVERSITIES } from '@/data/mockProperties';
import { FilterOptions } from '@/types';

interface HeroSectionProps {
  filters: FilterOptions;
  setFilters: React.Dispatch<React.SetStateAction<FilterOptions>>;
  onSearch: () => void;
  totalListingsCount: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  filters,
  setFilters,
  onSearch,
  totalListingsCount
}) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-orange-50/60 via-amber-50/30 to-white pt-10 pb-16 lg:pt-16 lg:pb-24 border-b border-slate-100">
      {/* Decorative background glow circles */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-orange-200/40 via-amber-100/30 to-indigo-100/30 blur-3xl -z-10 rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top pill badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-100 border border-orange-200 text-orange-900 text-xs sm:text-sm font-semibold shadow-sm">
            <Sparkles className="w-4 h-4 text-orange-600" />
            <span>Zero Brokerage • 100% Verified PGs & Hostels for Indian Students</span>
          </div>
        </div>

        {/* Main headline */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
            Live Near Your Campus.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-600 to-indigo-600">
              Eat Pure Veg.
            </span>{' '}
            Study in Peace.
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
            Finding safe, verified student accommodation near top universities in India & abroad. With authentic Indian mess, biometric safety, high-speed WiFi, and 24/7 student warden support.
          </p>
        </div>

        {/* Search Engine Container */}
        <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl shadow-slate-200/80 border border-slate-200/80 p-4 sm:p-6 transition-all hover:shadow-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* City Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-orange-600" />
                City / Region
              </label>
              <select
                value={filters.city}
                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                className="w-full h-11 px-3 text-sm font-medium bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 text-slate-800"
              >
                {CITIES.map((c) => (
                  <option key={c} value={c === 'All Cities' ? '' : c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* University Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                University / College
              </label>
              <select
                value={filters.university}
                onChange={(e) => setFilters({ ...filters, university: e.target.value })}
                className="w-full h-11 px-3 text-sm font-medium bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 text-slate-800"
              >
                {UNIVERSITIES.map((u) => (
                  <option key={u} value={u === 'All Universities' ? '' : u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>

            {/* Room Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-600" />
                Room Sharing
              </label>
              <select
                value={filters.roomType}
                onChange={(e) => setFilters({ ...filters, roomType: e.target.value })}
                className="w-full h-11 px-3 text-sm font-medium bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 text-slate-800"
              >
                <option value="">Any Room Type</option>
                <option value="single">Single (Private Room)</option>
                <option value="double">Twin Sharing (2 Sharing)</option>
                <option value="triple">Triple Sharing (Budget)</option>
                <option value="studio">Private Studio 1BHK</option>
              </select>
            </div>

            {/* Food Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Utensils className="w-3.5 h-3.5 text-amber-600" />
                Food & Mess Preference
              </label>
              <select
                value={filters.foodType}
                onChange={(e) => setFilters({ ...filters, foodType: e.target.value })}
                className="w-full h-11 px-3 text-sm font-medium bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 text-slate-800"
              >
                <option value="">Any Food Option</option>
                <option value="pure_veg">Pure Veg Mess (No Egg/Meat)</option>
                <option value="jain_available">Jain Food Available</option>
                <option value="non_veg">Veg & Non-Veg Permitted</option>
                <option value="self_cook">Self-Cooking Kitchen</option>
              </select>
            </div>
          </div>

          {/* Quick Gender Chips & Search Button */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-500 mr-1">Hostel For:</span>
              {[
                { label: 'All Students', val: '' },
                { label: '👦 Boys Only', val: 'boys' },
                { label: '👧 Girls Only', val: 'girls' },
                { label: '🏢 Co-Ed', val: 'all' }
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setFilters({ ...filters, gender: item.val })}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all ${
                    filters.gender === item.val
                      ? 'bg-orange-600 text-white border-orange-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <button
              onClick={onSearch}
              className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
              <Search className="w-4 h-4" />
              <span>Explore {totalListingsCount} Available PGs</span>
            </button>
          </div>
        </div>

        {/* Trust Badges Bar */}
        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-center">
          <div className="p-3 bg-white/70 rounded-2xl border border-slate-200/60 shadow-sm">
            <div className="text-xl sm:text-2xl font-black text-slate-900">10,000+</div>
            <div className="text-xs text-slate-500 font-medium">Students Housed</div>
          </div>
          <div className="p-3 bg-white/70 rounded-2xl border border-slate-200/60 shadow-sm">
            <div className="text-xl sm:text-2xl font-black text-orange-600">₹0 Brokerage</div>
            <div className="text-xs text-slate-500 font-medium">Direct Landlord Contact</div>
          </div>
          <div className="p-3 bg-white/70 rounded-2xl border border-slate-200/60 shadow-sm">
            <div className="text-xl sm:text-2xl font-black text-emerald-600">100% Pure Veg</div>
            <div className="text-xs text-slate-500 font-medium">Hygienic Indian Messes</div>
          </div>
          <div className="p-3 bg-white/70 rounded-2xl border border-slate-200/60 shadow-sm">
            <div className="text-xl sm:text-2xl font-black text-indigo-600">24/7 Security</div>
            <div className="text-xs text-slate-500 font-medium">Biometric & CCTV Monitored</div>
          </div>
        </div>
      </div>
    </div>
  );
};
