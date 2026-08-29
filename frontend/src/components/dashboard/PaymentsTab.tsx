import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { db, User, Payment } from '@/services/db';
import { CreditCard, CheckCircle, Plus, Receipt, UserCheck, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PaymentsTabProps {
  user: User;
}

export default function PaymentsTab({ user }: PaymentsTabProps) {
  const [payments, setPayments] = useState<Payment[]>(db.getPayments());
  const allUsers = db.getUsers().filter(u => u.role !== 'Admin');
  const allSites = db.getSites().filter(s => s.status === 'Active');

  // Admin New Payout Form
  const [selectedUserId, setSelectedUserId] = useState(allUsers[0]?.id || '');
  const [type, setType] = useState<'Salary' | 'Bill'>('Salary');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedSiteId, setSelectedSiteId] = useState('None');

  const handleCreatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !amount || !description.trim()) {
      toast.error("Please fill in all details");
      return;
    }

    const payUser = allUsers.find(u => u.id === selectedUserId);
    const paySite = allSites.find(s => s.id === selectedSiteId);

    const newPayment: Payment = {
      id: `pay-${Date.now()}`,
      type,
      userId: selectedUserId,
      userName: payUser?.name || '',
      role: payUser?.role || 'Staff',
      amount: parseFloat(amount),
      status: 'Pending',
      description,
      dateUpdated: new Date().toISOString().split('T')[0],
      ...(selectedSiteId !== 'None' && {
        siteId: selectedSiteId,
        siteName: paySite?.name || ''
      })
    };

    const updated = [newPayment, ...payments];
    db.setPayments(updated);
    setPayments(updated);

    // Reset Form
    setAmount('');
    setDescription('');
    toast.success("Payment transaction created successfully!");
  };

  const handleMarkPaid = (payId: string) => {
    const updated = payments.map(p => {
      if (p.id === payId) {
        return {
          ...p,
          status: 'Paid' as const,
          dateUpdated: new Date().toISOString().split('T')[0]
        };
      }
      return p;
    });

    db.setPayments(updated);
    setPayments(updated);
    toast.success("Payment marked as PAID successfully!");
  };

  // Filter visible items
  const visiblePayments = user.role === 'Admin'
    ? payments
    : payments.filter(p => p.userId === user.id);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h3 className="text-lg font-bold text-charcoal">Salary & Bills Reimbursement Ledger</h3>
        <p className="text-xs text-muted-foreground">Log salaries, bill claims reimbursements, and payment schedules</p>
      </div>

      {user.role === 'Admin' && (
        // ADMIN NEW PAYOUT FORM
        <Card className="border border-border/50 shadow-soft bg-card">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-charcoal">Log Payout Request / Salary</CardTitle>
            <CardDescription>Issue a new payment transaction entry in the registry ledger</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreatePayment} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              {/* User select */}
              <div className="space-y-1.5">
                <Label htmlFor="userSelect">Payee User</Label>
                <select
                  id="userSelect"
                  value={selectedUserId}
                  onChange={e => setSelectedUserId(e.target.value)}
                  className="w-full bg-card border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                  required
                >
                  {allUsers.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                  ))}
                </select>
              </div>

              {/* Type Select */}
              <div className="space-y-1.5">
                <Label htmlFor="typeSelect">Payment Type</Label>
                <select
                  id="typeSelect"
                  value={type}
                  onChange={e => setType(e.target.value as 'Salary' | 'Bill')}
                  className="w-full bg-card border border-input rounded-md px-3 py-2 text-sm focus:outline-none"
                  required
                >
                  <option value="Salary">Salary</option>
                  <option value="Bill">Bill Reimbursement</option>
                </select>
              </div>

              {/* Amount */}
              <div className="space-y-1.5">
                <Label htmlFor="amount">INR Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="e.g. 18000"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  required
                />
              </div>

              {/* Site select */}
              <div className="space-y-1.5">
                <Label htmlFor="siteSelect">Project Site (Optional)</Label>
                <select
                  id="siteSelect"
                  value={selectedSiteId}
                  onChange={e => setSelectedSiteId(e.target.value)}
                  className="w-full bg-card border border-input rounded-md px-3 py-2 text-sm focus:outline-none"
                >
                  <option value="None">None</option>
                  {allSites.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div className="space-y-1.5 md:col-span-2 lg:col-span-3">
                <Label htmlFor="desc">Payment Description</Label>
                <Input
                  id="desc"
                  placeholder="e.g. Salary payout for the month of August 2026"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  required
                />
              </div>

              {/* Submit */}
              <Button type="submit" className="w-full bg-accent text-charcoal hover:bg-accent/90 font-bold h-10 shadow-soft">
                <Plus className="w-4 h-4 mr-2" /> Log Transaction
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Transaction History ledger list */}
      <Card className="border border-border/40 shadow-soft bg-card">
        <CardHeader className="bg-gradient-card pb-4">
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-charcoal">Ledger Registry Entries</CardTitle>
          <CardDescription>
            {user.role === 'Admin'
              ? 'Consolidated view of salary payouts and expense reimbursement transactions'
              : 'Detailed history of payment credits issued to your account'}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-secondary/40 text-charcoal uppercase tracking-wider text-[10px] border-b">
                <tr>
                  {user.role === 'Admin' && <th className="py-3 px-6">Payee</th>}
                  {user.role === 'Admin' && <th className="py-3 px-4">Role</th>}
                  <th className="py-3 px-6">Payment Details</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Payment Date</th>
                  {user.role === 'Admin' && <th className="py-3 px-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {visiblePayments.length === 0 ? (
                  <tr>
                    <td colSpan={user.role === 'Admin' ? 7 : 5} className="py-6 text-center text-muted-foreground">
                      No payment ledger records available.
                    </td>
                  </tr>
                ) : (
                  visiblePayments.map(pay => (
                    <tr key={pay.id} className="hover:bg-muted/10">
                      {user.role === 'Admin' && (
                        <td className="py-3.5 px-6 font-bold text-charcoal">{pay.userName}</td>
                      )}
                      {user.role === 'Admin' && (
                        <td className="py-3.5 px-4">
                          <Badge variant="outline" className="border-border text-muted-foreground text-[9px]">{pay.role}</Badge>
                        </td>
                      )}
                      <td className="py-3.5 px-6">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-semibold text-charcoal">{pay.description}</span>
                        </div>
                        {pay.siteName && (
                          <span className="text-[10px] text-muted-foreground block mt-0.5">Project: {pay.siteName}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-charcoal">₹{pay.amount.toLocaleString()}</td>
                      <td className="py-3.5 px-4">
                        <Badge className={pay.status === 'Paid' ? 'bg-success text-success-foreground' : 'bg-accent text-accent-foreground'}>
                          {pay.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-muted-foreground">
                        {pay.dateUpdated}
                      </td>
                      {user.role === 'Admin' && (
                        <td className="py-3.5 px-4 text-right">
                          {pay.status === 'Pending' ? (
                            <Button 
                              size="sm" 
                              onClick={() => handleMarkPaid(pay.id)} 
                              className="bg-success text-success-foreground hover:bg-success/90 h-8 font-bold text-[11px] py-1"
                            >
                              Mark Paid
                            </Button>
                          ) : (
                            <span className="text-success font-semibold text-[11px] flex items-center justify-end">
                              <CheckCircle className="w-3.5 h-3.5 mr-1 text-success" /> Cleared
                            </span>
                          )}
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
