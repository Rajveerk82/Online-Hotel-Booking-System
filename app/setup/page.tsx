'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';

export default function SetupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@hotelhub.com');
  const [password, setPassword] = useState('Admin123!');
  const [displayName, setDisplayName] = useState('Admin User');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      // Create user in Firebase Auth
      const result = await createUserWithEmailAndPassword(auth, email, password);

      // Create user profile in Firestore with admin role
      const userProfile = {
        uid: result.user.uid,
        email,
        displayName,
        role: 'admin',
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'users', result.user.uid), userProfile);

      // Create sample rooms
      const sampleRooms = [
        {
          name: 'Deluxe Single Room',
          type: 'single',
          description: 'Cozy room perfect for solo travelers',
          price: 2500,
          capacity: 1,
          amenities: ['Free Wi-Fi', 'Air Conditioning', '32" Smart TV', 'Premium Bedding'],
          available: true,
          totalRooms: 5,
        },
        {
          name: 'Double Room',
          type: 'double',
          description: 'Comfortable room for couples or small families',
          price: 4500,
          capacity: 2,
          amenities: ['Free Wi-Fi', 'Air Conditioning', 'Flat-screen TV', 'Mini Bar', 'Work Desk'],
          available: true,
          totalRooms: 8,
        },
        {
          name: 'Luxury Suite',
          type: 'suite',
          description: 'Spacious suite with separate living area',
          price: 8500,
          capacity: 3,
          amenities: ['Free Wi-Fi', 'Air Conditioning', 'Flat-screen TV', 'Mini Bar', 'Hot Tub', 'Work Desk', 'Sofa'],
          available: true,
          totalRooms: 4,
        },
        {
          name: 'Penthouse Suite',
          type: 'penthouse',
          description: 'Premium penthouse with panoramic city views',
          price: 15000,
          capacity: 4,
          amenities: ['Free Wi-Fi', 'Air Conditioning', '55" Smart TV', 'Full Bar', 'Jacuzzi', 'Conference Table', 'Private Balcony', 'Butler Service'],
          available: true,
          totalRooms: 2,
        },
      ];

      // Add sample rooms to Firestore
      const roomsRef = await Promise.all(
        sampleRooms.map(async (room) => {
          const docRef = doc(db, 'rooms', `${room.type}_${Date.now()}`);
          await setDoc(docRef, room);
        })
      );

      setMessage('✓ Admin account created successfully!');
      setMessage((prev) => prev + '\n✓ Sample rooms added to database!');
      setMessage((prev) => prev + '\n\nAdmin Credentials:\nEmail: ' + email + '\nPassword: ' + password);
      setMessage((prev) => prev + '\n\nRedirecting to login...');
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
    } catch (error: any) {
      console.error('Error creating admin:', error);
      
      if (error.code === 'auth/email-already-in-use') {
        setMessage('Note: Admin account already exists.\n\nIt seems the setup has already been completed. You can use your existing credentials to log in.');
        setMessage((prev) => prev + '\n\nAdmin Credentials:\nEmail: ' + email + '\nPassword: (Your existing password)');
        setMessage((prev) => prev + '\n\nRedirecting to login...');
        setTimeout(() => {
          router.push('/auth/login');
        }, 5000);
      } else {
        setError(error.message || 'Failed to create admin account');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>HotelHub Setup</CardTitle>
          <CardDescription>Create your first admin account</CardDescription>
        </CardHeader>

        <CardContent>
          {message ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 whitespace-pre-wrap text-sm font-mono">{message}</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  type="text"
                  placeholder="Admin User"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@hotelhub.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner className="w-4 h-4 mr-2" />
                    Creating Admin Account...
                  </>
                ) : (
                  'Create Admin Account'
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                This will also add sample rooms to your database.
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
