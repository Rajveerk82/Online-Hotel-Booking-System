'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MapPin, Star } from 'lucide-react';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { Navigation } from '@/components/navigation';
import { SiteFooter } from '@/components/site-footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { db } from '@/lib/firebase';
import { Room } from '@/lib/types';
import { formatPrice, getRoomImage } from '@/lib/utils';
import { Input } from '@/components/ui/input';

export default function RoomDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const roomRef = doc(db, 'rooms', roomId);
        const roomSnap = await getDoc(roomRef);

        if (!roomSnap.exists()) {
          setError('Room not found');
          return;
        }

        setRoom({ id: roomSnap.id, ...roomSnap.data() } as Room);
      } catch (err) {
        console.error('Error fetching room details:', err);
        setError('Failed to load room details');
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [roomId]);

  const roomImages = useMemo(() => {
    if (!room) return [];
    const images = Array.isArray(room.images) ? room.images.filter(Boolean) : [];
    return images.length > 0 ? images : [getRoomImage(room.images)];
  }, [room]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="h-10 w-10" />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold">{error || 'Room not found'}</h1>
          <Button className="mt-4" onClick={() => router.push('/')}>
            Back to Home
          </Button>
        </div>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto space-y-10 px-4 py-10">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-4">
            <div className="overflow-hidden rounded-3xl border border-border">
              <img
                src={roomImages[0]}
                alt={room.name}
                className="h-[380px] w-full object-cover"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {roomImages.slice(0, 3).map((image, index) => (
                <div key={`${image}-${index}`} className="overflow-hidden rounded-2xl border border-border">
                  <img src={image} alt={`${room.name} ${index + 1}`} className="h-32 w-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="capitalize">{room.type}</Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {room.location || 'Prime city location'}
                </Badge>
              </div>

              <h1 className="text-4xl font-bold">{room.name}</h1>
              <p className="text-lg text-muted-foreground">{room.description}</p>
              <div className="flex items-center gap-2 text-amber-500">
                <Star className="h-5 w-5 fill-current" />
                <span className="font-semibold">
                  {room.reviews && room.reviews.length > 0
                    ? (room.reviews.reduce((sum, review) => sum + review.rating, 0) / room.reviews.length).toFixed(1)
                    : '4.8'}
                </span>
                <span className="text-sm text-muted-foreground">
                  ({room.reviews?.length || 0} reviews)
                </span>
              </div>
            </div>

            <Card className="rounded-3xl">
              <CardContent className="space-y-4 pt-6">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Price per night</span>
                  <span className="text-2xl font-bold text-accent">{formatPrice(room.price)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Guests</span>
                  <span className="font-semibold">{room.capacity}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Availability</span>
                  <span className="font-semibold">{room.available ? 'Available now' : 'Currently unavailable'}</span>
                </div>
                <Button
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                  onClick={() => router.push(`/booking/${room.id}`)}
                  disabled={!room.available}
                >
                  Book This Room
                </Button>
              </CardContent>
            </Card>

            <Card className="rounded-3xl">
              <CardHeader>
                <CardTitle>Amenities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {(room.amenities || []).map((amenity) => (
                    <Badge key={amenity} variant="outline" className="rounded-full px-3 py-1">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <section className="space-y-5">
          <div>
            <h2 className="text-3xl font-bold">Guest Reviews</h2>
            <p className="text-muted-foreground">See what previous guests liked about this room.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {(room.reviews || []).map((review, index) => (
              <Card key={`${review.name}-${index}`} className="rounded-3xl">
                <CardContent className="space-y-3 pt-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{review.name}</p>
                      <p className="text-sm text-muted-foreground">{review.date}</p>
                    </div>
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="font-semibold">{review.rating}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{review.comment}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="space-y-5">
          <div>
            <h2 className="text-2xl font-bold">Add Your Review</h2>
            <p className="text-muted-foreground">Share your experience for future guests.</p>
          </div>
          <Card className="rounded-3xl">
            <CardContent className="pt-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-foreground">Your Name</label>
                  <Input
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Rating</label>
                  <select
                    value={reviewRating}
                    onChange={(e) => setReviewRating(parseInt(e.target.value))}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {[5,4,3,2,1].map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <label className="text-sm font-medium text-foreground">Comment</label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Write your review..."
                  rows={4}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <Button
                className="mt-4 bg-accent hover:bg-accent/90 text-accent-foreground"
                disabled={submittingReview || !reviewName.trim() || !reviewComment.trim()}
                onClick={async () => {
                  if (!room) return;
                  setSubmittingReview(true);
                  try {
                    const newReview = {
                      name: reviewName.trim(),
                      rating: reviewRating,
                      comment: reviewComment.trim(),
                      date: new Date().toLocaleDateString('en-IN', { dateStyle: 'medium' }),
                    };
                    await updateDoc(doc(db, 'rooms', room.id), {
                      reviews: arrayUnion(newReview),
                    });
                    setRoom({
                      ...room,
                      reviews: [...(room.reviews || []), newReview],
                    });
                    setReviewName('');
                    setReviewRating(5);
                    setReviewComment('');
                  } catch (err) {
                    console.error('Error adding review:', err);
                  } finally {
                    setSubmittingReview(false);
                  }
                }}
              >
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
