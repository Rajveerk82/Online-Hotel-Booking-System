'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Navigation } from '@/components/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FieldGroup } from '@/components/ui/field';
import { db } from '@/lib/firebase';
import { doc, getDoc, addDoc, collection } from 'firebase/firestore';
import { Room, Booking } from '@/lib/types';
import { Spinner } from '@/components/ui/spinner';
import { differenceInDays } from 'date-fns';
import { formatPrice, getRoomImage } from '@/lib/utils';

export default function BookingPage() {
  const router = useRouter();
  const params = useParams();
  const roomId = params.roomId as string;
  const { user, loading: authLoading } = useAuth();

  const [room, setRoom] = useState<Room | null>(null);
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push('/auth/login');
      return;
    }

    const fetchRoom = async () => {
      try {
        const roomRef = doc(db, 'rooms', roomId);
        const roomSnap = await getDoc(roomRef);

        if (roomSnap.exists()) {
          setRoom({ id: roomSnap.id, ...roomSnap.data() } as Room);
        } else {
          setError('Room not found');
        }
      } catch (err) {
        console.error('Error fetching room:', err);
        setError('Failed to load room details');
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [authLoading, user, router, roomId]);

  const calculateTotalPrice = () => {
    if (!checkInDate || !checkOutDate || !room) return 0;
    const days = differenceInDays(new Date(checkOutDate), new Date(checkInDate));
    return Math.max(1, days) * room.price;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!checkInDate || !checkOutDate) {
      setError('Please select check-in and check-out dates');
      return;
    }

    const inDate = new Date(checkInDate);
    const outDate = new Date(checkOutDate);

    if (outDate <= inDate) {
      setError('Check-out date must be after check-in date');
      return;
    }

    setSubmitting(true);

    try {
      const booking: Omit<Booking, 'id'> = {
        userId: user!.uid,
        roomId,
        checkInDate: inDate.toISOString(),
        checkOutDate: outDate.toISOString(),
        guestName,
        guestEmail,
        phoneNumber,
        totalPrice: calculateTotalPrice(),
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'bookings'), booking);
      router.push(`/checkout/${docRef.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="w-12 h-12" />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-lg text-muted-foreground mb-4">{error || 'Room not found'}</p>
          <Button onClick={() => router.push('/')}>Back to Rooms</Button>
        </div>
      </div>
    );
  }

  const totalPrice = calculateTotalPrice();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-foreground mb-8">Book {room.name}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Booking Details</CardTitle>
                <CardDescription>Complete your booking information</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
                      {error}
                    </div>
                  )}

                  <FieldGroup>
                    <label className="text-sm font-medium text-foreground">Check-In Date</label>
                    <Input
                      type="date"
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      required
                      disabled={submitting}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </FieldGroup>

                  <FieldGroup>
                    <label className="text-sm font-medium text-foreground">Check-Out Date</label>
                    <Input
                      type="date"
                      value={checkOutDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      required
                      disabled={submitting}
                      min={checkInDate || new Date().toISOString().split('T')[0]}
                    />
                  </FieldGroup>

                  <FieldGroup>
                    <label className="text-sm font-medium text-foreground">Guest Name</label>
                    <Input
                      type="text"
                      placeholder="John Doe"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      required
                      disabled={submitting}
                    />
                  </FieldGroup>

                  <FieldGroup>
                    <label className="text-sm font-medium text-foreground">Email</label>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      required
                      disabled={submitting}
                    />
                  </FieldGroup>

                  <FieldGroup>
                    <label className="text-sm font-medium text-foreground">Phone Number</label>
                    <Input
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      required
                      disabled={submitting}
                    />
                  </FieldGroup>

                  <Button
                    type="submit"
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                    disabled={submitting}
                  >
                    {submitting ? 'Processing...' : 'Continue to Payment'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Summary Card */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="overflow-hidden rounded-xl border border-border">
                  <img
                    src={getRoomImage(room.images)}
                    alt={room.name}
                    className="h-52 w-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Room</p>
                  <p className="font-semibold text-foreground">{room.name}</p>
                  <p className="text-sm text-accent">{room.location || 'Prime city location'}</p>
                </div>

                <div className="border-t border-border pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Rate per night:</span>
                    <span className="font-semibold text-foreground">{formatPrice(room.price)}</span>
                  </div>

                  {checkInDate && checkOutDate && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Number of nights:
                        </span>
                        <span className="font-semibold text-foreground">
                          {Math.max(1, differenceInDays(new Date(checkOutDate), new Date(checkInDate)))}
                        </span>
                      </div>

                      <div className="border-t border-border pt-2 flex justify-between">
                        <span className="font-semibold text-foreground">Total Price:</span>
                        <span className="text-lg font-bold text-accent">
                          {formatPrice(totalPrice)}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                <div className="bg-muted/50 p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    No charges yet. You will be prompted to pay on the next page.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
