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
import { doc, getDoc, updateDoc, addDoc, collection } from 'firebase/firestore';
import { Booking, Invoice } from '@/lib/types';
import { Spinner } from '@/components/ui/spinner';
import { format } from 'date-fns';
import { formatPrice } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function CheckoutPage() {
  const router = useRouter();
  const params = useParams();
  const bookingId = params.bookingId as string;
  const { user, loading: authLoading } = useAuth();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'qr'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [utr, setUtr] = useState('');
  const [qrAttempt, setQrAttempt] = useState(0);

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
          // Generate a fake QR code URL for the demo
          setQrCodeData(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=rajveer8283@ptyes%26pn=OnlineHotelBookingSystem%26am=${bookingData.totalPrice}%26cu=INR%26tn=Booking_${bookingId.substring(0, 8)}`);
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

  const handlePayment = async (method: 'card' | 'qr') => {
    if (method === 'card' && (!cardNumber || !expiryDate || !cvv)) {
      setError('Please fill in all card details');
      return;
    }

    if (method === 'qr' && !utr) {
      setError('Please enter the UPI Transaction ID (UTR)');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      if (method === 'qr' && qrAttempt === 0) {
        setQrAttempt(1);
        throw new Error('Invalid UPI Transaction ID or payment not yet received. Please check and try again.');
      }

      // For this demo, we'll simulate a successful payment
      const paymentId = method === 'card' 
        ? `pi_${Math.random().toString(36).substr(2, 9)}`
        : `upi_${utr}`;

      // Update booking status
      await updateDoc(doc(db, 'bookings', bookingId), {
        status: 'confirmed',
        stripePaymentId: paymentId,
      });

      // Create invoice
      const invoiceData: Omit<Invoice, 'id'> = {
        bookingId,
        userId: user!.uid,
        amount: booking!.totalPrice,
        issueDate: new Date().toISOString(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'paid',
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, 'invoices'), invoiceData);

      router.push(`/booking-confirmation/${bookingId}`);
    } catch (err: any) {
      setError(err.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    handlePayment('card');
  };

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
        <h1 className="text-3xl font-bold text-foreground mb-8">Complete Payment</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
                <CardDescription>Choose how you want to pay for your stay</CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <div className="p-3 mb-4 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
                    {error}
                  </div>
                )}

                <Tabs defaultValue="card" onValueChange={(v) => setPaymentMethod(v as 'card' | 'qr')}>
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="card">Credit/Debit Card</TabsTrigger>
                    <TabsTrigger value="qr">UPI / QR Code</TabsTrigger>
                  </TabsList>

                  <TabsContent value="card">
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <FieldGroup>
                        <label className="text-sm font-medium text-foreground">Card Number</label>
                        <Input
                          type="text"
                          placeholder="1234 5678 9012 3456"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                          maxLength={19}
                          required
                          disabled={processing}
                        />
                        <p className="text-xs text-muted-foreground mt-1">For demo: Use 4242 4242 4242 4242</p>
                      </FieldGroup>

                      <div className="grid grid-cols-2 gap-4">
                        <FieldGroup>
                          <label className="text-sm font-medium text-foreground">Expiry Date</label>
                          <Input
                            type="text"
                            placeholder="MM/YY"
                            value={expiryDate}
                            onChange={(e) => setExpiryDate(e.target.value)}
                            maxLength={5}
                            required
                            disabled={processing}
                          />
                        </FieldGroup>

                        <FieldGroup>
                          <label className="text-sm font-medium text-foreground">CVV</label>
                          <Input
                            type="text"
                            placeholder="123"
                            value={cvv}
                            onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                            maxLength={4}
                            required
                            disabled={processing}
                          />
                        </FieldGroup>
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                        disabled={processing}
                      >
                        {processing ? 'Processing...' : `Pay ${formatPrice(booking.totalPrice)}`}
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="qr">
                    <div className="flex flex-col items-center justify-center space-y-6 py-4">
                      <div className="bg-white p-4 rounded-xl border-2 border-muted shadow-sm">
                        {qrCodeData ? (
                          <img src={qrCodeData} alt="UPI Payment QR Code" className="w-48 h-48" />
                        ) : (
                          <div className="w-48 h-48 bg-muted animate-pulse rounded-lg" />
                        )}
                      </div>
                      
                      <div className="text-center space-y-2">
                        <p className="font-semibold text-lg">Scan to Pay with UPI</p>
                        <p className="text-sm text-muted-foreground px-8">
                          Scan the QR code using any UPI app like GPay, PhonePe, or Paytm to complete your payment of {formatPrice(booking.totalPrice)}.
                        </p>
                      </div>

                      <div className="w-full space-y-4">
                        <FieldGroup>
                          <label className="text-sm font-medium text-foreground">Transaction ID (UTR)</label>
                          <Input
                            type="text"
                            placeholder="Enter 12-digit UTR number"
                            value={utr}
                            onChange={(e) => setUtr(e.target.value.replace(/\D/g, '').slice(0, 12))}
                            required
                            disabled={processing}
                          />
                        </FieldGroup>

                        <Button
                          onClick={() => handlePayment('qr')}
                          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                          disabled={processing}
                        >
                          {processing 
                            ? (qrAttempt === 0 ? 'Verifying Payment...' : 'Checking Again...') 
                            : (qrAttempt === 0 ? 'I have completed the payment' : 'Re-verify Payment')}
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                <p className="text-xs text-center text-muted-foreground mt-4">
                  Your payment information is secure and encrypted.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Guest:</span>
                    <span className="font-semibold text-foreground">{booking.guestName}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Check-In:</span>
                    <span className="font-semibold text-foreground">
                      {format(new Date(booking.checkInDate), 'MMM dd')}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Check-Out:</span>
                    <span className="font-semibold text-foreground">
                      {format(new Date(booking.checkOutDate), 'MMM dd')}
                    </span>
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span className="font-semibold text-foreground">
                      {formatPrice(booking.totalPrice)}
                    </span>
                  </div>

                  <div className="flex justify-between mb-4">
                    <span className="text-muted-foreground">Tax:</span>
                    <span className="font-semibold text-foreground">{formatPrice(0)}</span>
                  </div>

                  <div className="border-t border-border pt-4 flex justify-between">
                    <span className="font-semibold text-foreground">Total:</span>
                    <span className="text-lg font-bold text-accent">
                      {formatPrice(booking.totalPrice)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
