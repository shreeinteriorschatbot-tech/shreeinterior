import React, { useState, useEffect } from 'react';
import { db, Enquiry } from '@/services/db';
import { Mail, Phone, User, Calendar, MessageSquare, Search } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function EnquiriesTab() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Retrieve enquiries from database cache sync
    setEnquiries(db.getEnquiries());
  }, []);

  const filteredEnquiries = enquiries.filter(enq =>
    enq.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    enq.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    enq.phone.includes(searchQuery) ||
    enq.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-warm-white tracking-tight">Customer Enquiries</h2>
          <p className="text-muted-foreground text-sm">Consultation requests submitted via contact forms</p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search enquiries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-charcoal border-border text-warm-white"
          />
        </div>
      </div>

      {filteredEnquiries.length === 0 ? (
        <Card className="bg-charcoal border-border p-8 text-center text-muted-foreground">
          <CardContent className="pt-6">
            <Mail className="w-12 h-12 text-gold-accent/40 mx-auto mb-4" />
            <p className="italic">No enquiries found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredEnquiries.map((enq) => {
            const date = new Date(enq.timestamp);
            const formattedDate = date.toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });
            const formattedTime = date.toLocaleTimeString(undefined, {
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <Card key={enq.id} className="bg-charcoal border-border hover:border-gold-accent/40 transition-colors duration-300">
                <CardHeader className="pb-3 border-b border-border/40">
                  <CardTitle className="flex justify-between items-start">
                    <span className="text-warm-white font-bold text-base flex items-center gap-2">
                      <User className="w-4 h-4 text-gold-accent" />
                      {enq.name}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1.5 font-normal">
                      <Calendar className="w-3.5 h-3.5 text-gold-accent" />
                      {formattedDate} at {formattedTime}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  {/* Contact Info */}
                  <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
                    <span className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-gold-accent" />
                      {enq.email}
                    </span>
                    <span className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-gold-accent" />
                      {enq.phone}
                    </span>
                  </div>

                  {/* Message details */}
                  <div className="bg-secondary/10 p-3 rounded-lg border border-border/20 mt-2">
                    <span className="text-xs text-gold-accent/80 font-bold uppercase tracking-wider block mb-1 flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      Message Description
                    </span>
                    <p className="text-warm-white text-xs leading-relaxed font-light whitespace-pre-line">
                      {enq.message}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
