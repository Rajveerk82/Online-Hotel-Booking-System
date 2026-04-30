'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Navigation } from '@/components/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Booking } from '@/lib/types';
import { Spinner } from '@/components/ui/spinner';
import { format } from 'date-fns';
import { formatPrice } from '@/lib/utils';

export default function BookingConfirmationPage() {
  const router = useRouter();
  const params = useParams();
  const bookingId = params.bookingId as string;
  const { user, loading: authLoading } = useAuth();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push('/auth/login');
      return;
    }

    const fetchBooking = async () => {
      try {
        const bookingRef = doc(db, 'bookings', bookingId);
        const bookingSnap = await getDoc(bookingRef);

        if (bookingSnap.exists()) {
          const bookingData = { id: bookingSnap.id, ...bookingSnap.data() } as Booking;

          if (bookingData.userId !== user.uid) {
            router.push('/');
            return;
          }

          setBooking(bookingData);
        } else {
          setError('Booking not found');
        }
      } catch (err) {
        console.error('Error fetching booking:', err);
        setError('Failed to load booking details');
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [authLoading, user, router, bookingId]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="w-12 h-12" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-lg text-muted-foreground mb-4">{error || 'Booking not found'}</p>
          <Button onClick={() => router.push('/')}>Back to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Success Message */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Booking Confirmed!</h1>
            <p className="text-muted-foreground">
              Your booking has been confirmed. A confirmation email has been sent to {booking.guestEmail}
            </p>
          </div>

          {/* Booking Details Card */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>Booking Details</CardTitle>
                  <CardDescription>Booking ID: {booking.id.substring(0, 8).toUpperCase()}</CardDescription>
                </div>
                <Badge className="bg-green-100 text-green-800 capitalize">
                  {booking.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Guest Information */}
              <div className="border-b border-border pb-6">
                <h3 className="font-semibold text-foreground mb-4">Guest Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-semibold text-foreground">{booking.guestName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-semibold text-foreground">{booking.guestEmail}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-semibold text-foreground">{booking.phoneNumber}</p>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="border-b border-border pb-6">
                <h3 className="font-semibold text-foreground mb-4">Stay Dates</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Check-In</p>
                    <p className="font-semibold text-foreground">
                      {format(new Date(booking.checkInDate), 'EEE, MMM dd, yyyy')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Check-Out</p>
                    <p className="font-semibold text-foreground">
                      {format(new Date(booking.checkOutDate), 'EEE, MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Price Summary */}
              <div>
                <h3 className="font-semibold text-foreground mb-4">Payment Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Amount Paid:</span>
                    <span className="font-semibold text-foreground">
                      {formatPrice(booking.totalPrice)}
                    </span>
                  </div>
                  {booking.stripePaymentId && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payment ID:</span>
                      <span className="font-semibold text-foreground text-sm">
                        {booking.stripePaymentId}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="bg-muted/50 border-muted">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-foreground mb-2">What&apos;s Next?</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✓ A confirmation email has been sent to {booking.guestEmail}</li>
                <li>✓ Check your email for booking details and receipt</li>
                <li>✓ You can manage your booking from your dashboard</li>
                <li>✓ Contact us if you need to modify your booking</li>
              </ul>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-8 justify-center">
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard')}
            >
              View My Bookings
            </Button>
            <Button
              onClick={() => router.push('/')}
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              Browse More Rooms
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
