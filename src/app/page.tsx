'use client';

import React from 'react';
import Link from 'next/link';
import { Card, Button } from '@/components/ui';
import {
  Brain, Shield, Users, Heart, Car, Megaphone,
  Activity, Zap, CheckCircle2, ChevronRight
} from 'lucide-react';
import { APP_NAME } from '@/lib/constants';

export default function LandingPage() {
  const problems = [
    { title: 'Crowd Congestion', desc: 'Sectors reach capacity thresholds quickly causing queue logjams at entry turnstiles.' },
    { title: 'Emergency Dispatch latency', desc: 'Fragmented radio systems delay deployment of medical carts and security details.' },
    { title: 'Vendor Stockouts', desc: 'Concession stands run out of high-demand items while alternative counters hold excessive inventory.' },
  ];

  const features = [
    { title: 'Executive Operations Control', desc: 'Consolidated dashboard monitoring attendance, risk index, gate speeds and alerts.', icon: <Activity className="text-primary" /> },
    { title: 'AI Dispersal Engine', desc: 'Predictive bottleneck warning models suggesting auxiliary lane openings and rerouting.', icon: <Brain className="text-accent" /> },
    { title: 'Surveillance Co-Pilot', desc: 'Computer vision logs tagging unauthorized drone activity and unauthorized entries.', icon: <Shield className="text-danger" /> },
    { title: 'Ambulance & Medic Track', desc: 'Automatic dispatch check sheets, response logs and medical staff availabilities.', icon: <Heart className="text-danger" /> },
    { title: 'EV Charging & Lot Guidance', desc: 'Live space percentage trackers, walking time offsets and traffic flow warnings.', icon: <Car className="text-info" /> },
    { title: 'Scoreboard announcement scheduler', desc: 'Gemini-drafted multi-language safety alerts with instant translation templates.', icon: <Megaphone className="text-warning" /> },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground gradient-mesh font-sans relative overflow-x-hidden selection:bg-primary/30">
      {/* Glow backdrop bubbles */}
      <div className="absolute top-[10%] left-[-10%] w-[40vw] h-[40vw] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[35vw] h-[35vw] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Top Navbar */}
      <header className="sticky top-0 z-50 h-16 w-full glass border-b border-border flex items-center justify-between px-6 backdrop-blur-xl">
        <Link href="/" className="flex items-center gap-2 font-black text-text-primary tracking-tight">
          <div className="w-8 h-8 rounded-md bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-glow">
            <Zap size={16} />
          </div>
          <span>{APP_NAME}</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="primary" size="sm" className="shadow-glow cursor-pointer">
              Launch Control Desk <ChevronRight size={14} className="ml-1" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-6 max-w-6xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-muted border border-primary/20 text-xs font-semibold text-primary">
          <Brain size={14} className="animate-pulse" />
          <span>FIFA World Cup 2026™ Standard Ops Platform</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-none text-text-primary max-w-4xl mx-auto">
          AI-Powered Smart Stadium Operations & <span className="gradient-text">Fan Experience</span>
        </h1>

        <p className="text-sm md:text-base text-text-secondary max-w-2xl mx-auto leading-relaxed">
          Unify ticket systems, concession inventories, parking indicators, medical response details, and safety alert logs into a single Gemini-orchestrated Operations Console.
        </p>

        <div className="flex justify-center gap-4">
          <Link href="/login">
            <Button variant="primary" size="lg" className="shadow-glow font-bold cursor-pointer">
              Deploy Platform Demo
            </Button>
          </Link>
        </div>
      </section>

      {/* Problem & Solution block */}
      <section className="py-20 px-6 max-w-6xl mx-auto border-t border-border space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-3xl font-black text-text-primary uppercase tracking-wider">
            Operational bottlenecks in Large Events
          </h2>
          <p className="text-xs text-text-secondary">
            Legacy infrastructures suffer from data silo disconnects, delaying safety responses.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {problems.map((p, idx) => (
            <Card key={idx} variant="glass" className="space-y-3">
              <div className="w-8 h-8 rounded bg-danger-muted text-danger flex items-center justify-center font-bold text-sm">
                0{idx + 1}
              </div>
              <h3 className="text-sm font-bold text-text-primary">{p.title}</h3>
              <p className="text-xs text-text-secondary leading-relaxed">{p.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Features Showcase grid */}
      <section className="py-20 px-6 max-w-6xl mx-auto border-t border-border space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-3xl font-black text-text-primary uppercase tracking-wider">
            Enterprise Module Suites
          </h2>
          <p className="text-xs text-text-secondary">
            Equipped with proactive predictive insights for stadium marshals and food operators.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, idx) => (
            <Card key={idx} variant="glass" className="space-y-3.5 hover:border-primary/20 transition-all">
              <div className="w-10 h-10 rounded-md bg-glass border border-border flex items-center justify-center">
                {f.icon}
              </div>
              <h3 className="text-sm font-bold text-text-primary">{f.title}</h3>
              <p className="text-xs text-text-secondary leading-relaxed">{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Benefits section */}
      <section className="py-20 px-6 max-w-6xl mx-auto border-t border-border grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h2 className="text-2xl md:text-3xl font-black text-text-primary uppercase tracking-wider">
            Engineered for Operations Excellence
          </h2>
          <p className="text-xs text-text-secondary leading-relaxed">
            StadiumIQ AI deploys automated alert checklists, ambulance routers, and multi-language crowd signs to maintain security levels.
          </p>

          <div className="space-y-3 text-xs text-text-secondary">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-success" />
              <span>Reduce gate queue delays by up to 40% using dynamic redirection</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-success" />
              <span>Improve paramedic response transit times under 3 minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-success" />
              <span>Eliminate food stall restocking delays with active transfer plans</span>
            </div>
          </div>
        </div>

        {/* Benefits Score stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card variant="glass" className="text-center p-6 space-y-1">
            <span className="text-3xl font-black text-primary font-mono">&lt;3.5m</span>
            <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block">Medical response</span>
          </Card>
          <Card variant="glass" className="text-center p-6 space-y-1">
            <span className="text-3xl font-black text-accent font-mono">98.2%</span>
            <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block">Alert Resolution</span>
          </Card>
          <Card variant="glass" className="text-center p-6 space-y-1">
            <span className="text-3xl font-black text-success font-mono">40%</span>
            <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block">Wait reduction</span>
          </Card>
          <Card variant="glass" className="text-center p-6 space-y-1">
            <span className="text-3xl font-black text-accent font-mono">8+</span>
            <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block">Languages supported</span>
          </Card>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-20 px-6 text-center max-w-4xl mx-auto border-t border-border">
        <Card variant="glass" className="p-8 border border-primary/20 shadow-glow space-y-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-muted/10 to-accent-muted/10 pointer-events-none" />
          <h2 className="text-2xl md:text-3xl font-black text-text-primary uppercase tracking-wide">
            Ready to upgrade Stadium Operations?
          </h2>
          <p className="text-xs text-text-secondary max-w-xl mx-auto leading-relaxed">
            Deploy the simulated command deck and see how Gemini AI co-pilots active queue flows, security threats, medical emergencies, and inventory routing maps.
          </p>
          <div className="flex justify-center">
            <Link href="/login">
              <Button variant="accent" size="lg" className="font-bold cursor-pointer">
                Enter Operations Console
              </Button>
            </Link>
          </div>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6 text-center text-[10px] text-text-tertiary">
        <p>© 2026 StadiumIQ AI. FIFA World Cup 2026™ Operations Support Suite.</p>
        <p className="mt-1">Built for high-scale stadium management & fan coordination desks.</p>
      </footer>
    </div>
  );
}
