'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { db } from '@/lib/firebase';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { Invoice } from '@/lib/types';
import { format } from 'date-fns';
import { formatPrice, downloadInvoicePDF } from '@/lib/utils';

export default function InvoicesManagement() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'paid' | 'overdue'>('all');

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'invoices'));
        const invoicesData: Invoice[] = [];
        snapshot.forEach((doc) => {
          invoicesData.push({ id: doc.id, ...doc.data() } as Invoice);
        });

        // Sort by date descending
        invoicesData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        setInvoices(invoicesData);
        setFilteredInvoices(invoicesData);
      } catch (error) {
        console.error('Error fetching invoices:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  useEffect(() => {
    let filtered = invoices;

    if (filterStatus !== 'all') {
      filtered = filtered.filter((inv) => inv.status === filterStatus);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (inv) =>
          inv.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          inv.bookingId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredInvoices(filtered);
  }, [searchTerm, filterStatus, invoices]);

  const handleUpdateStatus = async (invoiceId: string, newStatus: Invoice['status']) => {
    try {
      await updateDoc(doc(db, 'invoices', invoiceId), {
        status: newStatus,
      });

      setInvoices(
        invoices.map((inv) =>
          inv.id === invoiceId ? { ...inv, status: newStatus } : inv
        )
      );
    } catch (error) {
      console.error('Error updating invoice:', error);
    }
  };

  const handleDownloadInvoice = (invoice: Invoice) => {
    downloadInvoicePDF(invoice);
  };

  const totalRevenue = invoices
    .filter((inv) => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const pendingAmount = invoices
    .filter((inv) => inv.status !== 'paid')
    .reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <div className="flex-1 p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Invoices Management</h1>
        <p className="text-muted-foreground mt-1">Track and manage all invoices</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatPrice(totalRevenue)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {formatPrice(pendingAmount)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {invoices.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        <Input
          placeholder="Search by invoice or booking ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />

        <div className="flex gap-2 flex-wrap">
          {(['all', 'pending', 'paid', 'overdue'] as const).map((status) => (
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

      {/* Invoices List */}
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading invoices...</div>
      ) : filteredInvoices.length > 0 ? (
        <div className="space-y-4">
          {filteredInvoices.map((invoice) => (
            <Card key={invoice.id}>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {/* Invoice Info */}
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Invoice ID</p>
                    <p className="font-semibold text-foreground font-mono text-sm">
                      {invoice.id.substring(0, 8)}...
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">Booking ID</p>
                    <p className="font-semibold text-foreground font-mono text-sm">
                      {invoice.bookingId.substring(0, 8)}...
                    </p>
                  </div>

                  {/* Dates */}
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Issue Date</p>
                    <p className="font-semibold text-foreground">
                      {format(new Date(invoice.issueDate), 'MMM dd, yyyy')}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">Due Date</p>
                    <p className="font-semibold text-foreground">
                      {format(new Date(invoice.dueDate), 'MMM dd, yyyy')}
                    </p>
                  </div>

                  {/* Amount */}
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Amount</p>
                    <p className="font-semibold text-foreground text-lg">
                      {formatPrice(invoice.amount)}
                    </p>
                  </div>

                  {/* Status */}
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Status</p>
                    <Badge
                      className={
                        invoice.status === 'paid'
                          ? 'bg-green-100 text-green-800'
                          : invoice.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }
                    >
                      {invoice.status}
                    </Badge>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownloadInvoice(invoice)}
                    >
                      Download
                    </Button>
                    {invoice.status !== 'paid' && (
                      <Button
                        size="sm"
                        onClick={() => handleUpdateStatus(invoice.id, 'paid')}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        Mark Paid
                      </Button>
                    )}
                    {invoice.status !== 'overdue' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateStatus(invoice.id, 'overdue')}
                      >
                        Mark Overdue
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
            <p className="text-muted-foreground">No invoices found.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
