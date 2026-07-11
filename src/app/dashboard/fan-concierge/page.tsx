'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, Button, Badge } from '@/components/ui';
import { LANGUAGES } from '@/lib/constants';
import {
  MessageCircle, Send, Sparkles, Brain, MapPin, Compass, UtensilsCrossed, LifeBuoy, AlertCircle, HelpCircle, Volume2
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function FanConciergePage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      role: 'assistant',
      content: 'Hello! Welcome to MetLife Stadium. I am your AI Stadium Guide. How can I help you find your seat, locate facilities, or order food today?',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [selectedLang, setSelectedLang] = useState('en');
  const [loadingAI, setLoadingAI] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (textToSend = inputText) => {
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    if (textToSend === inputText) setInputText('');

    // Trigger Gemini response mock
    setLoadingAI(true);
    setTimeout(() => {
      let aiContent = '';
      const textLower = textToSend.toLowerCase();

      if (textLower.includes('seat') || textLower.includes('nav')) {
        aiContent = 'Your seat is in Section 214, Row 12. Take Elevator 3 to Concourse Level 2, turn right at the burger joint, and proceed to Corridor 14. Guides are positioned at Section entry points to scan badges.';
      } else if (textLower.includes('food') || textLower.includes('burger')) {
        aiContent = 'The nearest hot food is "Stadium Burger Co." located on Concourse A (Level 2). Average wait is 14 minutes. They serve beef burgers, hot dogs, and loaded fries.';
      } else if (textLower.includes('restroom') || textLower.includes('toilet')) {
        aiContent = 'The nearest restroom is located right behind Section 212, which is about 40 meters to your left as you exit Section 214 corridor.';
      } else if (textLower.includes('emergency') || textLower.includes('medical') || textLower.includes('pain')) {
        aiContent = 'EMERGENCY ACTION: Paramedics are stationed at Medical Bay 2 on Level 2 (near Gate C). I have flagged your location. If you need immediate assistance, please look for stewards in neon jackets or dial 911.';
      } else {
        aiContent = `Here is what I found for "${textToSend}": All gates are currently open. Traffic around the stadium is heavy. If you have ticket credentials, scan at the gate terminal. Need anything else?`;
      }

      // Add translation stub if not english
      if (selectedLang !== 'en') {
        aiContent = `[Translated to ${selectedLang.toUpperCase()}] ${aiContent}`;
      }

      setMessages(prev => [...prev, {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: aiContent,
        timestamp: new Date(),
      }]);
      setLoadingAI(false);
    }, 1000);
  };

  const handleQuickHelp = (promptText: string) => {
    handleSendMessage(promptText);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-[var(--radius-xl)] bg-surface-elevated/40 border border-border">
        <div>
          <h2 className="text-xl font-black text-text-primary tracking-tight">AI Fan Concierge</h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Instant helper bot providing navigation guides, food recommendations, and emergency help.
          </p>
        </div>

        {/* Language Pill Selector */}
        <div className="flex items-center gap-1 bg-glass p-1 rounded-lg border border-border">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => setSelectedLang(l.code)}
              className={`px-2.5 py-1 text-[11px] font-bold rounded transition-colors cursor-pointer flex items-center gap-1 ${
                selectedLang === l.code ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <span>{l.flag}</span>
              <span className="hidden sm:inline">{l.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Quick Help Prompts left side */}
        <div className="lg:col-span-1 space-y-4">
          <Card variant="glass" className="space-y-3.5">
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider border-b border-border pb-2.5">
              Frequently Asked
            </h3>

            <div className="space-y-2">
              <Button
                variant="secondary"
                size="sm"
                className="w-full justify-start text-[11px] text-left"
                onClick={() => handleQuickHelp('How do I navigate to Section 214?')}
              >
                <Compass size={14} className="text-primary flex-shrink-0" />
                <span>Section 214 Navigation</span>
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="w-full justify-start text-[11px] text-left"
                onClick={() => handleQuickHelp('Where is the nearest restroom?')}
              >
                <MapPin size={14} className="text-primary flex-shrink-0" />
                <span>Find Nearest Restroom</span>
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="w-full justify-start text-[11px] text-left"
                onClick={() => handleQuickHelp('Recommend good burgers nearby')}
              >
                <UtensilsCrossed size={14} className="text-primary flex-shrink-0" />
                <span>Food Recommendations</span>
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="w-full justify-start text-[11px] text-left text-danger hover:text-danger hover:bg-danger-muted/10 border border-danger/10"
                onClick={() => handleQuickHelp('I have chest pain, I need emergency medical help')}
              >
                <AlertCircle size={14} className="text-danger flex-shrink-0" />
                <span>Request Medical Help</span>
              </Button>
            </div>
          </Card>
        </div>

        {/* Chat Window right side */}
        <div className="lg:col-span-3">
          <Card variant="glass" className="h-[480px] flex flex-col justify-between">
            {/* Header info */}
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Brain size={16} className="text-primary animate-pulse" />
                <span className="text-xs font-bold text-text-primary uppercase tracking-wider">
                  StadiumIQ AI Assistant
                </span>
              </div>
              <Badge variant="success" size="sm">Online</Badge>
            </div>

            {/* Chat Transcript Area */}
            <div className="flex-grow overflow-y-auto my-4 space-y-4 pr-1">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 text-xs leading-relaxed max-w-[85%] ${
                    msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                      msg.role === 'user' ? 'bg-primary' : 'bg-surface-elevated border border-border'
                    }`}
                  >
                    {msg.role === 'user' ? 'U' : 'AI'}
                  </div>
                  <div
                    className={`p-3 rounded-lg ${
                      msg.role === 'user'
                        ? 'bg-primary text-white rounded-tr-none'
                        : 'bg-glass border border-border rounded-tl-none text-text-secondary'
                    }`}
                  >
                    <p className="whitespace-pre-wrap font-medium">{msg.content}</p>
                    <span className="text-[8px] text-text-tertiary block mt-1 text-right">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
              {loadingAI && (
                <div className="flex gap-3 text-xs mr-auto items-center">
                  <div className="w-7 h-7 rounded-full bg-glass border border-border flex items-center justify-center">
                    AI
                  </div>
                  <div className="bg-glass border border-border p-3 rounded-lg rounded-tl-none flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-text-secondary animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-text-secondary animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-text-secondary animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="pt-3 border-t border-border flex gap-2">
              <input
                type="text"
                placeholder="Ask details about seating, transit routes..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-grow bg-glass text-xs px-4 py-2.5 rounded-[var(--radius-md)] border border-border focus:border-primary focus:outline-none placeholder:text-text-tertiary"
              />
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleSendMessage()}
                className="!py-2.5"
              >
                <Send size={14} />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
