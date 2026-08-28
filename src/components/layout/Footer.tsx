'use client';

import React from 'react';
import Link from 'next/link';
import { Sprout, ArrowRight } from 'lucide-react';
import { DEMO_FARM_ID } from '@/lib/seeds/demo-farms';

export function Footer() {
  return (
    <footer className="w-full bg-[#1F3A2E] text-[#F5F4F0] pt-14 pb-10 px-6 sm:px-10 mt-20 border-t border-[#182E24]">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Top Row: Brand Lockup & Inverted Pill CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-10 border-b border-[#2B4E3E]">
          <div className="space-y-2">
            <Link href="/" className="inline-flex items-center gap-2 text-white">
              <Sprout className="h-5 w-5 stroke-[1.75] text-[#A3ABA0]" />
              <span className="text-lg font-normal tracking-tight text-white">Farmeezy</span>
            </Link>
            <p className="text-[13px] text-[#A3ABA0] max-w-sm leading-relaxed">
              Predictive crop health intelligence, micro-climate risk modeling, and epidemiological spread simulation for Indian agriculture.
            </p>
          </div>

          <Link href={`/farm/${DEMO_FARM_ID}`}>
            <button className="inline-flex items-center justify-center rounded-full bg-white text-[#1F3A2E] hover:bg-[#F5F4F0] px-6 py-3 text-[14px] font-medium transition-all group">
              <span>Open Dashboard</span>
              <span className="w-5 h-5 rounded-full bg-[#1F3A2E]/10 group-hover:bg-[#1F3A2E]/20 transition-colors flex items-center justify-center ml-2.5">
                <ArrowRight className="w-3 h-3 text-[#1F3A2E]" />
              </span>
            </button>
          </Link>
        </div>

        {/* 4-Column Navigation Link Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-[13px]">
          <div className="space-y-3">
            <span className="text-[11px] uppercase tracking-[0.08em] text-[#869283] font-medium block">
              Product
            </span>
            <ul className="space-y-2.5 text-[#C4CCC1]">
              <li><Link href={`/farm/${DEMO_FARM_ID}`} className="hover:text-white transition-colors">Farm Health Dashboard</Link></li>
              <li><Link href="/diagnose" className="hover:text-white transition-colors">AI Leaf Diagnosis</Link></li>
              <li><Link href="/simulate" className="hover:text-white transition-colors">Spread Simulator</Link></li>
              <li><Link href="/assistant" className="hover:text-white transition-colors">AI Agronomic Advisor</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <span className="text-[11px] uppercase tracking-[0.08em] text-[#869283] font-medium block">
              For Officers
            </span>
            <ul className="space-y-2.5 text-[#C4CCC1]">
              <li><Link href="/officer" className="hover:text-white transition-colors">District Operations</Link></li>
              <li><Link href="/map" className="hover:text-white transition-colors">Surveillance Radar</Link></li>
              <li><Link href="/officer" className="hover:text-white transition-colors">Priority Dispatch</Link></li>
              <li><Link href="/map" className="hover:text-white transition-colors">DBSCAN Clusters</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <span className="text-[11px] uppercase tracking-[0.08em] text-[#869283] font-medium block">
              Intelligence
            </span>
            <ul className="space-y-2.5 text-[#C4CCC1]">
              <li><span className="text-[#869283]">Deterministic Risk Formula</span></li>
              <li><span className="text-[#869283]">Graph Contagion Simulation</span></li>
              <li><span className="text-[#869283]">MSP Economic Loss Model</span></li>
              <li><span className="text-[#869283]">Open-Meteo Telemetry</span></li>
            </ul>
          </div>

          <div className="space-y-3">
            <span className="text-[11px] uppercase tracking-[0.08em] text-[#869283] font-medium block">
              Governance
            </span>
            <ul className="space-y-2.5 text-[#C4CCC1]">
              <li><span className="text-[#869283]">SIH 2026 Innovation</span></li>
              <li><span className="text-[#869283]">Zero Chemical Dosing Rule</span></li>
              <li><span className="text-[#869283]">ICAR / KVK Compliance</span></li>
              <li><span className="text-[#869283]">Odisha Model Benchmark</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom Fine Print Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-8 border-t border-[#2B4E3E] text-[11px] text-[#869283]">
          <span>© 2026 Farmeezy. Built for Smart India Hackathon.</span>
          <span className="sm:text-right">
            Estimated economic values and spread trajectories based on deterministic model calibrations.
          </span>
        </div>
      </div>
    </footer>
  );
}
