'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, Button } from '@/components/ui';
import { APP_NAME } from '@/lib/constants';
import { Mail, Zap, ChevronLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground gradient-mesh px-4">
      <Card variant="glass" className="w-full max-w-md p-8 border border-border relative overflow-hidden shadow-2xl">
        <div className="text-center space-y-2 mb-8">
          <Link href="/" className="inline-flex items-center gap-2 font-black text-text-primary tracking-tight text-xl">
            <div className="w-8 h-8 rounded-md bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-glow">
              <Zap size={16} />
            </div>
            <span>{APP_NAME}</span>
          </Link>
          <p className="text-[10px] text-accent uppercase tracking-widest font-bold font-mono">
            RECOVER SECURITY KEY
          </p>
        </div>

        {sent ? (
          <div className="space-y-4 text-center">
            <div className="p-3 bg-success-muted text-success text-xs font-bold rounded-md">
              Operations Key recovery link dispatched! Check your email.
            </div>
            <Link href="/login" className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-primary-hover font-semibold">
              <ChevronLeft size={16} /> Return to login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider text-text-secondary font-bold flex items-center gap-1.5">
                <Mail size={12} /> Registered Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@stadium.com"
                className="w-full bg-glass text-xs p-3 rounded-[var(--radius-md)] border border-border focus:border-primary focus:outline-none placeholder:text-text-tertiary"
              />
            </div>

            <Button type="submit" variant="primary" size="md" className="w-full font-bold" loading={loading}>
              Dispatch Recovery Instructions
            </Button>

            <div className="text-center pt-2">
              <Link href="/login" className="inline-flex items-center gap-1 text-xs text-text-secondary hover:text-text-primary font-semibold">
                <ChevronLeft size={14} /> Back to Sign-in
              </Link>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
