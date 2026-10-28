'use client';

import React from 'react';
import Link from 'next/link';
import { Building, ShieldCheck, HeartHandshake, Phone, Mail, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white font-black text-xl shadow-md">
                <Building className="w-5 h-5" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                Yuva<span className="text-orange-500">Stays</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              India&apos;s trusted student housing and co-living discovery platform. Finding you safe, verified PGs and hostels near top colleges with Pure Veg food options, zero brokerage, and 24/7 student support.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800/80">
                <ShieldCheck className="w-4 h-4" />
                100% Verified Landlords
              </div>
              <div className="flex items-center gap-1.5 text-xs text-orange-400 bg-orange-950/60 px-3 py-1 rounded-full border border-orange-800/80">
                <HeartHandshake className="w-4 h-4" />
                Zero Brokerage
              </div>
            </div>
          </div>

          {/* Top Campus Hubs */}
          <div>
            <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4">
              Student Hubs
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#search" className="hover:text-orange-400 transition-colors">
                  Bengaluru (Christ / Jain / PES)
                </a>
              </li>
              <li>
                <a href="#search" className="hover:text-orange-400 transition-colors">
                  Pune (Symbiosis / Fergusson / MIT)
                </a>
              </li>
              <li>
                <a href="#search" className="hover:text-orange-400 transition-colors">
                  Delhi NCR (DU North & South Campus)
                </a>
              </li>
              <li>
                <a href="#search" className="hover:text-orange-400 transition-colors">
                  Kota (NEET & JEE Hub)
                </a>
              </li>
              <li>
                <a href="#search" className="hover:text-orange-400 transition-colors">
                  Vietnam (Can Tho / Hue MBBS Hub)
                </a>
              </li>
            </ul>
          </div>

          {/* Student Services */}
          <div>
            <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4">
              Preferences
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <span className="text-slate-300">Pure Veg & Jain Mess PGs</span>
              </li>
              <li>
                <span className="text-slate-300">Girls Only Verified Hostels</span>
              </li>
              <li>
                <span className="text-slate-300">Boys Executive Co-Living</span>
              </li>
              <li>
                <span className="text-slate-300">Independent 1BHK Studios</span>
              </li>
              <li>
                <span className="text-slate-300">Walking Distance to Campus</span>
              </li>
            </ul>
          </div>

          {/* Direct Support */}
          <div>
            <h4 className="text-white text-sm font-bold uppercase tracking-wider mb-4">
              Help & Booking
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-orange-400 mt-1 shrink-0" />
                <div>
                  <p className="text-xs text-slate-500 font-medium">WhatsApp Helpline</p>
                  <a
                    href="https://wa.me/919876543210"
                    target="_blank"
                    rel="noreferrer"
                    className="text-white font-semibold hover:text-orange-400"
                  >
                    +91 98765 43210
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-orange-400 mt-1 shrink-0" />
                <div>
                  <p className="text-xs text-slate-500 font-medium">Email Support</p>
                  <p className="text-white font-semibold">care@desistays.in</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-orange-400 mt-1 shrink-0" />
                <div>
                  <p className="text-xs text-slate-500 font-medium">Headquarters</p>
                  <p className="text-slate-300 text-xs">Indiranagar, Bengaluru, KA - 560038</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 YuvaStays Technologies Pvt Ltd. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/admin" className="hover:text-indigo-400 transition-colors font-medium">
              Property Owner & Admin Portal
            </Link>
            <span className="hover:text-slate-400">Terms of Stay</span>
            <span className="hover:text-slate-400">Privacy Policy</span>
            <span className="hover:text-slate-400">Refund Guarantee</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
