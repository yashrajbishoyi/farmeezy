'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Send, 
  Bot, 
  User, 
  ShieldCheck
} from 'lucide-react';
import { Farm } from '@/types';
import { DEMO_FARM_ID } from '@/lib/seeds/demo-farms';
import { AnimatedList } from '@/components/react-bits/AnimatedList';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

const SUGGESTED_PROMPTS = [
  'What is the economic loss if I delay action by 3 days?',
  'Which bio-control agent should I spray for Rice Blast?',
  'Why is my risk score 81/100 despite only mild leaf lesions?',
  'How does the current 88% humidity affect fungal spore spread?',
];

function AssistantContent() {
  const searchParams = useSearchParams();
  const initialFarmId = searchParams.get('farm_id') || DEMO_FARM_ID;

  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarmId, setSelectedFarmId] = useState<string>(initialFarmId);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: `Hello Ramesh! I am your Farmeezy AI Agronomic Advisor. I am currently monitoring your Bidyadharpur Paddy Farm (3.5 Acres, Panicle Stage).

Live Context:
• Calculated Risk: 81/100 (Critical Rice Blast Pressure)
• Micro-climate: 88% Humidity, 26.5°C with intermittent rain
• Active Cluster: 12 verified reports within 5 km

How can I help protect your yield today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  useEffect(() => {
    fetchFarms();
  }, []);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, loading]);

  const fetchFarms = async () => {
    try {
      const res = await fetch('/api/farms');
      const data = await res.json();
      if (data.success) setFarms(data.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || loading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farm_id: selectedFarmId,
          message: text,
        }),
      });

      const json = await res.json();

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: json.reply || 'I am analyzing your farm telemetry. Please ask another question.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E3E1D9] pb-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.08em] text-[#5C6259] font-medium mb-1">
            AGRONOMIC INTELLIGENCE
          </div>
          <h1 className="text-[28px] sm:text-[32px] font-normal text-[#14231C] tracking-tight">
            Advisor
          </h1>
        </div>

        <div className="flex items-center gap-2 text-[13px]">
          <span className="text-[#5C6259]">Plot Context:</span>
          <select
            value={selectedFarmId}
            onChange={(e) => setSelectedFarmId(e.target.value)}
            className="px-3.5 py-1.5 border border-[#E3E1D9] rounded-full text-[13px] font-medium bg-white focus:outline-none focus:border-[#14231C]"
          >
            {farms.map((f) => (
              <option key={f.id} value={f.id}>{f.name} ({f.crop?.name || f.crop_id})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="rounded-[24px] border border-[#E3E1D9] bg-white flex flex-col h-[540px] overflow-hidden">
        {/* Messages Scroll Area */}
        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#F5F4F0]">
          <AnimatedList staggerDelay={0.06}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div
                  className={`h-7 w-7 rounded-full flex items-center justify-center text-[12px] font-medium shrink-0 ${
                    msg.sender === 'user'
                      ? 'bg-[#14231C] text-white'
                      : 'bg-white border border-[#E3E1D9] text-[#14231C]'
                  }`}
                >
                  {msg.sender === 'user' ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                </div>

                <div
                  className={`p-4 rounded-[20px] text-[13px] sm:text-[14px] max-w-[85%] sm:max-w-[75%] space-y-1 leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#14231C] text-[#F5F4F0] rounded-tr-none'
                      : 'bg-white text-[#14231C] border border-[#E3E1D9] rounded-tl-none'
                  }`}
                >
                  <div className="whitespace-pre-line">{msg.text}</div>
                  <span
                    className={`block text-[10px] text-right mt-1 ${
                      msg.sender === 'user' ? 'text-white/60' : 'text-[#5C6259]'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}
          </AnimatedList>

          {loading && (
            <div className="flex items-center gap-3">
              <div className="h-7 w-7 rounded-full bg-white border border-[#E3E1D9] text-[#14231C] flex items-center justify-center text-xs shrink-0">
                <Bot className="h-3.5 w-3.5" />
              </div>
              <div className="p-3 bg-white text-[#5C6259] rounded-2xl rounded-tl-none border border-[#E3E1D9] text-[13px] flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#14231C] animate-ping" />
                Querying live farm telemetry and reasoning...
              </div>
            </div>
          )}
        </div>

        {/* Suggested Prompts */}
        <div className="p-3 bg-white border-t border-[#E3E1D9] flex items-center gap-2 overflow-x-auto text-[12px]">
          <span className="text-[11px] uppercase tracking-[0.08em] text-[#5C6259] font-medium shrink-0">
            Suggested:
          </span>
          {SUGGESTED_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="px-3 py-1 bg-[#F5F4F0] hover:bg-[#EAE8E2] text-[#14231C] border border-[#E3E1D9] rounded-full text-[12px] whitespace-nowrap transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-[#E3E1D9]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask about risk breakdown, simulation loss, or safe bio-practices..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 px-4 py-2.5 border border-[#E3E1D9] rounded-full text-[13px] focus:outline-none focus:border-[#14231C] bg-[#F5F4F0]"
            />
            <button
              type="submit"
              disabled={loading || !inputMessage.trim()}
              className="h-10 w-10 rounded-full bg-[#14231C] text-white hover:bg-[#23372E] flex items-center justify-center shrink-0 disabled:opacity-40 transition-colors"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Safety Notice Footer */}
      <div className="flex items-center justify-between text-[11px] text-[#5C6259] px-2">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-[#2F9E5C]" />
          Safety Compliant: Zero chemical dosing instructions. Promotes approved bio-control.
        </span>
        <span>SIH 2026 Innovation</span>
      </div>
    </div>
  );
}

export default function AssistantPage() {
  return (
    <Suspense fallback={<div className="max-w-4xl mx-auto p-12 text-center text-[13px] text-[#5C6259]">Loading AI advisor...</div>}>
      <AssistantContent />
    </Suspense>
  );
}
