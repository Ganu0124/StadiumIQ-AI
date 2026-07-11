'use client';

import React, { useState } from 'react';
import { Card, Button, Badge, ProgressBar } from '@/components/ui';
import { foodVendors as initialVendors } from '@/data/mock-data';
import { UtensilsCrossed, Package, TrendingUp, Sparkles, Brain, Clock, PlusCircle } from 'lucide-react';
import { DonutChart } from '@/components/charts/DonutChart';
import { FoodVendor } from '@/types';
import { formatCurrency } from '@/lib/utils';

export default function FoodVendorsPage() {
  const [vendors, setVendors] = useState<FoodVendor[]>(initialVendors);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiRestockPlan, setAiRestockPlan] = useState<string | null>(null);

  const handleAIRequestPlan = () => {
    setLoadingAI(true);
    setTimeout(() => {
      setAiRestockPlan(
        'Gemini Restocking Plan: Concourse A (Stadium Burger) is reporting high demand for loaded fries (92% inventory depletion). Conversely, Concourse C (Green Bowl) has surplus storage of potatoes and frying oil. Action: Redistribute 4 crates of raw potato wedges and 2 oil containers from Concourse C storage to Concourse A. Restock 5 cases of craft beer to Refreshment Hub B immediately.'
      );
      setLoadingAI(false);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-[var(--radius-xl)] bg-surface-elevated/40 border border-border">
        <div>
          <h2 className="text-xl font-black text-text-primary tracking-tight">Food & Vendors</h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Sales analytics, concession queues, and inventory stock monitoring systems.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={handleAIRequestPlan}
          loading={loadingAI}
          icon={<Sparkles size={14} />}
        >
          Compute Inventory Plan
        </Button>
      </div>

      {/* AI Advisory Panel */}
      {aiRestockPlan && (
        <Card variant="glass" className="border border-primary/20 shadow-glow relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-start gap-4">
            <div className="w-9 h-9 rounded-lg bg-primary-muted flex items-center justify-center text-primary mt-1 flex-shrink-0">
              <Brain size={18} className="animate-pulse" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                  Live Concession Restocking Plan
                </h3>
                <Badge variant="accent" size="sm">Gemini AI</Badge>
              </div>
              <p className="text-xs text-text-secondary mt-2 leading-relaxed">
                {aiRestockPlan}
              </p>
              <div className="flex gap-2 mt-4">
                <Button variant="primary" size="sm" className="text-[10px] !py-1 !px-3 rounded-md">
                  Deploy Restock Crew
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Vendors list grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vendors.map((vendor) => (
          <Card key={vendor.id} variant="glass" className="space-y-4">
            <div className="flex justify-between items-start border-b border-border pb-3">
              <div>
                <h3 className="text-sm font-bold text-text-primary">{vendor.name}</h3>
                <p className="text-[10px] text-text-secondary mt-0.5">{vendor.location}</p>
              </div>
              <Badge variant={vendor.inventoryStatus === 'critical' ? 'danger' : vendor.inventoryStatus === 'low' ? 'warning' : 'success'} size="sm">
                Stock: {vendor.inventoryStatus}
              </Badge>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-2.5 bg-glass rounded border border-border">
                <span className="text-[9px] font-bold text-text-tertiary uppercase block">Revenue</span>
                <span className="text-sm font-black text-text-primary">{formatCurrency(vendor.revenue)}</span>
              </div>
              <div className="p-2.5 bg-glass rounded border border-border">
                <span className="text-[9px] font-bold text-text-tertiary uppercase block">Queue Wait</span>
                <span className="text-sm font-black text-text-primary flex items-center gap-1">
                  <Clock size={12} className="text-primary" /> {vendor.avgWaitTime}m
                </span>
              </div>
            </div>

            {/* Popular Items list */}
            <div className="space-y-2">
              <span className="text-[9px] font-bold text-text-tertiary uppercase block">Popular Products:</span>
              <div className="space-y-1.5">
                {vendor.popularItems.map((item, idx) => {
                  const pct = Math.round((item.inStock / (item.sold + item.inStock)) * 100);
                  return (
                    <div key={idx} className="text-[11px] text-text-secondary flex justify-between items-center bg-glass/20 p-1.5 rounded">
                      <span>{item.name}</span>
                      <span className={pct < 20 ? 'text-danger font-bold' : 'text-text-primary'}>
                        {item.inStock} left
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
