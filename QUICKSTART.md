# HotelHub - Quick Start Guide

## 🚀 Getting Started (5 Minutes)

### 1. Start the Dev Server
The development server is already running at `http://localhost:3000`

If you need to restart it:
```bash
pnpm dev
```

### 2. Setup Your Admin Account
Open your browser and go to:
```
http://localhost:3000/setup
```

This page will:
- Create your admin user account
- Add 4 sample hotel rooms to your database
- Display your login credentials

**Default Admin Credentials** (after setup):
- Email: `admin@hotelhub.com`
- Password: `Admin123!`

### 3. Access the Admin Dashboard
1. Go to `http://localhost:3000/auth/login`
2. Login with your admin credentials
3. Click "Admin" in the top navigation
4. Or visit: `http://localhost:3000/admin`

## 📊 Admin Dashboard Features

### Dashboard Overview
- Total rooms count
- Total bookings count
- Total revenue
- Pending vs confirmed bookings
- Recent bookings list

### Navigation Menu (Left Sidebar)
- 🏠 **Dashboard** - Overview and metrics
- 🛏️ **Rooms** - Manage hotel rooms
- 📅 **Bookings** - View customer reservations
- 👥 **Staff** - Manage employees
- 📄 **Invoices** - Track payments
- 📊 **Reports** - Analytics & insights

## 🏨 Managing Hotel Details

### Add/Edit Hotel Rooms
1. Go to **Admin > Rooms**
2. Click "Add New Room"
3. Fill in room details:
   - Room name (e.g., "Deluxe Single Room")
   - Room type (single, double, suite, penthouse)
   - Price per night
   - Capacity (number of guests)
   - Description
   - Amenities (Wi-Fi, AC, TV, etc.)
   - Number of rooms available

### Add Hotel Staff
1. Go to **Admin > Staff**
2. Click "Add New Staff Member"
3. Fill in staff details:
   - Name
   - Email
   - Role (front-desk, housekeeping, maintenance, manager)
   - Contact information

### View & Manage Bookings
1. Go to **Admin > Bookings**
2. View all customer reservations
3. Filter by status (pending, confirmed, cancelled)
4. Update booking status as needed

### Track Revenue & Invoices
1. Go to **Admin > Invoices**
2. View all payment records
3. Filter by status
4. See invoice details and amounts

### View Reports & Analytics
1. Go to **Admin > Reports**
2. View monthly and yearly analytics
3. See key metrics:
   - Total revenue
   - Average booking value
   - Occupancy rate
   - Number of bookings
   - Total rooms managed

## 👤 Customer Features

### Browse Hotels
1. Go to home page: `http://localhost:3000`
2. View available rooms
3. Search by name or description
4. Filter by room type

### Make a Booking
1. Click "Sign In to Book" (or login first)
2. Go to home page and click "Book Now"
3. Select check-in and check-out dates
4. Enter guest information
5. Review booking details

### Pay & Confirm
1. Proceed to checkout
2. Review booking summary
3. Process payment (demo/test mode)
4. Receive confirmation

### Manage Your Bookings
1. Go to **Dashboard** (after login)
2. View your bookings
3. See booking details and status
4. Download invoices

## 🔑 Key URLs

| Page | URL |
|------|-----|
| Home | `http://localhost:3000` |
| Setup | `http://localhost:3000/setup` |
| Login | `http://localhost:3000/auth/login` |
| Sign Up | `http://localhost:3000/auth/signup` |
| Customer Dashboard | `http://localhost:3000/dashboard` |
| Admin Dashboard | `http://localhost:3000/admin` |
| Admin Rooms | `http://localhost:3000/admin/rooms` |
| Admin Bookings | `http://localhost:3000/admin/bookings` |
| Admin Staff | `http://localhost:3000/admin/staff` |
| Admin Invoices | `http://localhost:3000/admin/invoices` |
| Admin Reports | `http://localhost:3000/admin/reports` |

## 🧪 Testing Scenarios

### Test Admin Features
1. Create admin account at `/setup`
2. Login and access admin dashboard
3. Add new rooms
4. Add staff members
5. View reports and analytics

### Test Customer Flow
1. Create customer account at `/auth/signup`
2. Go to home page and browse rooms
3. Click "Book Now" on a room
4. Complete booking process
5. View booking in customer dashboard

### Test Admin Can See Customer Bookings
1. Create customer and make a booking
2. Login as admin
3. Go to **Admin > Bookings**
4. See the customer booking listed
5. Update booking status

## 📱 Responsive Design
The app is fully responsive:
- Desktop view on large screens
- Tablet view with optimized layouts
- Mobile view with simplified navigation

Test by resizing your browser window or using DevTools.

## 🛠️ Troubleshooting

### Setup Page Not Loading
- Ensure server is running: `pnpm dev`
- Clear browser cache and refresh
- Check browser console for errors

### Admin Account Creation Failed
- Check Firebase credentials are correct
- Ensure Firestore database is enabled
- Check browser console for detailed error message

### Can't Access Admin Dashboard
- Verify you're logged in as admin
- Check that your account has `role: "admin"` in Firestore
- Clear browser cache and login again

### Sample Rooms Not Showing
- Go to `/setup` page to add sample rooms
- Or manually add rooms via Admin > Rooms

## 📞 Need Help?

Check the following files for detailed information:
- `README.md` - Full project documentation
- `CODE_REVIEW.md` - Code review and architecture
- `.env.example` - Required environment variables

## ✨ What's Included

✅ Complete authentication system (Firebase Auth)
✅ Real-time database (Firebase Firestore)
✅ Admin dashboard with analytics
✅ Room management system
✅ Booking management
✅ Staff management
✅ Invoice tracking
✅ Customer dashboard
✅ Payment integration (Stripe ready)
✅ Responsive design
✅ Role-based access control

**Ready to manage your hotel? Start at `/setup`!** 🎉
