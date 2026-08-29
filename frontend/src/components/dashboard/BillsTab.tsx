import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { db, User, Bill, Payment } from '@/services/db';
import { Receipt, FileImage, Send, Plus, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface BillsTabProps {
  user: User;
}

export default function BillsTab({ user }: BillsTabProps) {
  const [bills, setBills] = useState<Bill[]>(db.getBills());
  const allSites = db.getSites().filter(s => s.status === 'Active');

  // Form states
  const [selectedSiteId, setSelectedSiteId] = useState(allSites[0]?.id || '');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [photoBase64, setPhotoBase64] = useState<string>('');

  const activeSite = allSites.find(s => s.id === selectedSiteId);

  // Convert receipt upload to base64
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Receipt file size too large (max 10MB)");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoBase64(reader.result as string);
      toast.success("Receipt image loaded successfully!");
    };
    reader.readAsDataURL(file);
  };

  const handleUploadBill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSiteId || !amount || !description.trim() || !photoBase64) {
      toast.error("Please fill in all details and upload the receipt image.");
      return;
    }

    const newBill: Bill = {
      id: `bill-${Date.now()}`,
      managerId: user.id,
      managerName: user.name,
      siteId: selectedSiteId,
      siteName: activeSite?.name || '',
      amount: parseFloat(amount),
      description,
      photoUrl: photoBase64,
      status: 'Pending',
      timestamp: new Date().toISOString(),
    };

    const updated = [newBill, ...bills];
    db.setBills(updated);
    setBills(updated);

    // Reset
    setAmount('');
    setDescription('');
    setPhotoBase64('');
    toast.success("Purchase bill claim uploaded successfully!");
  };

  const handleBillApproval = (billId: string, action: 'Approved' | 'Rejected') => {
    const targetBill = bills.find(b => b.id === billId);
    if (!targetBill) return;

    // Update bill record
    const updatedBills = bills.map(b => {
      if (b.id === billId) {
        return {
          ...b,
          status: action,
          dateApproved: new Date().toISOString().split('T')[0],
        };
      }
      return b;
    });

    db.setBills(updatedBills);
    setBills(updatedBills);

    // If approved, dynamically insert a transaction into payments ledger for Admin payout
    if (action === 'Approved') {
      const payments = db.getPayments();
      const newPayment: Payment = {
        id: `pay-${Date.now()}`,
        type: 'Bill',
        userId: targetBill.managerId,
        userName: targetBill.managerName,
        role: 'Manager',
        siteId: targetBill.siteId,
        siteName: targetBill.siteName,
        billId: targetBill.id,
        amount: targetBill.amount,
        status: 'Pending', // pending payout
        description: `Reimbursement: ${targetBill.description}`,
        dateUpdated: new Date().toISOString().split('T')[0],
      };
      db.setPayments([newPayment, ...payments]);
    }

    toast.success(`Bill claim has been ${action.toLowerCase()}`);
  };

  // Filter bills
  const visibleBills = user.role === 'Admin'
    ? bills
    : bills.filter(b => b.managerId === user.id);

  const pendingBills = visibleBills.filter(b => b.status === 'Pending');
  const pastBills = visibleBills.filter(b => b.status !== 'Pending');

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h3 className="text-lg font-bold text-charcoal">Bills Claims Panel</h3>
        <p className="text-xs text-muted-foreground">Upload and approve purchase receipts for materials purchased on project sites</p>
      </div>

      {user.role === 'Manager' ? (
        // MANAGER WORKFLOW
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="border border-border/50 shadow-soft bg-card md:col-span-2">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-charcoal">Upload Purchase Invoice</CardTitle>
              <CardDescription>File a new materials expense claim for validation</CardDescription>
            </CardHeader>
            <CardContent>
              {allSites.length === 0 ? (
                <p className="text-sm text-destructive font-semibold">No active sites available for bill attachments.</p>
              ) : (
                <form onSubmit={handleUploadBill} className="space-y-4">
                  {/* Select Site */}
                  <div className="space-y-1.5">
                    <Label htmlFor="siteSelect">Site Purchased For</Label>
                    <select
                      id="siteSelect"
                      value={selectedSiteId}
                      onChange={e => setSelectedSiteId(e.target.value)}
                      className="w-full bg-card border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                      required
                    >
                      {allSites.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Amount */}
                  <div className="space-y-1.5">
                    <Label htmlFor="amount">Expense Amount (INR * )</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="e.g. 7500"
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      required
                    />
                  </div>

                  {/* Receipt photo */}
                  <div className="space-y-1.5">
                    <Label htmlFor="receiptUpload">Upload Receipt Image / Invoice PDF (Photo)</Label>
                    <div className="border-2 border-dashed border-border rounded-xl p-4 flex flex-col items-center justify-center bg-muted/20 hover:bg-muted/40 transition-colors duration-200 cursor-pointer relative">
                      <Input
                        id="receiptUpload"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        required={!photoBase64}
                      />
                      {photoBase64 ? (
                        <div className="text-center space-y-2">
                          <img src={photoBase64} alt="Receipt preview" className="h-32 object-contain rounded-lg border shadow-soft" />
                          <span className="text-xs text-success font-semibold block">Change invoice receipt</span>
                        </div>
                      ) : (
                        <div className="text-center space-y-1 text-muted-foreground p-3">
                          <FileImage className="w-8 h-8 mx-auto text-accent mb-2" />
                          <span className="font-bold text-xs block text-charcoal">Drag and Drop or Browse Receipt</span>
                          <span className="text-[10px]">JPG, PNG under 2MB</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <Label htmlFor="desc">Bill Description / Material Details</Label>
                    <Textarea
                      id="desc"
                      placeholder="Specify material types, quantities, and store bought from."
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full bg-accent text-charcoal hover:bg-accent/90 font-bold h-11 shadow-soft">
                    <Send className="w-4 h-4 mr-2" /> Submit Claims Bill
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Manager's personal claims history list */}
          <Card className="border border-border/50 shadow-soft bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-charcoal">My Claims History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {visibleBills.length === 0 ? (
                <p className="text-xs text-muted-foreground">No claims uploaded yet.</p>
              ) : (
                visibleBills.map(bill => (
                  <div key={bill.id} className="p-3 bg-muted/40 border border-border/40 rounded-xl space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-charcoal block truncate max-w-[120px]">{bill.siteName}</span>
                      <span className="font-bold text-accent">₹{bill.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-muted-foreground mt-1">
                      <span>Submitted: {new Date(bill.timestamp).toLocaleDateString()}</span>
                      <Badge variant="outline" className={
                        bill.status === 'Approved' ? 'border-success text-success bg-success/5' :
                        bill.status === 'Rejected' ? 'border-destructive text-destructive bg-destructive/5' :
                        'border-accent text-accent bg-accent/5'
                      }>
                        {bill.status}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        // ADMIN APPROVAL WORKFLOW
        <div className="space-y-6">
          {/* Pending Bills for approvals */}
          <div>
            <h4 className="text-sm font-bold text-charcoal uppercase tracking-wider mb-3">Pending Approvals ({pendingBills.length})</h4>
            {pendingBills.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center bg-card border border-border/40 p-6 rounded-xl">
                No bills currently pending approval.
              </p>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingBills.map(bill => (
                  <Card key={bill.id} className="border border-border/50 shadow-soft bg-card overflow-hidden flex flex-col hover:shadow-medium transition-all duration-300">
                    <div className="relative h-44 bg-secondary/50 flex items-center justify-center border-b">
                      <img src={bill.photoUrl} alt="Invoice receipt" className="w-full h-full object-cover" />
                      <Badge className="absolute top-3 left-3 bg-charcoal text-warm-white">{bill.siteName}</Badge>
                    </div>
                    <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4 text-xs">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-muted-foreground">Manager: <strong>{bill.managerName}</strong></span>
                          <span className="font-bold text-accent text-sm">₹{bill.amount.toLocaleString()}</span>
                        </div>
                        <p className="text-muted-foreground mt-1 leading-snug">{bill.description}</p>
                      </div>

                      {/* Approval controls */}
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                        <Button 
                          onClick={() => handleBillApproval(bill.id, 'Approved')} 
                          className="bg-success text-success-foreground hover:bg-success/90 font-bold text-xs h-9"
                        >
                          <CheckCircle className="w-3.5 h-3.5 mr-1" /> Approve
                        </Button>
                        <Button 
                          onClick={() => handleBillApproval(bill.id, 'Rejected')} 
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-bold text-xs h-9"
                        >
                          <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Past Audited Bills archive table */}
          <div>
            <h4 className="text-sm font-bold text-charcoal uppercase tracking-wider mb-3">Audited Claims History ({pastBills.length})</h4>
            <Card className="border border-border/40 shadow-soft bg-card">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-secondary/40 text-charcoal uppercase tracking-wider text-[10px] border-b">
                      <tr>
                        <th className="py-3 px-6">Manager</th>
                        <th className="py-3 px-4">Site</th>
                        <th className="py-3 px-4">Description</th>
                        <th className="py-3 px-4">Amount</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Processed Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {pastBills.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-6 text-center text-muted-foreground">No historical claims logs.</td>
                        </tr>
                      ) : (
                        pastBills.map(bill => (
                          <tr key={bill.id} className="hover:bg-muted/10">
                            <td className="py-3 px-6 font-bold text-charcoal">{bill.managerName}</td>
                            <td className="py-3 px-4 text-muted-foreground">{bill.siteName}</td>
                            <td className="py-3 px-4 max-w-xs truncate">{bill.description}</td>
                            <td className="py-3 px-4 font-bold text-charcoal">₹{bill.amount.toLocaleString()}</td>
                            <td className="py-3 px-4">
                              <Badge className={bill.status === 'Approved' ? 'bg-success text-success-foreground' : 'bg-destructive text-destructive-foreground'}>
                                {bill.status}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-muted-foreground">{bill.dateApproved || 'N/A'}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
