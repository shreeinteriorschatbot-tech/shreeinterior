import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent, CardFooter, CardHeader } from './card';
import { Input } from './input';

interface Message {
  sender: 'bot' | 'user';
  text: string;
  timestamp: Date;
}

// Local RAG Knowledge Base
const KNOWLEDGE_BASE = [
  {
    keywords: ['location', 'where', 'address', 'office', 'branch', 'chennai', 'virugambakkam'],
    answer: "Shree Interiors is located in Chennai, Tamil Nadu. Our main office is located in the heart of Virugambakkam, Chennai. We serve clients across Chennai and surrounding regions in Tamil Nadu."
  },
  {
    keywords: ['service', 'services', 'do you do', 'provide', 'products', 'modular', 'kitchen', 'wardrobe', 'ceiling'],
    answer: "We offer comprehensive full-service interior design, specializing in: 1) Customized Modular Kitchens, 2) Wardrobes & Storage units, 3) False Ceilings, and 4) Complete Home & Commercial Renovations. We oversee projects from initial 2D/3D design strategy to final premium craftsmanship."
  },
  {
    keywords: ['working days', 'working hours', 'timing', 'hours', 'time', 'open', 'schedule', 'sunday', 'saturday'],
    answer: "Our team is available from Monday to Saturday, 9:30 AM to 6:30 PM. We are closed on Sundays to give our craftsmen and site engineers rest."
  },
  {
    keywords: ['contact', 'phone', 'call', 'email', 'mail', 'mobile', 'whatsapp', 'number'],
    answer: "You can reach us by phone at 9941387939 or 8015509036. You can also email us at shreeinterior1324@gmail.com. Visit our office in Virugambakkam, Chennai for a personal consultation!"
  },
  {
    keywords: ['experience', 'years', 'establish', 'history', 'reputation'],
    answer: "Shree Interiors has over 15 years of design and execution excellence. We have successfully completed over 150+ premium projects across Chennai, maintaining a highly trusted, client-centric reputation."
  },
  {
    keywords: ['cost', 'price', 'pricing', 'budget', 'expensive', 'quote', 'estimation'],
    answer: "Our project pricing varies based on dimensions, selected materials, and design complexity. We customize solutions to match your budget while maintaining high craftsmanship. Contact us at 9941387939 for a free initial consultation and detailed estimate!"
  }
];

const DEFAULT_ANSWER = "Thank you for reaching out! I am the Shree Interiors AI assistant. I can help you with details about our services, office location, contact info, and working hours. Could you please specify your question, or call us directly at 9941387939 for urgent consultations?";

// Basic local RAG retrieval logic
const retrieveResponse = (query: string): string => {
  const normalizedQuery = query.toLowerCase();
  let bestMatch: typeof KNOWLEDGE_BASE[0] | null = null;
  let maxScore = 0;

  for (const entry of KNOWLEDGE_BASE) {
    let score = 0;
    for (const keyword of entry.keywords) {
      if (normalizedQuery.includes(keyword)) {
        score += 1;
      }
    }
    if (score > maxScore) {
      maxScore = score;
      bestMatch = entry;
    }
  }

  // If match found, generate semantic response template
  if (bestMatch && maxScore > 0) {
    return bestMatch.answer;
  }
  return DEFAULT_ANSWER;
};

export const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'bot',
      text: "Hello! Welcome to Shree Interiors. I'm your AI design assistant. Ask me anything about our services, office location, working hours, or how to contact us!",
      timestamp: new Date()
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const userMsgText = inputVal;
    setInputVal('');

    // Add user message
    setMessages(prev => [...prev, {
      sender: 'user',
      text: userMsgText,
      timestamp: new Date()
    }]);

    setIsTyping(true);

    // Simulate RAG LLM response after short delay
    setTimeout(() => {
      const responseText = retrieveResponse(userMsgText);
      setMessages(prev => [...prev, {
        sender: 'bot',
        text: responseText,
        timestamp: new Date()
      }]);
      setIsTyping(false);
    }, 850);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <Card className="w-80 sm:w-96 h-[480px] shadow-strong flex flex-col border border-border mb-4 animate-scale-in bg-card">
          {/* Header */}
          <CardHeader className="bg-gradient-accent p-4 text-charcoal flex flex-row items-center justify-between rounded-t-lg">
            <div className="flex items-center space-x-2">
              <div className="bg-charcoal text-accent p-1.5 rounded-full">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm">Shree Interiors AI</h4>
                <p className="text-xs text-charcoal/70">Online | Assistant</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-charcoal hover:bg-charcoal/10 rounded-full h-8 w-8 p-0"
            >
              <X className="w-5 h-5" />
            </Button>
          </CardHeader>

          {/* Messages Body */}
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex items-start space-x-2 ${msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
              >
                <div className={`p-2 rounded-full ${msg.sender === 'user' ? 'bg-accent text-charcoal' : 'bg-secondary'}`}>
                  {msg.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                </div>
                <div
                  className={`p-3 rounded-2xl max-w-[75%] text-sm leading-relaxed shadow-soft ${
                    msg.sender === 'user'
                      ? 'bg-accent/20 text-charcoal rounded-tr-none'
                      : 'bg-card border border-border rounded-tl-none'
                  }`}
                >
                  {msg.text}
                  <span className="block text-[10px] text-muted-foreground mt-1 text-right">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex items-start space-x-2">
                <div className="p-2 rounded-full bg-secondary">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="p-3 bg-secondary/30 rounded-2xl rounded-tl-none flex space-x-1 items-center h-8">
                  <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </CardContent>

          {/* Input Footer */}
          <CardFooter className="p-3 border-t border-border bg-muted/30">
            <form onSubmit={handleSend} className="flex w-full items-center space-x-2">
              <Input
                placeholder="Ask about location, services, hours..."
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                className="flex-1 text-sm bg-card border border-border"
              />
              <Button type="submit" size="sm" className="bg-accent text-charcoal hover:bg-accent/90">
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      )}

      {/* Floating Toggle Bubble */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-accent text-charcoal hover:bg-accent/90 rounded-full shadow-strong flex items-center justify-center p-0 transition-transform duration-300 hover:scale-110 active:scale-95 animate-glow"
      >
        {isOpen ? <X className="w-6 h-6 animate-scale-in" /> : <MessageSquare className="w-6 h-6 animate-scale-in" />}
      </Button>
    </div>
  );
};
