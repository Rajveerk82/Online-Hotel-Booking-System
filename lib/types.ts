export interface Room {
  id: string;
  name: string;
  type: 'single' | 'double' | 'suite' | 'penthouse';
  description: string;
  price: number;
  capacity: number;
  amenities: string[];
  images: string[];
  available: boolean;
  createdAt: string;
}

export interface Booking {
  id: string;
  userId: string;
  roomId: string;
  checkInDate: string;
  checkOutDate: string;
  guestName: string;
  guestEmail: string;
  phoneNumber: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  stripePaymentId?: string;
  createdAt: string;
}

export interface Invoice {
  id: string;
  bookingId: string;
  userId: string;
  amount: number;
  issueDate: string;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue';
  createdAt: string;
}

export interface Staff {
  id: string;
  name: string;
  email: string;
  role: 'front-desk' | 'housekeeping' | 'maintenance' | 'manager';
  phone: string;
  salary: number;
  startDate: string;
  status: 'active' | 'inactive';
  createdAt: string;
}
