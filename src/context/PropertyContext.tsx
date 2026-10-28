'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Property, BookingLead } from '@/types';
import { INITIAL_PROPERTIES } from '@/data/mockProperties';

interface PropertyContextType {
  properties: Property[];
  bookings: BookingLead[];
  currency: 'INR' | 'USD';
  currencyRate: number; // 1 USD = 85 INR
  formatPrice: (inr: number) => string;
  addProperty: (property: Omit<Property, 'id' | 'code' | 'rating' | 'reviewsCount'>) => void;
  updateProperty: (id: string, property: Partial<Property>) => void;
  deleteProperty: (id: string) => void;
  addBooking: (booking: Omit<BookingLead, 'id' | 'createdAt'>) => string;
  updateBookingStatus: (id: string, status: BookingLead['paymentStatus']) => void;
  toggleCurrency: () => void;
}

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

const INITIAL_BOOKINGS: BookingLead[] = [
  {
    id: 'lead-1',
    propertyId: 'prop-1',
    propertyTitle: 'The Elite Heights - Boys Luxury PG & Co-Living',
    propertyCode: 'YS-101',
    studentName: 'Kabir Mehta',
    studentEmail: 'kabir.m@gmail.com',
    studentWhatsApp: '+91 98450 12345',
    universityOrCollege: 'Christ University (Central Campus)',
    moveInDate: '2026-11-15',
    sharingPreference: 'double',
    tokenPaidINR: 2000,
    paymentStatus: 'token_paid',
    paymentMethod: 'razorpay_upi',
    transactionId: 'pay_UPI_98a7sd76f',
    createdAt: '2026-10-25 14:32'
  },
  {
    id: 'lead-2',
    propertyId: 'prop-2',
    propertyTitle: 'Aura Blossom - Premium Girls Residency & Hostel',
    propertyCode: 'YS-102',
    studentName: 'Ananya Iyer',
    studentEmail: 'ananya.iyer@gmail.com',
    studentWhatsApp: '+91 99201 54321',
    universityOrCollege: 'Fergusson College',
    moveInDate: '2026-11-01',
    sharingPreference: 'single',
    tokenPaidINR: 2500,
    paymentStatus: 'confirmed',
    paymentMethod: 'razorpay_upi',
    transactionId: 'pay_UPI_12x99a8b',
    createdAt: '2026-10-27 10:15'
  },
  {
    id: 'lead-3',
    propertyId: 'prop-4',
    propertyTitle: 'MedCampus Residency - International Indian Students Hub',
    propertyCode: 'YS-104',
    studentName: 'Rohan Gupta (MBBS 1st Year)',
    studentEmail: 'rohan.g@yahoo.in',
    studentWhatsApp: '+91 97112 33445',
    universityOrCollege: 'Can Tho University of Medicine & Pharmacy (CTUMP)',
    moveInDate: '2026-12-01',
    sharingPreference: 'double',
    tokenPaidINR: 1500,
    paymentStatus: 'token_paid',
    paymentMethod: 'razorpay_upi',
    transactionId: 'pay_UPI_66b5543c',
    createdAt: '2026-10-28 16:45'
  }
];

export const PropertyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [properties, setProperties] = useState<Property[]>(INITIAL_PROPERTIES);
  const [bookings, setBookings] = useState<BookingLead[]>(INITIAL_BOOKINGS);
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
  const currencyRate = 85; // 1 USD = 85 INR

  // Load persisted data if available
  useEffect(() => {
    try {
      const savedProps = localStorage.getItem('desi_stay_properties');
      if (savedProps) {
        setProperties(JSON.parse(savedProps));
      }
      const savedBookings = localStorage.getItem('desi_stay_bookings');
      if (savedBookings) {
        setBookings(JSON.parse(savedBookings));
      }
    } catch {
      // ignore
    }
  }, []);

  const saveProperties = (newProps: Property[]) => {
    setProperties(newProps);
    try {
      localStorage.setItem('desi_stay_properties', JSON.stringify(newProps));
    } catch {
      // ignore
    }
  };

  const saveBookings = (newBookings: BookingLead[]) => {
    setBookings(newBookings);
    try {
      localStorage.setItem('desi_stay_bookings', JSON.stringify(newBookings));
    } catch {
      // ignore
    }
  };

  const formatPrice = (inr: number) => {
    if (currency === 'USD') {
      const usd = Math.round(inr / currencyRate);
      return `$${usd.toLocaleString()}`;
    }
    return `₹${inr.toLocaleString('en-IN')}`;
  };

  const toggleCurrency = () => {
    setCurrency((prev) => (prev === 'INR' ? 'USD' : 'INR'));
  };

  const addProperty = (newProp: Omit<Property, 'id' | 'code' | 'rating' | 'reviewsCount'>) => {
    const nextCodeNumber = properties.length + 101;
    const created: Property = {
      ...newProp,
      id: `prop-${Date.now()}`,
      code: `YS-${nextCodeNumber}`,
      rating: 5.0,
      reviewsCount: 1
    };
    saveProperties([created, ...properties]);
  };

  const updateProperty = (id: string, updatedFields: Partial<Property>) => {
    const updated = properties.map((p) => (p.id === id ? { ...p, ...updatedFields } : p));
    saveProperties(updated);
  };

  const deleteProperty = (id: string) => {
    const filtered = properties.filter((p) => p.id !== id);
    saveProperties(filtered);
  };

  const addBooking = (bookingData: Omit<BookingLead, 'id' | 'createdAt'>): string => {
    const newId = `lead-${Date.now()}`;
    const newBooking: BookingLead = {
      ...bookingData,
      id: newId,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    saveBookings([newBooking, ...bookings]);
    return newId;
  };

  const updateBookingStatus = (id: string, status: BookingLead['paymentStatus']) => {
    const updated = bookings.map((b) => (b.id === id ? { ...b, paymentStatus: status } : b));
    saveBookings(updated);
  };

  return (
    <PropertyContext.Provider
      value={{
        properties,
        bookings,
        currency,
        currencyRate,
        formatPrice,
        addProperty,
        updateProperty,
        deleteProperty,
        addBooking,
        updateBookingStatus,
        toggleCurrency
      }}
    >
      {children}
    </PropertyContext.Provider>
  );
};

export const useProperties = () => {
  const context = useContext(PropertyContext);
  if (!context) {
    throw new Error('useProperties must be used within PropertyProvider');
  }
  return context;
};
