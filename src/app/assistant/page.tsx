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
import { useTranslation } from '@/lib/context/LanguageContext';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

type SupportedLang = 'en' | 'hi' | 'mr' | 'or';

/** Returns the welcome message in the specified language. */
function getWelcomeMessage(lang: SupportedLang): string {
  switch (lang) {
    case 'hi':
      return `नमस्ते Ramesh! मैं आपका Farmeezy AI कृषि सलाहकार हूँ। मैं अभी आपके Bidyadharpur Model Paddy Farm (3.5 एकड़, केण्डा अवस्था) पर निगरानी कर रहा हूँ।

लाइव जानकारी:
• अनुमानित जोखिम: 81/100 (गंभीर धान ब्लास्ट दबाव)
• सूक्ष्म जलवायु: 88% आर्द्रता, 26.5°C, रुक-रुक कर बारिश
• सक्रिय क्लस्टर: 5 किमी के भीतर 12 सत्यापित रिपोर्ट

आज आपकी फसल की रक्षा के लिए मैं कैसे मदद कर सकता हूँ?`;

    case 'mr':
      return `नमस्कार Ramesh! मी तुमचा Farmeezy AI कृषी सल्लागार आहे. मी सध्या तुमच्या Bidyadharpur Model Paddy Farm (3.5 एकर, लोंबी अवस्था) वर लक्ष ठेवत आहे.

लाइव माहिती:
• अनुमानित धोका: 81/100 (गंभीर भात करपा दबाव)
• सूक्ष्म हवामान: 88% आर्द्रता, 26.5°C, मधूनमधून पाऊस
• सक्रिय क्लस्टर: 5 किमी मध्ये 12 सत्यापित नोंदी

आज तुमच्या पिकाचे रक्षण करण्यासाठी मी कशी मदत करू शकतो?`;

    case 'or':
      return `ନମସ୍କାର Ramesh! ମୁଁ ଆପଣଙ୍କ Farmeezy AI କୃଷି ଉପଦେଷ୍ଟା। ମୁଁ ବର୍ତ୍ତମାନ ଆପଣଙ୍କ Bidyadharpur Model Paddy Farm (3.5 ଏକର, କେଣ୍ଡା ଅବସ୍ଥା) ର ନିରୀକ୍ଷଣ କରୁଛି।

ଲାଇଭ ତଥ୍ୟ:
• ଆକଳିତ ବିପଦ: 81/100 (ଗୁରୁତ୍ୱପୂର୍ଣ୍ଣ ଧାନ ବ୍ଲାଷ୍ଟ ଚାପ)
• ଜଳବାୟୁ: 88% ଆର୍ଦ୍ରତା, 26.5°C, ବିଭିନ୍ନ ସମୟରେ ବର୍ଷା
• ସକ୍ରିୟ କ୍ଲଷ୍ଟର: 5 କିମି ମଧ୍ୟରେ 12 ଯାଞ୍ଚ ହୋଇଥିବା ରିପୋର୍ଟ

ଆଜି ଆପଣଙ୍କ ଫସଲ ରକ୍ଷା ପାଇଁ ମୁଁ କିପରି ସାହାଯ୍ୟ କରିପାରିବି?`;

    default: // 'en'
      return `Hello Ramesh! I am your Farmeezy AI Agronomic Advisor. I am currently monitoring your Bidyadharpur Paddy Farm (3.5 Acres, Panicle Stage).

Live Context:
• Calculated Risk: 81/100 (Critical Rice Blast Pressure)
• Micro-climate: 88% Humidity, 26.5°C with intermittent rain
• Active Cluster: 12 verified reports within 5 km

How can I help protect your yield today?`;
  }
}

/** Returns translated suggested prompts for the given language. */
function getSuggestedPrompts(lang: SupportedLang): string[] {
  switch (lang) {
    case 'hi':
      return [
        '3 दिन देर करने पर आर्थिक नुकसान कितना होगा?',
        'धान ब्लास्ट के लिए कौन सा जैव-नियंत्रण एजेंट छिड़काव करें?',
        '88% आर्द्रता फफूंद बीजाणु प्रसार को कैसे प्रभावित करती है?',
        'मुझे अभी खेत में क्या करना चाहिए?',
      ];
    case 'mr':
      return [
        '३ दिवस उशीर केल्यास किती आर्थिक नुकसान होईल?',
        'भात करप्यासाठी कोणता जैव-नियंत्रण एजेंट वापरावा?',
        '88% आर्द्रता बुरशी बीजाणू प्रसारावर कसा परिणाम करते?',
        'मला आत्ता शेतात काय करायचे आहे?',
      ];
    case 'or':
      return [
        '3 ଦିନ ବିଳମ୍ବ ହେଲେ ଆର୍ଥିକ କ୍ଷତି କେତେ ହେବ?',
        'ଧାନ ବ୍ଲାଷ୍ଟ ପାଇଁ କେଉଁ ଜୈବ-ନିୟନ୍ତ୍ରଣ ଏଜେଣ୍ଟ ବ୍ୟବହାର କରିବି?',
        '88% ଆର୍ଦ୍ରତା ଜୀବାଣୁ ବୀଜ ବିସ୍ତାରକୁ କିପରି ପ୍ରଭାବିତ କରେ?',
        'ମୁଁ ବର୍ତ୍ତମାନ ଚାଷଜମିରେ କ\'ଣ କରିବା ଉଚିତ?',
      ];
    default: // 'en'
      return [
        'What is the economic loss if I delay action by 3 days?',
        'Which bio-control agent should I spray for Rice Blast?',
        'How does the current 88% humidity affect fungal spore spread?',
        'What should I do in my farm right now?',
      ];
  }
}

function AssistantContent() {
  const searchParams = useSearchParams();
  const initialFarmId = searchParams.get('farm_id') || DEMO_FARM_ID;
  const { t, language } = useTranslation();
  const lang = language as SupportedLang;

  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarmId, setSelectedFarmId] = useState<string>(initialFarmId);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Welcome message is language-aware and updates when language changes
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: getWelcomeMessage(language as SupportedLang),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  // Re-generate welcome message when language changes
  useEffect(() => {
    setMessages((prev) => {
      const welcomeMsg = prev.find((m) => m.id === 'welcome-1');
      if (!welcomeMsg) return prev;
      return [
        {
          ...welcomeMsg,
          text: getWelcomeMessage(language as SupportedLang),
        },
        ...prev.filter((m) => m.id !== 'welcome-1'),
      ];
    });
  }, [language]);

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
          language: language, // ← pass selected language on EVERY request
        }),
      });

      const json = await res.json();

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: json.reply || t('I am analyzing your farm telemetry. Please ask another question.'),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const suggestedPrompts = getSuggestedPrompts(lang);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E3E1D9] pb-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.08em] text-[#5C6259] font-medium mb-1">
            {t('AGRONOMIC INTELLIGENCE')}
          </div>
          <h1 className="text-[28px] sm:text-[32px] font-normal text-[#14231C] tracking-tight">
            {t('Advisor')}
          </h1>
        </div>

        <div className="flex items-center gap-2 text-[13px]">
          <span className="text-[#5C6259]">{t('Plot Context:')}</span>
          <select
            value={selectedFarmId}
            onChange={(e) => setSelectedFarmId(e.target.value)}
            className="px-3.5 py-1.5 border border-[#E3E1D9] rounded-full text-[13px] font-medium bg-white focus:outline-none focus:border-[#14231C]"
          >
            {farms.map((f) => (
              <option key={f.id} value={f.id}>{f.name} ({t(f.crop?.name || f.crop_id)})</option>
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
                {t('Querying live farm telemetry and reasoning...')}
              </div>
            </div>
          )}
        </div>

        {/* Suggested Prompts */}
        <div className="p-3 bg-white border-t border-[#E3E1D9] flex items-center gap-2 overflow-x-auto text-[12px]">
          <span className="text-[11px] uppercase tracking-[0.08em] text-[#5C6259] font-medium shrink-0">
            {t('Suggested:')}
          </span>
          {suggestedPrompts.map((prompt, idx) => (
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
              placeholder={t('Ask about risk breakdown, simulation loss, or safe bio-practices...')}
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
          {t('Safety Compliant: Zero chemical dosing instructions. Promotes approved bio-control.')}
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
