'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, Button, Badge } from '@/components/ui';
import { ROLES, APP_NAME, APP_TAGLINE } from '@/lib/constants';
import { Shield, Lock, Mail, Globe, Sparkles, Brain, Zap } from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('admin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Operational credentials verification
    setTimeout(async () => {
      if (email === 'admin@stadium.com' && password === 'password123') {
        try {
          await login(email, selectedRole as UserRole);
          setLoading(false);
          router.push('/dashboard');
        } catch (err) {
          setError('Authentication failure.');
          setLoading(false);
        }
      } else {
        setLoading(false);
        setError('Access denied: Invalid operational credentials or token key.');
      }
    }, 1000);
  };

  const handleGoogleLogin = () => {
    setLoading(true);
    setError(null);
    setTimeout(async () => {
      try {
        await login('google-admin@stadium.com', selectedRole as UserRole);
        setLoading(false);
        router.push('/dashboard');
      } catch (err) {
        setError('Authentication failure.');
        setLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground gradient-mesh px-4 selection:bg-primary/30">
      {/* Background glow elements */}
      <div className="absolute top-[20%] left-[20%] w-[30vw] h-[30vw] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[20%] w-[30vw] h-[30vw] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Main card panel */}
      <Card variant="glass" className="w-full max-w-md p-8 border border-border relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-xl pointer-events-none" />

        {/* Branding header */}
        <div className="text-center space-y-2 mb-8">
          <Link href="/" className="inline-flex items-center gap-2 font-black text-text-primary tracking-tight text-xl">
            <div className="w-8 h-8 rounded-md bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-glow">
              <Zap size={16} />
            </div>
            <span>{APP_NAME}</span>
          </Link>
          <p className="text-[10px] text-accent uppercase tracking-widest font-bold font-mono">
            OPERATIONS DECK LOGIN
          </p>
        </div>

        {/* Form container */}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Error Alert */}
          {error && (
            <div className="p-3 bg-danger-muted border border-danger/20 rounded-md text-danger text-xs font-semibold leading-relaxed">
              {error}
            </div>
          )}

          {/* Test Credentials Helper Box */}
          <div className="p-3 bg-primary-muted/10 border border-primary/20 rounded-md text-text-secondary text-xs">
            <span className="font-bold text-primary block mb-0.5">🔑 Operational Test Key:</span>
            <div className="flex justify-between items-center text-[10px] font-semibold">
              <span>Email: <strong className="text-text-primary">admin@stadium.com</strong></span>
              <span>Pass: <strong className="text-text-primary">password123</strong></span>
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-wider text-text-secondary font-bold flex items-center gap-1.5">
              <Mail size={12} /> Email Address
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

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[10px] uppercase tracking-wider text-text-secondary font-bold flex items-center gap-1.5">
                <Lock size={12} /> Security Key / Password
              </label>
              <Link
                href="/forgot-password"
                className="text-[10px] font-semibold text-primary hover:text-primary-hover"
              >
                Reset Key
              </Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-glass text-xs p-3 rounded-[var(--radius-md)] border border-border focus:border-primary focus:outline-none placeholder:text-text-tertiary"
            />
          </div>

          {/* Role Selection */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-wider text-text-secondary font-bold flex items-center gap-1.5">
              <Shield size={12} /> Console Access Role
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full bg-[#0D1425] text-xs p-3 rounded-[var(--radius-md)] border border-border focus:border-primary focus:outline-none text-text-primary"
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value} className="bg-surface font-semibold text-text-primary">
                  {r.label} — {r.description}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="pt-2 space-y-3">
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full font-bold shadow-glow"
              loading={loading}
            >
              Initialize Control Desk
            </Button>

            {/* Google log-in */}
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={handleGoogleLogin}
              className="w-full text-xs flex items-center justify-center gap-2 border border-border hover:bg-glass"
              disabled={loading}
            >
              <Globe size={14} className="text-primary" />
              Sign in with FIFA operations Account
            </Button>
          </div>
        </form>

        {/* Footer */}
        <p className="text-[9px] text-text-tertiary text-center mt-6">
          FIFA World Cup 2026™ Stadium Operations network credentials required. Unauthorized access attempts are logged.
        </p>
      </Card>
    </div>
  );
}
