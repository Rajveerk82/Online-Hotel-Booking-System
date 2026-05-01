# HotelHub - Hotel Management System

A modern, full-featured hotel management platform built with Next.js, Firebase, and Stripe. HotelHub provides a seamless booking experience for customers and comprehensive management tools for hotel administrators.

## Features

### Customer Features
- **Room Browsing**: Search and filter available rooms by type and amenities
- **Booking System**: Easy multi-step booking with date selection and guest information
- **Payment Processing**: Secure checkout with Stripe integration
- **Booking Confirmation**: Instant confirmations and receipts
- **Customer Dashboard**: View active bookings and invoices
- **User Authentication**: Secure registration and login

### Admin Features
- **Dashboard Analytics**: Real-time insights into revenue, occupancy, and booking metrics
- **Room Management**: Add, edit, and manage hotel rooms with amenities
- **Booking Management**: Monitor all bookings with status filtering and updates
- **Staff Management**: Manage staff members with different roles (front-desk, housekeeping, maintenance, manager)
- **Invoice Management**: Track and manage payment records
- **Reports & Analytics**: Monthly and yearly revenue analysis with detailed metrics

## Tech Stack

- **Frontend**: Next.js 16, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Authentication**: Firebase Authentication
- **Database**: Firebase Firestore
- **Storage**: Firebase Storage
- **Payments**: Stripe
- **Deployment**: Vercel

## Prerequisites

- Node.js 18+ 
- pnpm (or npm/yarn)
- Firebase account with a project configured
- Stripe account (for payment processing)

## Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/hotelhub.git
cd hotelhub
```

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory with your Firebase and Stripe credentials:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Stripe Configuration (Server-side only)
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

**Note**: The Firebase credentials are already configured in `lib/firebase.ts`. You only need to add Stripe keys if you want to enable payments.

### 4. Run the Development Server
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
├── app/
│   ├── admin/                    # Admin dashboard pages
│   │   ├── layout.tsx           # Admin layout with sidebar
│   │   ├── page.tsx             # Dashboard overview
│   │   ├── rooms/               # Room management
│   │   ├── bookings/            # Booking management
│   │   ├── staff/               # Staff management
│   │   ├── invoices/            # Invoice management
│   │   └── reports/             # Analytics & reports
│   ├── auth/                     # Authentication pages
│   │   ├── login/
│   │   └── signup/
│   ├── booking/                  # Booking flow
│   ├── checkout/                 # Payment checkout
│   ├── dashboard/                # Customer dashboard
│   ├── page.tsx                  # Home page with room browsing
│   └── layout.tsx                # Root layout
├── components/
│   ├── navigation.tsx            # Main navigation bar
│   ├── admin-sidebar.tsx         # Admin sidebar navigation
│   └── ui/                       # shadcn/ui components
├── lib/
│   ├── firebase.ts              # Firebase configuration
│   ├── auth-context.tsx         # Authentication context
│   ├── types.ts                 # TypeScript type definitions
│   └── utils.ts                 # Utility functions
└── public/                       # Static assets

```

## Database Schema

### Collections

**users**
```
{
  uid: string (Firebase UID)
  email: string
  displayName: string
  role: 'customer' | 'staff' | 'admin'
  createdAt: timestamp
}
```

**rooms**
```
{
  id: string
  name: string
  type: 'single' | 'double' | 'suite' | 'penthouse'
  price: number (per night)
  capacity: number
  description: string
  amenities: string[]
  available: boolean
  imageUrl: string (optional)
  createdAt: timestamp
}
```

**bookings**
```
{
  id: string
  userId: string
  roomId: string
  checkInDate: date
  checkOutDate: date
  guestName: string
  email: string
  phone: string
  totalPrice: number
  status: 'pending' | 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled'
  createdAt: timestamp
}
```

**invoices**
```
{
  id: string
  bookingId: string
  userId: string
  amount: number
  status: 'pending' | 'paid' | 'cancelled'
  dueDate: date
  paidDate: date (optional)
  createdAt: timestamp
}
```

**staff**
```
{
  id: string
  name: string
  email: string
  phone: string
  role: 'front-desk' | 'housekeeping' | 'maintenance' | 'manager'
  joinDate: date
  status: 'active' | 'inactive'
  createdAt: timestamp
}
```

## Adding Hotel Data

### Option 1: Using Admin Dashboard
1. Sign up and log in
2. Navigate to `/admin`
3. Use the **Rooms** section to add your hotel rooms
4. Use the **Staff** section to add staff members

### Option 2: Manual Data Entry
Add documents directly to your Firebase Firestore console.

## Authentication

The app uses Firebase Authentication with email/password. 

**Default Admin Setup**: Create a user account and manually set the `role` field to `'admin'` in the Firebase Firestore `users` collection to enable admin access.

## Stripe Integration

To enable payments:

1. Get your API keys from [Stripe Dashboard](https://dashboard.stripe.com/)
2. Add them to `.env.local`
3. Implement webhook handlers in `app/api/webhooks/stripe/` (currently simulated)

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your GitHub repository
4. Add environment variables in the Vercel dashboard
5. Deploy

```bash
vercel deploy
```

### Deploy to Render

1. Create a [Render](https://render.com/) account.
2. Connect your GitHub repository.
3. Select **Web Service** and choose this repository.
4. Set the following configuration:
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
5. Add all the Firebase environment variables from your `.env.local` to the **Environment** section in Render dashboard.
6. Click **Deploy Web Service**.

Alternatively, you can use the `render.yaml` file included in this repository to automate the setup via Render's **Blueprint** feature.

### Deploy to Other Platforms

The app is compatible with any Node.js hosting (Railway, Render, etc.). Ensure you add the same environment variables.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues or questions, please open an issue on GitHub or contact support.

## Roadmap

- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Advanced reporting features
- [ ] Guest reviews and ratings
- [ ] Email notifications
- [ ] SMS notifications
- [ ] Integration with third-party booking platforms

---

**Built with ❤️ using Next.js and Firebase**
"# HotelHub" 
"# HotelHub" 
"# HotelHub" 
"# HotelHub" 
#   H o t e l H u b  
 #   H o t e l H u b  
 #   H o t e l H u b  
 #   H o t e l H u b  
 "# HotelHub" 
"# HotelHub" 
#   H o t e l H u b  
 