'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Booking, Invoice } from '@/lib/types';
import {
  differenceInCalendarDays,
  format,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
} from 'date-fns';
import { formatPrice } from '@/lib/utils';

export default function ReportsPage() {
  const [stats, setStats] = useState({
    monthlyRevenue: 0,
    yearlyRevenue: 0,
    occupancyRate: 0,
    averageBookingValue: 0,
    totalGuests: 0,
    cancellationRate: 0,
  });
  const [monthlyData, setMonthlyData] = useState<{ month: string; revenue: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const getErrorMessage = (err: unknown) => {
    const firebaseError = err as { code?: string; message?: string } | undefined;
    if (
      firebaseError?.code === 'unavailable' ||
      firebaseError?.code === 'failed-precondition' ||
      /offline/i.test(firebaseError?.message ?? '')
    ) {
      return 'Could not load fresh report data because the client is offline. Reconnect and refresh.';
    }

    return 'Failed to load reports. Please refresh and try again.';
  };

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setError('');
        const now = new Date();
        const monthStart = startOfMonth(now);
        const monthEnd = endOfMonth(now);
        const yearStart = startOfYear(now);
        const yearEnd = endOfYear(now);
        const yearStartIso = yearStart.toISOString();
        const yearEndIso = yearEnd.toISOString();

        const bookingsRef = collection(db, 'bookings');
        const invoicesRef = collection(db, 'invoices');
        const roomsRef = collection(db, 'rooms');

        const [
          roomsSnapshot,
          allBookingsSnapshot,
          yearlyBookingsSnapshot,
          yearlyInvoicesSnapshot,
        ] = await Promise.all([
          getDocs(roomsRef),
          getDocs(bookingsRef),
          getDocs(
            query(
              bookingsRef,
              where('createdAt', '>=', yearStartIso),
              where('createdAt', '<=', yearEndIso)
            )
          ),
          getDocs(
            query(
              invoicesRef,
              where('issueDate', '>=', yearStartIso),
              where('issueDate', '<=', yearEndIso)
            )
          ),
        ]);

        const yearlyBookings = yearlyBookingsSnapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Booking)
        );
        const yearlyInvoices = yearlyInvoicesSnapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Invoice)
        );
        const allBookings = allBookingsSnapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Booking)
        );
        const confirmedBookings = yearlyBookings.filter((booking) => booking.status === 'confirmed');
        const paidInvoices = yearlyInvoices.filter((invoice) => invoice.status === 'paid');

        // Monthly revenue (paid invoices)
        const monthlyInvoices = paidInvoices.filter((inv) => {
          const invDate = new Date(inv.issueDate);
          return invDate >= monthStart && invDate <= monthEnd && inv.status === 'paid';
        });
        const monthlyRevenue = monthlyInvoices.reduce((sum, inv) => sum + inv.amount, 0);

        // Yearly revenue
        const yearlyRevenue = paidInvoices.reduce((sum, inv) => sum + inv.amount, 0);

        const roomCount = roomsSnapshot.size;
        const elapsedDaysInYear = Math.max(
          1,
          differenceInCalendarDays(now, yearStart) + 1
        );
        const bookedNights = confirmedBookings.reduce((sum, booking) => {
          const checkInDate = new Date(booking.checkInDate);
          const checkOutDate = new Date(booking.checkOutDate);
          return sum + Math.max(1, differenceInCalendarDays(checkOutDate, checkInDate));
        }, 0);
        const occupancyRate =
          roomCount > 0 ? (bookedNights / (roomCount * elapsedDaysInYear)) * 100 : 0;

        // Average booking value
        const averageBookingValue =
          confirmedBookings.length > 0
            ? confirmedBookings.reduce((sum, booking) => sum + booking.totalPrice, 0) / confirmedBookings.length
            : 0;

        // Total guests
        const totalGuests = confirmedBookings.length;

        // Cancellation rate
        const totalBookings = allBookings.length;
        const cancelledBookings = allBookings.filter((booking) => booking.status === 'cancelled').length;
        const cancellationRate = totalBookings > 0 ? (cancelledBookings / totalBookings) * 100 : 0;

        setStats({
          monthlyRevenue,
          yearlyRevenue,
          occupancyRate: Math.round(occupancyRate),
          averageBookingValue,
          totalGuests,
          cancellationRate: Math.round(cancellationRate),
        });

        // Monthly breakdown
        const months = Array.from({ length: 12 }, (_, i) => {
          const date = new Date(now.getFullYear(), i, 1);
          const monthStart = startOfMonth(date);
          const monthEnd = endOfMonth(date);
          const monthInvoices = paidInvoices.filter((inv) => {
            const invDate = new Date(inv.issueDate);
            return invDate >= monthStart && invDate <= monthEnd;
          });
          return {
            month: format(date, 'MMM'),
            revenue: monthInvoices.reduce((sum, inv) => sum + inv.amount, 0),
          };
        });
        setMonthlyData(months);
      } catch (error) {
        setError(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">Reports & Analytics</h1>
        <div className="text-center py-8 text-muted-foreground">Loading reports...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
        <p className="text-muted-foreground mt-1">View comprehensive hotel performance metrics</p>
      </div>

      {error && (
        <Card className="mb-6 border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6 text-sm text-yellow-900">
            {error}
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatPrice(stats.monthlyRevenue)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Current month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Yearly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatPrice(stats.yearlyRevenue)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Current year</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Occupancy Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.occupancyRate}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">Monthly average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Booking Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatPrice(stats.averageBookingValue)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Per confirmed booking</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Guests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {stats.totalGuests}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Confirmed bookings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Cancellation Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.cancellationRate}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">Total bookings</p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Revenue Trend</CardTitle>
          <CardDescription>Revenue by month for the current year</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {monthlyData.map((data) => (
              <div key={data.month} className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground w-12">{data.month}</span>
                <div className="flex-1 mx-4 bg-muted rounded-full h-8 flex items-center">
                  <div
                    className="bg-accent h-full rounded-full"
                    style={{
                      width: `${Math.max(5, (data.revenue / Math.max(...monthlyData.map((d) => d.revenue), 1)) * 100)}%`,
                    }}
                  />
                </div>
                <span className="text-sm font-semibold text-foreground w-24 text-right">
                  ${data.revenue.toFixed(0)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
