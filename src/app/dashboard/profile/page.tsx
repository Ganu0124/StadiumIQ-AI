'use client';

import React from 'react';
import { Card, Badge, Button } from '@/components/ui';
import { User, Shield, Calendar, Clock, Lock, CheckCircle2 } from 'lucide-react';
import { APP_NAME } from '@/lib/constants';

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-[var(--radius-xl)] bg-surface-elevated/40 border border-border">
        <div>
          <h2 className="text-xl font-black text-text-primary tracking-tight">Operator Profile</h2>
          <p className="text-xs text-text-secondary mt-0.5">
            View security clearances, active match shifts, and action logs.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card Left */}
        <div className="lg:col-span-1 space-y-6">
          <Card variant="glass" className="text-center p-6 space-y-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto shadow-glow">
              <User size={36} className="text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-primary">Admin User</h3>
              <p className="text-[10px] text-text-secondary mt-0.5">System Operations Lead</p>
            </div>
            <div className="flex justify-center gap-2">
              <Badge variant="accent" size="sm">Level 3 Access</Badge>
              <Badge variant="success" size="sm">Shift Active</Badge>
            </div>
          </Card>

          {/* Access details */}
          <Card variant="glass" className="space-y-3.5">
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider border-b border-border pb-2.5">
              Access Details
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Security Clearance</span>
                <span className="font-bold text-text-primary">Full Administrator</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Assigned Arena Zone</span>
                <span className="font-bold text-text-primary">MetLife Command Hub</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Device Node Trust</span>
                <span className="font-bold text-success flex items-center gap-1">
                  <CheckCircle2 size={12} /> Trusted Node
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Shift logs and log histories right */}
        <div className="lg:col-span-2 space-y-6">
          <Card variant="glass" className="space-y-4">
            <div className="pb-3 border-b border-border">
              <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                Shift Schedule Overview
              </h3>
            </div>

            <div className="space-y-3 text-xs leading-relaxed">
              <div className="p-3 bg-glass border border-border rounded flex justify-between items-center">
                <div>
                  <p className="font-bold text-text-primary">FIFA World Cup Semi Final Match 1</p>
                  <p className="text-[10px] text-text-secondary">Shift Duty: Lead Logistics Coordinator</p>
                </div>
                <Badge variant="default" size="sm">Completed</Badge>
              </div>
              <div className="p-3 bg-glass border border-border rounded flex justify-between items-center">
                <div>
                  <p className="font-bold text-text-primary">FIFA World Cup Semi Final Match 2 (Live)</p>
                  <p className="text-[10px] text-text-secondary">Shift Duty: Main Operations Command Desk</p>
                </div>
                <Badge variant="success" size="sm">In-Progress</Badge>
              </div>
            </div>
          </Card>

          {/* Action Log history */}
          <Card variant="glass" className="space-y-4">
            <div className="pb-3 border-b border-border">
              <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                Action Log History
              </h3>
            </div>

            <div className="space-y-3.5 max-h-[200px] overflow-y-auto pr-1">
              <div className="text-[11px] text-text-secondary flex justify-between items-center">
                <span>Authorized Gate B1 auxiliary path redirection plan</span>
                <span className="text-text-tertiary">23m ago</span>
              </div>
              <div className="text-[11px] text-text-secondary flex justify-between items-center">
                <span>Dispatched Medic ambulance dispatch to Section 214 collapsed fan</span>
                <span className="text-text-tertiary">35m ago</span>
              </div>
              <div className="text-[11px] text-text-secondary flex justify-between items-center">
                <span>Triggered counter-drone security jammer signals above South Stand</span>
                <span className="text-text-tertiary">52m ago</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
