'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getCountFromServer, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { format } from 'date-fns';
import { Booking } from '@/lib/types';
import { formatPrice } from '@/lib/utils';

interface Stats {
  totalRooms: number;
  totalBookings: number;
  totalRevenue: number;
  pendingBookings: number;
  confirmedBookings: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalRooms: 0,
    totalBookings: 0,
    totalRevenue: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
  });
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const roomsRef = collection(db, 'rooms');
        const bookingsRef = collection(db, 'bookings');
        const invoicesRef = collection(db, 'invoices');

        const [
          totalRoomsSnapshot,
          totalBookingsSnapshot,
          pendingBookingsSnapshot,
          confirmedBookingsSnapshot,
          paidInvoicesSnapshot,
          recentBookingsSnapshot,
        ] = await Promise.all([
          getCountFromServer(roomsRef),
          getCountFromServer(bookingsRef),
          getCountFromServer(query(bookingsRef, where('status', '==', 'pending'))),
          getCountFromServer(query(bookingsRef, where('status', '==', 'confirmed'))),
          getDocs(query(invoicesRef, where('status', '==', 'paid'))),
          getDocs(query(bookingsRef, orderBy('createdAt', 'desc'), limit(5))),
        ]);

        const totalRevenue = paidInvoicesSnapshot.docs.reduce(
          (sum, invoiceDoc) => sum + Number(invoiceDoc.data().amount || 0),
          0
        );
        const recent = recentBookingsSnapshot.docs.map(
          (bookingDoc) => ({ id: bookingDoc.id, ...bookingDoc.data() } as Booking)
        );

        setStats({
          totalRooms: totalRoomsSnapshot.data().count,
          totalBookings: totalBookingsSnapshot.data().count,
          totalRevenue,
          pendingBookings: pendingBookingsSnapshot.data().count,
          confirmedBookings: confirmedBookingsSnapshot.data().count,
        });
        setRecentBookings(recent);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="flex-1 p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back to your hotel management dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Rooms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.totalRooms}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.totalBookings}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingBookings}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Confirmed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.confirmedBookings}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatPrice(stats.totalRevenue)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Bookings</CardTitle>
              <CardDescription>Latest booking activity</CardDescription>
            </div>
            <Link href="/admin/bookings">
              <Button variant="outline">View All</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentBookings.length > 0 ? (
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="font-semibold text-foreground">{booking.guestName}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(booking.checkInDate), 'MMM dd')} -{' '}
                      {format(new Date(booking.checkOutDate), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">
                      {formatPrice(booking.totalPrice)}
                    </p>
                    <p
                      className={`text-sm font-semibold capitalize ${
                        booking.status === 'confirmed'
                          ? 'text-green-600'
                          : booking.status === 'pending'
                          ? 'text-yellow-600'
                          : 'text-red-600'
                      }`}
                    >
                      {booking.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No bookings yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
