'use client';

import Link from 'next/link';
import { Mail, MapPin, Phone } from 'lucide-react';

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-background">
      <div className="container mx-auto px-4 py-10">
        <div className="overflow-hidden rounded-[2rem] border border-border/70 bg-card shadow-sm [animation:fadeUp_0.9s_ease-out]">
          <div className="grid gap-8 px-6 py-8 md:px-8 lg:grid-cols-[1.15fr_0.75fr_0.9fr]">
            <div className="space-y-5">
              <div className="space-y-2">
                <h4 className="text-xl font-bold text-foreground">Online Hotel Booking System</h4>
                <p className="max-w-md text-sm leading-6 text-muted-foreground">
                  Modern hotel booking with clear room photos, honest guest reviews, and a faster reservation flow.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-border bg-background/70 p-4 transition-transform duration-300 hover:-translate-y-1">
                  <p className="text-base font-semibold text-foreground">Clear Images</p>
                  <p className="mt-1 text-sm text-muted-foreground">Preview rooms with better visual confidence.</p>
                </div>
                <div className="rounded-2xl border border-border bg-background/70 p-4 transition-transform duration-300 hover:-translate-y-1">
                  <p className="text-base font-semibold text-foreground">Verified Reviews</p>
                  <p className="mt-1 text-sm text-muted-foreground">Check what other guests really experienced.</p>
                </div>
                <div className="rounded-2xl border border-border bg-background/70 p-4 transition-transform duration-300 hover:-translate-y-1">
                  <p className="text-base font-semibold text-foreground">Quick Booking</p>
                  <p className="mt-1 text-sm text-muted-foreground">Move from discovery to confirmation smoothly.</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-base font-semibold text-foreground">Quick Links</h4>
              <div className="grid gap-2 text-sm">
                <Link href="/" className="rounded-xl px-3 py-2 text-muted-foreground transition hover:bg-muted hover:text-foreground">
                  Home
                </Link>
                <Link href="/" className="rounded-xl px-3 py-2 text-muted-foreground transition hover:bg-muted hover:text-foreground">
                  Browse Rooms
                </Link>
                <Link href="/dashboard" className="rounded-xl px-3 py-2 text-muted-foreground transition hover:bg-muted hover:text-foreground">
                  Dashboard
                </Link>
                <Link href="/auth/login" className="rounded-xl px-3 py-2 text-muted-foreground transition hover:bg-muted hover:text-foreground">
                  Login
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-base font-semibold text-foreground">Contact</h4>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-3 rounded-2xl border border-border bg-background/70 px-4 py-3 transition-colors duration-300 hover:bg-muted/60">
                  <MapPin className="h-4 w-4 text-accent" />
                  <span>Mumbai, India</span>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-border bg-background/70 px-4 py-3 transition-colors duration-300 hover:bg-muted/60">
                  <Mail className="h-4 w-4 text-accent" />
                  <span>support@onlinehotelbookingsystem.com</span>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-border bg-background/70 px-4 py-3 transition-colors duration-300 hover:bg-muted/60">
                  <Phone className="h-4 w-4 text-accent" />
                  <span>+91 98765 43210</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-border px-6 py-4 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between md:px-8">
            <p>© {new Date().getFullYear()} Online Hotel Booking System. All rights reserved.</p>
            <div className="flex gap-4">
              <Link href="/" className="transition hover:text-foreground">
                Privacy
              </Link>
              <Link href="/" className="transition hover:text-foreground">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </footer>
  );
}
