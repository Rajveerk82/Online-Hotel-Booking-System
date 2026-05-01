import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
}

export function getRoomImage(images?: string[]): string {
  const validImages = Array.isArray(images)
    ? images.filter((image) => typeof image === 'string' && image.trim() !== '')
    : [];

  return (
    validImages[0] ||
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'
  );
}

export function downloadInvoicePDF(invoice: any, booking?: any) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const invoiceHtml = `
    <html>
      <head>
        <title>Invoice - ${invoice.id.substring(0, 8)}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; margin: 0; padding: 40px; }
          .invoice-box { max-width: 800px; margin: auto; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0, 0, 0, 0.15); padding: 30px; border-radius: 10px; background: #fff; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #f97316; padding-bottom: 20px; margin-bottom: 20px; }
          .logo { font-size: 28px; font-weight: bold; color: #f97316; }
          .status-paid { color: #16a34a; font-weight: bold; text-transform: uppercase; border: 2px solid #16a34a; padding: 5px 10px; border-radius: 5px; }
          .details { display: flex; justify-content: space-between; margin-bottom: 40px; }
          .details div { line-height: 1.6; }
          table { width: 100%; line-height: inherit; text-align: left; border-collapse: collapse; }
          table th { background: #fdf2f8; padding: 12px; border-bottom: 1px solid #eee; font-weight: bold; }
          table td { padding: 12px; border-bottom: 1px solid #eee; }
          .total { margin-top: 30px; text-align: right; font-size: 20px; font-weight: bold; color: #f97316; }
          .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #777; border-top: 1px solid #eee; padding-top: 20px; }
          @media print {
            body { padding: 0; }
            .invoice-box { box-shadow: none; border: none; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="invoice-box">
          <div class="header">
            <div class="logo">Online Hotel Booking System</div>
            <div class="status-paid">${invoice.status}</div>
          </div>
          
          <div class="details">
            <div>
              <strong>From:</strong><br>
              Online Hotel Booking System<br>
              123 Luxury Lane, Mumbai<br>
              Maharashtra, India<br>
              support@onlinehotelbookingsystem.com
            </div>
            <div style="text-align: right;">
              <strong>Invoice ID:</strong> ${invoice.id.toUpperCase()}<br>
              <strong>Date:</strong> ${new Date(invoice.issueDate).toLocaleDateString('en-IN', { dateStyle: 'long' })}<br>
              <strong>Booking ID:</strong> ${invoice.bookingId.substring(0, 8).toUpperCase()}
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Room Booking Charges ${booking ? `(${booking.guestName})` : ''}</td>
                <td style="text-align: right;">${formatPrice(invoice.amount)}</td>
              </tr>
              <tr>
                <td>Taxes & Fees</td>
                <td style="text-align: right;">${formatPrice(0)}</td>
              </tr>
            </tbody>
          </table>

          <div class="total">
            Total Amount Paid: ${formatPrice(invoice.amount)}
          </div>

          <div class="footer">
            <p>This is a computer-generated invoice and does not require a signature.</p>
            <p>&copy; ${new Date().getFullYear()} Online Hotel Booking System. All rights reserved.</p>
          </div>
        </div>
        <script>
          window.onload = () => {
            window.print();
            setTimeout(() => window.close(), 500);
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(invoiceHtml);
  printWindow.document.close();
}
