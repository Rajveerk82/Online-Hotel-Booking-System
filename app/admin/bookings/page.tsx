'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { db } from '@/lib/firebase';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { Booking } from '@/lib/types';
import { format } from 'date-fns';
import { formatPrice } from '@/lib/utils';

export default function BookingsManagement() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all');

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'bookings'));
        const bookingsData: Booking[] = [];
        snapshot.forEach((doc) => {
          bookingsData.push({ id: doc.id, ...doc.data() } as Booking);
        });

        // Sort by date descending
        bookingsData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        setBookings(bookingsData);
        setFilteredBookings(bookingsData);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  useEffect(() => {
    let filtered = bookings;

    if (filterStatus !== 'all') {
      filtered = filtered.filter((b) => b.status === filterStatus);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (b) =>
          b.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          b.guestEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
          b.phoneNumber.includes(searchTerm)
      );
    }

    setFilteredBookings(filtered);
  }, [searchTerm, filterStatus, bookings]);

  const handleUpdateStatus = async (bookingId: string, newStatus: Booking['status']) => {
    try {
      await updateDoc(doc(db, 'bookings', bookingId), {
        status: newStatus,
      });

      setBookings(
        bookings.map((b) =>
          b.id === bookingId ? { ...b, status: newStatus } : b
        )
      );
    } catch (error) {
      console.error('Error updating booking:', error);
    }
  };

  return (
    <div className="flex-1 p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Bookings Management</h1>
        <p className="text-muted-foreground mt-1">View and manage all hotel bookings</p>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        <Input
          placeholder="Search by guest name, email, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />

        <div className="flex gap-2 flex-wrap">
          {(['all', 'pending', 'confirmed', 'cancelled'] as const).map((status) => (
            <Button
              key={status}
              variant={filterStatus === status ? 'default' : 'outline'}
              onClick={() => setFilterStatus(status)}
              className="capitalize"
            >
              {status}
            </Button>
          ))}
        </div>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading bookings...</div>
      ) : filteredBookings.length > 0 ? (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <Card key={booking.id}>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {/* Guest Info */}
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Guest</p>
                    <p className="font-semibold text-foreground">{booking.guestName}</p>
                    <p className="text-sm text-muted-foreground">{booking.guestEmail}</p>
                    <p className="text-sm text-muted-foreground">{booking.phoneNumber}</p>
                  </div>

                  {/* Dates */}
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Check-In</p>
                    <p className="font-semibold text-foreground">
                      {format(new Date(booking.checkInDate), 'MMM dd, yyyy')}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">Check-Out</p>
                    <p className="font-semibold text-foreground">
                      {format(new Date(booking.checkOutDate), 'MMM dd, yyyy')}
                    </p>
                  </div>

                  {/* Price */}
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Price</p>
                    <p className="font-semibold text-foreground text-lg">
                      {formatPrice(booking.totalPrice)}
                    </p>
                  </div>

                  {/* Status */}
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Status</p>
                    <Badge
                      className={
                        booking.status === 'confirmed'
                          ? 'bg-green-100 text-green-800'
                          : booking.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }
                    >
                      {booking.status}
                    </Badge>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    {booking.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleUpdateStatus(booking.id, 'confirmed')}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          Confirm
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                    {booking.status === 'confirmed' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">No bookings found.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
