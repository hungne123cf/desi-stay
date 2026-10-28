'use client';

import React, { useState, useMemo } from 'react';
import { HeroSection } from '@/components/HeroSection';
import { PropertyCard } from '@/components/PropertyCard';
import { BookingModal } from '@/components/BookingModal';
import { useProperties } from '@/context/PropertyContext';
import { Property, FilterOptions } from '@/types';
import {
  ShieldCheck,
  Utensils,
  HeartHandshake,
  CheckCircle,
  Sparkles,
  HelpCircle,
  SearchX,
  GraduationCap
} from 'lucide-react';

export default function HomePage() {
  const { properties } = useProperties();
  const [selectedPropertyForBooking, setSelectedPropertyForBooking] = useState<Property | null>(null);

  const [filters, setFilters] = useState<FilterOptions>({
    city: '',
    university: '',
    roomType: '',
    gender: '',
    foodType: '',
    maxPrice: 35000,
    zeroBrokerageOnly: false,
    attachedBathOnly: false
  });

  // Filter listings
  const filteredProperties = useMemo(() => {
    return properties.filter((item) => {
      if (filters.city && item.city !== filters.city) return false;
      if (filters.university && item.nearbyUniversity !== filters.university) return false;
      if (filters.roomType && item.roomType !== filters.roomType) return false;
      if (filters.gender && item.gender !== filters.gender && item.gender !== 'all') return false;
      if (filters.foodType && item.foodType !== filters.foodType) return false;
      if (filters.zeroBrokerageOnly && !item.isZeroBrokerage) return false;
      return true;
    });
  }, [properties, filters]);

  const resetFilters = () => {
    setFilters({
      city: '',
      university: '',
      roomType: '',
      gender: '',
      foodType: '',
      maxPrice: 35000,
      zeroBrokerageOnly: false,
      attachedBathOnly: false
    });
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Hero with Search */}
      <HeroSection
        filters={filters}
        setFilters={setFilters}
        onSearch={() => {
          const el = document.getElementById('listings');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        totalListingsCount={properties.length}
      />

      {/* Main Content Listings */}
      <main id="listings" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Verified Student Accommodations
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Showing <span className="font-bold text-orange-600">{filteredProperties.length}</span> of {properties.length} properties matching your criteria
            </p>
          </div>

          {/* Quick Filter Tags */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  foodType: prev.foodType === 'pure_veg' ? '' : 'pure_veg'
                }))
              }
              className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                filters.foodType === 'pure_veg'
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300'
              }`}
            >
              🥗 Pure Veg Only
            </button>

            <button
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  gender: prev.gender === 'girls' ? '' : 'girls'
                }))
              }
              className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                filters.gender === 'girls'
                  ? 'bg-pink-600 text-white border-pink-600'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-pink-300'
              }`}
            >
              👧 Girls Hostels
            </button>

            <button
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  zeroBrokerageOnly: !prev.zeroBrokerageOnly
                }))
              }
              className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                filters.zeroBrokerageOnly
                  ? 'bg-orange-600 text-white border-orange-600'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-orange-300'
              }`}
            >
              ⚡ Zero Brokerage
            </button>

            {(filters.city || filters.university || filters.roomType || filters.gender || filters.foodType || filters.zeroBrokerageOnly) && (
              <button
                onClick={resetFilters}
                className="text-xs font-semibold text-slate-500 hover:text-red-600 underline ml-2"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Listings Grid */}
        {filteredProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
            {filteredProperties.map((prop) => (
              <PropertyCard
                key={prop.id}
                property={prop}
                onBookNow={(p) => setSelectedPropertyForBooking(p)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 mt-8 p-8">
            <SearchX className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">No Accommodations Found</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-5">
              We couldn&apos;t find any PGs matching your exact filters. Try clearing some filters or searching a different city.
            </p>
            <button
              onClick={resetFilters}
              className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl shadow-sm"
            >
              Reset All Filters
            </button>
          </div>
        )}

        {/* Value Proposition: Why Indian Students & Parents Choose Us */}
        <section id="benefits" className="mt-24 pt-16 border-t border-slate-200">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-orange-600" />
              Tailored for Indian Student Culture
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Designed with Parents &amp; Scholars in Mind
            </h3>
            <p className="text-sm text-slate-600 mt-2">
              Moving to college shouldn&apos;t mean compromising on food hygiene, sleep safety, or paying exorbitant agent commissions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-7 rounded-3xl border border-slate-200/90 shadow-sm hover:border-orange-300 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-5">
                <Utensils className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">Authentic Pure Veg &amp; Jain Food</h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Clean, home-style North &amp; South Indian breakfast, lunch, and dinner cooked fresh daily. Separate Jain food without onion or garlic available upon request.
              </p>
            </div>

            <div className="bg-white p-7 rounded-3xl border border-slate-200/90 shadow-sm hover:border-orange-300 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-5">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">24/7 Biometric Safety &amp; Wardens</h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Biometric fingerprint entry, CCTV across all common corridors, verified female wardens in girls&apos; hostels, and emergency medical doctor-on-call.
              </p>
            </div>

            <div className="bg-white p-7 rounded-3xl border border-slate-200/90 shadow-sm hover:border-orange-300 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-700 flex items-center justify-center mb-5">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">Zero Brokerage Guarantee</h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                You never pay a single rupee in broker fees. Connect directly with verified building owners and reserve beds with nominal holding token deposits.
              </p>
            </div>
          </div>
        </section>

        {/* Special Highlight: Indian MBBS Medical Students Wing (International) */}
        <section className="mt-16 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-xl">
          <div className="max-w-2xl relative z-10 space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/30 text-indigo-300 border border-indigo-400/30 text-xs font-bold">
              <GraduationCap className="w-4 h-4" />
              Study Abroad Support
            </span>
            <h3 className="text-2xl sm:text-4xl font-black tracking-tight">
              Studying MBBS Abroad in Vietnam or Philippines?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              We manage dedicated Indian student wings right next to medical universities (e.g. Can Tho Medical University - CTUMP). Featuring authentic Indian chefs, spices shipped directly from India, and a senior student buddy mentorship network.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <a
                href="https://wa.me/919876543210?text=I%20am%20an%20MBBS%20student%20looking%20for%20accommodation"
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-md transition-all inline-flex items-center gap-2"
              >
                <span>Inquire for International Medical PGs</span>
              </a>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="mt-20 max-w-3xl mx-auto">
          <h3 className="text-2xl font-black text-center text-slate-900 mb-8">
            Frequently Asked Questions by Parents &amp; Students
          </h3>

          <div className="space-y-4 text-sm">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <h5 className="font-bold text-slate-900 mb-1">
                How does the Token Deposit work?
              </h5>
              <p className="text-slate-600 text-xs sm:text-sm">
                The token deposit (₹1,500 - ₹2,500) locks your selected room for 48 hours so nobody else can book it while you travel or finalize paperwork. When you check in, this token is deducted from your first month&apos;s rent.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <h5 className="font-bold text-slate-900 mb-1">
                Are parents allowed to stay during initial move-in?
              </h5>
              <p className="text-slate-600 text-xs sm:text-sm">
                Yes! Most of our verified residences have guest-room provisions where parents can stay for 1–2 nights during admission week. Please notify the warden in advance.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <h5 className="font-bold text-slate-900 mb-1">
                How is the mess food managed?
              </h5>
              <p className="text-slate-600 text-xs sm:text-sm">
                Properties marked as &quot;Pure Veg&quot; feature 100% vegetarian kitchens with zero non-vegetarian food cooked or stored on premises. Weekly rotating menus include Roti, Sabzi, Dal, Rice, Salad, and weekend sweet treats.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Booking Modal */}
      <BookingModal
        property={selectedPropertyForBooking}
        onClose={() => setSelectedPropertyForBooking(null)}
      />
    </div>
  );
}
