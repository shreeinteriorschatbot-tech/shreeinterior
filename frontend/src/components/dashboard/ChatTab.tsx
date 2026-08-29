import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { db, User, ChatMessage } from '@/services/db';
import { toast } from 'sonner';
import { Send, Shield, Lock, UserCheck, MessageCircle, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ChatTabProps {
  user: User;
}

export default function ChatTab({ user }: ChatTabProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(db.getChatMessages());
  const allUsers = db.getUsers();
  
  // Recipients options depend on who is logged in
  // Admin can chat with anyone.
  // Managers can chat with Admin, other Managers, and Staff.
  // Staff can chat with Managers and Admin.
  const chatPartners = allUsers.filter(u => u.id !== user.id);

  const [activePartnerId, setActivePartnerId] = useState(chatPartners[0]?.id || '');
  const [inputText, setInputText] = useState('');
  const [adminOnlyToggle, setAdminOnlyToggle] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activePartner = allUsers.find(u => u.id === activePartnerId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, activePartnerId]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activePartnerId) return;

    // If Admin Only private check is on, force recipient to Master Admin
    const isPrivate = adminOnlyToggle && user.role !== 'Admin';
    const recipientId = isPrivate ? 'usr-admin' : activePartnerId;
    const recipientName = isPrivate 
      ? (allUsers.find(u => u.id === 'usr-admin')?.name || 'Founder Admin') 
      : (activePartner?.name || '');

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: user.id,
      senderName: user.name,
      senderRole: user.role,
      recipientId,
      recipientName,
      text: inputText,
      timestamp: new Date().toISOString(),
      isAdminOnly: isPrivate || (user.role === 'Admin' && activePartner?.role !== 'Admin' && messages.some(m => m.isAdminOnly && (m.senderId === activePartnerId || m.recipientId === activePartnerId))),
    };

    const updated = [...messages, newMsg];
    db.setChatMessages(updated);
    setMessages(updated);
    setInputText('');
    
    // Automatically trigger simulated response if writing to a manager / admin to make it feel alive!
    if (activePartner && activePartner.role !== 'Staff') {
      setTimeout(() => {
        const replyMsg: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          senderId: activePartner.id,
          senderName: activePartner.name,
          senderRole: activePartner.role,
          recipientId: user.id,
          recipientName: user.name,
          text: `Hi ${user.name.split(' ')[0]}, thanks for your update. I have noted this. Let's discuss this at the end of the shift.`,
          timestamp: new Date().toISOString(),
          isAdminOnly: newMsg.isAdminOnly
        };
        const updatedWithReply = [...db.getChatMessages(), replyMsg];
        db.setChatMessages(updatedWithReply);
        setMessages(updatedWithReply);
      }, 1500);
    }
  };

  // Filter messages that belong to the active thread between user and active partner
  const getThreadMessages = () => {
    return messages.filter(msg => {
      // Admin private chat filter: if message is flagged as AdminOnly private, it should NOT be visible to managers/staff unless they are the sender/recipient
      if (msg.isAdminOnly) {
        // Must involve Admin (usr-admin)
        const isUserOrPartnerAdmin = user.role === 'Admin' || activePartner?.role === 'Admin';
        if (!isUserOrPartnerAdmin) return false;
      }

      // Check standard thread logic:
      const matchesSenderRecipient =
        (msg.senderId === user.id && msg.recipientId === activePartnerId) ||
        (msg.senderId === activePartnerId && msg.recipientId === user.id);
      
      // Also catch cases where staff punched adminOnly and sent it to usr-admin
      const matchesAdminOnlyStaff = msg.isAdminOnly && 
        ((msg.senderId === activePartnerId && msg.recipientId === 'usr-admin' && user.id === 'usr-admin') ||
         (msg.senderId === user.id && msg.recipientId === 'usr-admin' && activePartnerId === 'usr-admin'));

      return matchesSenderRecipient || matchesAdminOnlyStaff;
    });
  };

  const threadMessages = getThreadMessages();

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[calc(100vh-12rem)] min-h-[480px] animate-fade-in text-sm">
      {/* Active Chat partners roster panel */}
      <Card className="border border-border/50 shadow-soft bg-card md:col-span-1 flex flex-col overflow-hidden">
        <CardHeader className="bg-secondary/40 p-4">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-charcoal flex items-center space-x-1.5">
            <MessageCircle className="w-4 h-4 text-accent" />
            <span>Chat Contacts</span>
          </CardTitle>
          <CardDescription className="text-[10px]">Select a colleague to open chat</CardDescription>
        </CardHeader>
        <CardContent className="p-2 flex-1 overflow-y-auto space-y-1">
          {chatPartners.map(partner => (
            <button
              key={partner.id}
              onClick={() => {
                setActivePartnerId(partner.id);
                setAdminOnlyToggle(false); // Reset private toggle
              }}
              className={`w-full flex items-center space-x-2.5 p-2.5 rounded-lg text-left transition-all ${
                activePartnerId === partner.id
                  ? 'bg-accent text-charcoal font-semibold shadow-soft'
                  : 'hover:bg-muted text-charcoal'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-charcoal text-warm-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                {partner.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="overflow-hidden">
                <span className="text-xs truncate block">{partner.name}</span>
                <Badge variant="outline" className={`text-[8px] py-0 px-1 border-border bg-white/40 ${activePartnerId === partner.id ? 'text-charcoal' : 'text-muted-foreground'}`}>
                  {partner.role}
                </Badge>
              </div>
            </button>
          ))}
        </CardContent>
      </Card>

      {/* Main Messaging Window */}
      <Card className="border border-border/50 shadow-soft bg-card md:col-span-3 flex flex-col overflow-hidden">
        {/* Chat Thread Header */}
        <CardHeader className="border-b border-border/60 py-3.5 px-5 flex flex-row justify-between items-center bg-gradient-card">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-accent text-charcoal text-xs font-bold flex items-center justify-center">
              {activePartner?.name.split(' ').map(n => n[0]).join('') || '?'}
            </div>
            <div>
              <CardTitle className="text-sm font-bold text-charcoal">{activePartner?.name}</CardTitle>
              <CardDescription className="text-[10px] mt-0.5 uppercase tracking-wide font-semibold text-accent-foreground">
                Role: {activePartner?.role}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        {/* Conversation Logs Container */}
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-secondary/5">
          {threadMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-2">
              <MessageCircle className="w-8 h-8 text-accent animate-pulse" />
              <p className="text-xs">No chat records in this thread. Say hi!</p>
            </div>
          ) : (
            threadMessages.map(msg => {
              const isMe = msg.senderId === user.id;
              return (
                <div
                  key={msg.id}
                  className={`flex items-start space-x-2 ${isMe ? 'flex-row-reverse space-x-reverse' : ''}`}
                >
                  <div className={`p-2 rounded-full ${isMe ? 'bg-accent text-charcoal' : 'bg-charcoal text-warm-white'}`}>
                    <span className="text-[9px] font-bold uppercase tracking-widest">{msg.senderName.split(' ').map(n => n[0]).join('')}</span>
                  </div>
                  <div
                    className={`p-3 rounded-2xl max-w-[70%] text-xs leading-relaxed shadow-soft relative ${
                      isMe
                        ? 'bg-accent/20 text-charcoal rounded-tr-none'
                        : 'bg-card border border-border rounded-tl-none'
                    }`}
                  >
                    {/* Private locked badge indicator */}
                    {msg.isAdminOnly && (
                      <span className="flex items-center text-[8px] font-bold text-destructive mb-1 space-x-0.5">
                        <Lock className="w-2.5 h-2.5" />
                        <span>Private Message (Admin Only)</span>
                      </span>
                    )}
                    <p className="text-xs">{msg.text}</p>
                    <span className="block text-[8px] text-muted-foreground mt-1 text-right">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </CardContent>

        {/* Messaging footer Form */}
        <CardFooter className="p-3 border-t border-border/60 bg-muted/20 flex flex-col space-y-2">
          {/* Admin Only checkbox toggle for privacy */}
          {user.role !== 'Admin' && activePartner?.role !== 'Admin' && (
            <div className="flex items-center space-x-2 mr-auto text-[10px] text-destructive bg-destructive/5 p-2 rounded-lg border border-destructive/20 w-full">
              <input
                type="checkbox"
                id="adminOnly"
                checked={adminOnlyToggle}
                onChange={e => {
                  setAdminOnlyToggle(e.target.checked);
                  if (e.target.checked) {
                    toast.info("Message will be routed directly to Master Admin and hidden from others.");
                  }
                }}
                className="rounded border-border text-destructive focus:ring-destructive w-3.5 h-3.5 cursor-pointer"
              />
              <label htmlFor="adminOnly" className="flex items-center cursor-pointer font-bold select-none space-x-1">
                <Shield className="w-3.5 h-3.5" />
                <span>Tick to chat with Master Admin only (Private Locked Message)</span>
              </label>
            </div>
          )}

          <form onSubmit={handleSendMessage} className="flex w-full items-center space-x-2">
            <Input
              placeholder={
                adminOnlyToggle
                  ? "Write locked private message directly to Admin..."
                  : `Message ${activePartner?.name.split(' ')[0]}...`
              }
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              className="flex-1 text-xs bg-card"
              required
            />
            <Button type="submit" size="sm" className="bg-accent text-charcoal hover:bg-accent/90">
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
