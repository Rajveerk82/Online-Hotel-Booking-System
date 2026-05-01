'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, MapPin, Search, Star } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Navigation } from '@/components/navigation';
import { SiteFooter } from '@/components/site-footer';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Room } from '@/lib/types';
import { Spinner } from '@/components/ui/spinner';
import { formatPrice, getRoomImage } from '@/lib/utils';

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const roomsRef = collection(db, 'rooms');
        const q = query(roomsRef, where('available', '==', true));
        const querySnapshot = await getDocs(q);
        const roomsData: Room[] = [];

        querySnapshot.forEach((doc) => {
          roomsData.push({ id: doc.id, ...doc.data() } as Room);
        });

        setRooms(roomsData);
      } catch (error) {
        console.error('Error fetching rooms:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  const locations = useMemo(
    () =>
      Array.from(
        new Set(
          rooms
            .map((room) => room.location?.trim())
            .filter((location): location is string => Boolean(location))
        )
      ),
    [rooms]
  );

  const filteredRooms = useMemo(() => {
    let filtered = rooms;

    if (selectedType !== 'all') {
      filtered = filtered.filter((room) => room.type === selectedType);
    }

    if (selectedLocation !== 'all') {
      filtered = filtered.filter((room) => room.location === selectedLocation);
    }

    if (searchTerm) {
      filtered = filtered.filter((room) =>
        room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [searchTerm, selectedLocation, selectedType, rooms]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />

      <main className="container mx-auto space-y-10 px-4 py-8 md:py-10">
        <section className="overflow-hidden rounded-[2rem] border border-border bg-gradient-to-br from-slate-950 via-slate-900 to-orange-950 text-white shadow-2xl">
          <div className="grid gap-8 px-6 py-8 md:px-10 md:py-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div className="space-y-6 [animation:fadeUp_0.7s_ease-out]">
              <Badge className="w-fit rounded-full bg-white/10 px-4 py-1 text-white hover:bg-white/10 [animation:glowPulse_3s_ease-in-out_infinite]">
                Premium rooms across India
              </Badge>
              <div className="space-y-4">
                <h1 className="max-w-3xl text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
                  Book stylish hotel stays with real photos and a smoother search experience.
                </h1>
                <p className="max-w-2xl text-base leading-7 text-slate-200 sm:text-lg">
                  Discover verified rooms, compare comfort and location, read guest reviews, and reserve faster without confusion.
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                <Button
                  size="lg"
                  className="bg-accent text-accent-foreground transition-transform duration-300 hover:scale-105 hover:bg-accent/90"
                  onClick={() => document.getElementById('browse-rooms')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Explore Rooms
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/20 bg-transparent text-white transition-transform duration-300 hover:scale-105 hover:bg-white/10 hover:text-white"
                  onClick={() => router.push(user ? '/dashboard' : '/auth/login')}
                >
                  {user ? 'Open Dashboard' : 'Sign In'}
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur transition-transform duration-300 hover:-translate-y-1">
                  <p className="text-2xl font-bold">{rooms.length}+</p>
                  <p className="text-sm text-slate-300">Rooms ready to book</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur transition-transform duration-300 hover:-translate-y-1">
                  <p className="text-2xl font-bold">{locations.length || 4}+</p>
                  <p className="text-sm text-slate-300">Popular destinations</p>
                </div>
                <div className="col-span-2 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur transition-transform duration-300 hover:-translate-y-1 sm:col-span-1">
                  <p className="text-2xl font-bold">24/7</p>
                  <p className="text-sm text-slate-300">Customer assistance</p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 [animation:fadeUp_0.95s_ease-out] sm:grid-cols-2 lg:grid-cols-1">
              {rooms.slice(0, 2).map((room) => (
                <div
                  key={room.id}
                  className="overflow-hidden rounded-3xl border border-white/10 bg-white/10 shadow-lg backdrop-blur transition-all duration-500 hover:-translate-y-2 hover:bg-white/15"
                >
                  <div className="relative">
                    <img
                      src={getRoomImage(room.images)}
                      alt={room.name}
                      className="h-48 w-full object-cover transition-transform duration-700 hover:scale-105"
                    />
                    <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3">
                      <Badge className="bg-black/45 text-white capitalize hover:bg-black/45">
                        {room.type}
                      </Badge>
                      <Badge className="bg-white text-slate-950 hover:bg-white">
                        {formatPrice(room.price)}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-2 p-4">
                    <p className="text-lg font-semibold">{room.name}</p>
                    <p className="flex items-center gap-1 text-sm text-slate-200">
                      <MapPin className="h-4 w-4" />
                      {room.location || 'Prime location'}
                    </p>
                    <p className="line-clamp-2 text-sm text-slate-300">
                      {room.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-border bg-card p-5 shadow-sm [animation:fadeUp_1.1s_ease-out]">
          <div className="mb-4 flex flex-col gap-1">
            <p className="text-sm font-medium text-accent">Search rooms</p>
            <h2 className="text-2xl font-bold text-foreground">Find the right room in a few seconds</h2>
          </div>
          <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr_0.8fr]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by room name, description, or city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-11 rounded-xl pl-9"
              />
            </div>

            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="all">All Locations</option>
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="all">All Room Types</option>
              {['single', 'double', 'suite', 'penthouse'].map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </section>

        <section id="browse-rooms" className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium text-accent">Featured stays</p>
              <h2 className="text-3xl font-bold">Explore stays by comfort, style, and location</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              {filteredRooms.length} room{filteredRooms.length === 1 ? '' : 's'} found
            </p>
          </div>
        </section>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Spinner className="w-10 h-10" />
          </div>
        ) : filteredRooms.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredRooms.map((room) => (
              <Card key={room.id} className="overflow-hidden rounded-[1.75rem] border-border/80 pt-0 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl">
                <div className="relative">
                  <img
                    src={getRoomImage(room.images)}
                    alt={room.name}
                    className="h-56 w-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                  <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
                    <Badge className="bg-black/60 text-white hover:bg-black/60">
                      {room.type}
                    </Badge>
                    <Badge className="bg-white text-slate-950 hover:bg-white">
                      {formatPrice(room.price)}/night
                    </Badge>
                  </div>
                </div>

                <CardHeader className="space-y-3 pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-xl">{room.name}</CardTitle>
                      <CardDescription className="mt-1 flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {room.location || 'Prime city location'}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-1 text-sm font-medium text-amber-500">
                      <Star className="h-4 w-4 fill-current" />
                      4.8
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pb-3">
                  <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">{room.description}</p>

                  <div className="mb-4 grid grid-cols-2 gap-3 rounded-2xl bg-muted/50 p-3">
                    <div className="text-sm">
                      <p className="font-semibold text-foreground">Capacity</p>
                      <span className="text-muted-foreground">{room.capacity} guests</span>
                    </div>
                    <div className="text-sm">
                      <p className="font-semibold text-foreground">Location</p>
                      <span className="text-muted-foreground">{room.location || 'City center'}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="mb-2 text-sm font-semibold text-foreground">Amenities:</p>
                    <div className="flex flex-wrap gap-1">
                      {(room.amenities || []).slice(0, 3).map((amenity) => (
                        <Badge key={amenity} variant="outline" className="rounded-full text-xs">
                          {amenity}
                        </Badge>
                      ))}
                      {(room.amenities || []).length > 3 && (
                        <Badge variant="outline" className="rounded-full text-xs">
                          +{(room.amenities || []).length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="flex">
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/rooms/${room.id}`)}
                    className="h-11 w-full rounded-xl"
                  >
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="rounded-3xl border-dashed">
            <CardContent className="py-14 text-center">
              <h3 className="text-xl font-semibold">No rooms matched your filters</h3>
              <p className="mt-2 text-muted-foreground">
                Try another city, room type, or search keyword to find the best stay.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedType('all');
                  setSelectedLocation('all');
                }}
              >
                Reset Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
      <SiteFooter />
      <style jsx>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes glowPulse {
          0%, 100% {
            box-shadow: 0 0 0 rgba(255, 255, 255, 0);
          }
          50% {
            box-shadow: 0 0 22px rgba(255, 255, 255, 0.14);
          }
        }
      `}</style>
    </div>
  );
}
