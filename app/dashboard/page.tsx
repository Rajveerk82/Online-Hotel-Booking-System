'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Navigation } from '@/components/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Booking, Invoice } from '@/lib/types';
import { Spinner } from '@/components/ui/spinner';
import { format } from 'date-fns';
import { formatPrice, downloadInvoicePDF } from '@/lib/utils';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push('/auth/login');
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch bookings
        const bookingsRef = collection(db, 'bookings');
        const bookingsQuery = query(
          bookingsRef,
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const bookingsSnapshot = await getDocs(bookingsQuery);
        const bookingsData: Booking[] = [];
        bookingsSnapshot.forEach((doc) => {
          bookingsData.push({ id: doc.id, ...doc.data() } as Booking);
        });
        setBookings(bookingsData);

        // Fetch invoices
        const invoicesRef = collection(db, 'invoices');
        const invoicesQuery = query(
          invoicesRef,
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const invoicesSnapshot = await getDocs(invoicesQuery);
        const invoicesData: Invoice[] = [];
        invoicesSnapshot.forEach((doc) => {
          invoicesData.push({ id: doc.id, ...doc.data() } as Invoice);
        });
        setInvoices(invoicesData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, authLoading, router]);

  const handleDownloadInvoice = (invoice: Invoice) => {
    const booking = bookings.find(b => b.id === invoice.bookingId);
    downloadInvoicePDF(invoice, booking);
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="w-12 h-12" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">My Dashboard</h1>
          <p className="text-muted-foreground mt-2">Manage your bookings and invoices</p>
        </div>

        <Tabs defaultValue="bookings" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="bookings">
              Bookings ({bookings.length})
            </TabsTrigger>
            <TabsTrigger value="invoices">
              Invoices ({invoices.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bookings" className="mt-6">
            {bookings.length > 0 ? (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <Card key={booking.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{booking.guestName}</CardTitle>
                          <CardDescription>
                            Booking ID: {booking.id.substring(0, 8)}...
                          </CardDescription>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${
                          booking.status === 'confirmed'
                            ? 'bg-green-100 text-green-800'
                            : booking.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {booking.status}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Check In</p>
                          <p className="font-semibold text-foreground">
                            {format(new Date(booking.checkInDate), 'MMM dd, yyyy')}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Check Out</p>
                          <p className="font-semibold text-foreground">
                            {format(new Date(booking.checkOutDate), 'MMM dd, yyyy')}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Total Price</p>
                          <p className="font-semibold text-foreground">
                            {formatPrice(booking.totalPrice)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Contact</p>
                          <p className="font-semibold text-foreground">{booking.guestEmail}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground mb-4">No bookings yet.</p>
                  <Button
                    onClick={() => router.push('/')}
                    className="bg-accent hover:bg-accent/90 text-accent-foreground"
                  >
                    Browse Rooms
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="invoices" className="mt-6">
            {invoices.length > 0 ? (
              <div className="space-y-4">
                {invoices.map((invoice) => (
                  <Card key={invoice.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>Invoice {invoice.id.substring(0, 8)}</CardTitle>
                          <CardDescription>
                            Issue Date: {format(new Date(invoice.issueDate), 'MMM dd, yyyy')}
                          </CardDescription>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${
                          invoice.status === 'paid'
                            ? 'bg-green-100 text-green-800'
                            : invoice.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {invoice.status}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 items-end">
                        <div>
                          <p className="text-sm text-muted-foreground">Amount</p>
                          <p className="font-semibold text-foreground">
                            {formatPrice(invoice.amount)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Due Date</p>
                          <p className="font-semibold text-foreground">
                            {format(new Date(invoice.dueDate), 'MMM dd, yyyy')}
                          </p>
                        </div>
                        <div className="md:col-start-4">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full"
                            onClick={() => handleDownloadInvoice(invoice)}
                          >
                            Download Invoice
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">No invoices yet.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
