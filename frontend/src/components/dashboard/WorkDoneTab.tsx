import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { db, User, WorkDone, Site } from '@/services/db';
import { Image, FileText, Send, Calendar, UserCheck, Star, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface WorkDoneTabProps {
  user: User;
}

export default function WorkDoneTab({ user }: WorkDoneTabProps) {
  const [workRecords, setWorkRecords] = useState<WorkDone[]>(db.getWorkDone());
  const allSites = db.getSites().filter(s => s.status === 'Active');
  const allUsers = db.getUsers();

  // Filter assigned sites
  const assignedSites = user.role === 'Admin'
    ? allSites
    : allSites.filter(s => s.managerId === user.id || s.staffIds.includes(user.id));

  // Form states
  const [selectedSiteId, setSelectedSiteId] = useState(assignedSites[0]?.id || '');
  const [description, setDescription] = useState('');
  const [photoBase64, setPhotoBase64] = useState<string>('');
  
  // Manager extra review states
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [staffReview, setStaffReview] = useState('');

  // Admin filter states
  const [adminViewSubtab, setAdminViewSubtab] = useState<'staff' | 'manager'>('staff');

  const activeSite = allSites.find(s => s.id === selectedSiteId);
  const siteStaffOptions = activeSite
    ? allUsers.filter(u => activeSite.staffIds.includes(u.id))
    : [];

  // Update selected site handler to sync staff options
  const handleSiteSelectChange = (siteId: string) => {
    setSelectedSiteId(siteId);
    const site = allSites.find(s => s.id === siteId);
    if (site && site.staffIds.length > 0) {
      setSelectedStaffId(site.staffIds[0]);
    } else {
      setSelectedStaffId('');
    }
  };

  // Convert uploaded image to Base64 for localStorage storage
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image file is too large (max 10MB)");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoBase64(reader.result as string);
      toast.success("Image uploaded successfully!");
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSiteId || !description.trim() || !photoBase64) {
      toast.error("Please select a site, write a description, and upload a work photo.");
      return;
    }

    const newRecord: WorkDone = {
      id: `wd-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      role: user.role,
      siteId: selectedSiteId,
      siteName: activeSite?.name || '',
      photoUrl: photoBase64,
      description,
      timestamp: new Date().toISOString(),
      ...(user.role === 'Manager' && selectedStaffId && staffReview.trim() && {
        reviewText: `Review of ${allUsers.find(u => u.id === selectedStaffId)?.name}: ${staffReview}`
      })
    };

    const updated = [newRecord, ...workRecords];
    db.setWorkDone(updated);
    setWorkRecords(updated);

    // Clear form
    setDescription('');
    setPhotoBase64('');
    setStaffReview('');
    toast.success("Daily work submission uploaded successfully!");
  };

  // Filter lists for admin
  const managerRecords = workRecords.filter(r => r.role === 'Manager');
  const staffRecords = workRecords.filter(r => r.role === 'Staff');

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h3 className="text-lg font-bold text-charcoal">Daily Progress Photo Upload</h3>
        <p className="text-xs text-muted-foreground">Upload visual completed work updates at the end of every shift</p>
      </div>

      {user.role !== 'Admin' ? (
        // WORKER SUBMISSION FORM PANEL
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="border border-border/50 shadow-soft bg-card md:col-span-2">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-charcoal">Submit Daily Report</CardTitle>
              <CardDescription>File your photo submission for today's tasks completed</CardDescription>
            </CardHeader>
            <CardContent>
              {assignedSites.length === 0 ? (
                <p className="text-sm text-destructive font-semibold">You are not assigned to any active renovation sites.</p>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Select Site */}
                  <div className="space-y-1.5">
                    <Label htmlFor="siteSelect">Select Working Site</Label>
                    <select
                      id="siteSelect"
                      value={selectedSiteId}
                      onChange={e => handleSiteSelectChange(e.target.value)}
                      className="w-full bg-card border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                      required
                    >
                      {assignedSites.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Image upload */}
                  <div className="space-y-1.5">
                    <Label htmlFor="imageUpload">Upload Work Photo (Completed progress)</Label>
                    <div className="border-2 border-dashed border-border rounded-xl p-4 flex flex-col items-center justify-center bg-muted/20 hover:bg-muted/40 transition-colors duration-200 cursor-pointer relative">
                      <Input
                        id="imageUpload"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        required={!photoBase64}
                      />
                      {photoBase64 ? (
                        <div className="text-center space-y-2">
                          <img src={photoBase64} alt="Preview" className="h-32 object-contain rounded-lg border shadow-soft" />
                          <span className="text-xs text-success font-semibold block">Change photo</span>
                        </div>
                      ) : (
                        <div className="text-center space-y-1 text-muted-foreground p-3">
                          <Image className="w-8 h-8 mx-auto text-accent mb-2" />
                          <span className="font-bold text-xs block text-charcoal">Click to Upload Headshot/Progress Photo</span>
                          <span className="text-[10px]">JPG, PNG under 2MB</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <Label htmlFor="desc">Work Description</Label>
                    <Textarea
                      id="desc"
                      placeholder="e.g. Completed fitting the central modular kitchen drawers and aligned the marble countertop."
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      required
                    />
                  </div>

                  {/* MANAGER EXTRA: Review assigned staff */}
                  {user.role === 'Manager' && siteStaffOptions.length > 0 && (
                    <div className="p-4 bg-accent-soft/20 border border-accent/20 rounded-xl space-y-3">
                      <div className="flex items-center space-x-1.5 text-accent-foreground">
                        <Users className="w-4 h-4 text-accent" />
                        <h4 className="text-xs font-bold uppercase tracking-wider">Evaluate Assigned Site Staff</h4>
                      </div>
                      
                      <div className="space-y-1.5">
                        <Label htmlFor="staffSelect">Select Staff Member</Label>
                        <select
                          id="staffSelect"
                          value={selectedStaffId}
                          onChange={e => setSelectedStaffId(e.target.value)}
                          className="w-full bg-card border border-input rounded-md px-3 py-1.5 text-xs focus:outline-none"
                        >
                          {siteStaffOptions.map(st => (
                            <option key={st.id} value={st.id}>{st.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="staffReview">Staff Performance & Tasks Review</Label>
                        <Textarea
                          id="staffReview"
                          placeholder="Write daily performance logs or note tasks done by this worker today..."
                          value={staffReview}
                          onChange={e => setStaffReview(e.target.value)}
                          className="text-xs bg-card"
                        />
                      </div>
                    </div>
                  )}

                  <Button type="submit" className="w-full bg-accent text-charcoal hover:bg-accent/90 font-bold h-11 shadow-soft">
                    <Send className="w-4 h-4 mr-2" /> Upload Work Submission
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Personal past submissions list */}
          <Card className="border border-border/50 shadow-soft bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-charcoal">My Uploads</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {workRecords.filter(r => r.userId === user.id).length === 0 ? (
                <p className="text-xs text-muted-foreground">No reports filed yet.</p>
              ) : (
                workRecords.filter(r => r.userId === user.id).map(rec => (
                  <div key={rec.id} className="p-3 bg-muted/40 border border-border/40 rounded-xl space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-charcoal truncate block max-w-[130px]">{rec.siteName}</span>
                      <span className="text-[9px] text-muted-foreground">{new Date(rec.timestamp).toLocaleDateString()}</span>
                    </div>
                    <img src={rec.photoUrl} alt="progress" className="w-full h-24 object-cover rounded-lg border" />
                    <p className="text-[10px] text-muted-foreground leading-snug">{rec.description}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        // ADMIN / OWNER SUBMISSION ARCHIVE VIEW
        <div className="space-y-4">
          {/* Subpage tabs switcher */}
          <div className="flex border-b border-border">
            <button
              onClick={() => setAdminViewSubtab('staff')}
              className={`pb-2.5 px-4 font-bold text-xs uppercase tracking-wider border-b-2 transition-all duration-200 ${adminViewSubtab === 'staff' ? 'border-accent text-charcoal' : 'border-transparent text-muted-foreground hover:text-charcoal'}`}
            >
              Staff Submissions ({staffRecords.length})
            </button>
            <button
              onClick={() => setAdminViewSubtab('manager')}
              className={`pb-2.5 px-4 font-bold text-xs uppercase tracking-wider border-b-2 transition-all duration-200 ${adminViewSubtab === 'manager' ? 'border-accent text-charcoal' : 'border-transparent text-muted-foreground hover:text-charcoal'}`}
            >
              Manager Submissions & Reviews ({managerRecords.length})
            </button>
          </div>

          {/* Grid layout of submissions */}
          {((adminViewSubtab === 'staff' ? staffRecords : managerRecords).length === 0) ? (
            <p className="text-sm text-muted-foreground text-center bg-card border border-border/40 p-10 rounded-xl">
              No daily reports submitted in this category yet.
            </p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(adminViewSubtab === 'staff' ? staffRecords : managerRecords).map(rec => (
                <Card key={rec.id} className="border border-border/50 shadow-soft bg-card overflow-hidden flex flex-col hover:shadow-medium transition-all duration-300">
                  <div className="relative h-44 bg-secondary/50 flex items-center justify-center border-b">
                    <img src={rec.photoUrl} alt="Progress upload" className="w-full h-full object-cover" />
                    <Badge className="absolute top-3 left-3 bg-charcoal text-warm-white">{rec.siteName}</Badge>
                  </div>
                  <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4 text-xs">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1.5">
                          <UserCheck className="w-4 h-4 text-accent" />
                          <strong className="text-charcoal font-bold">{rec.userName}</strong>
                        </div>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(rec.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        </span>
                      </div>
                      
                      <div className="space-y-1 bg-secondary/30 p-2.5 rounded-lg border border-border/30">
                        <span className="font-semibold text-muted-foreground block text-[10px]">Description</span>
                        <p className="text-charcoal text-xs leading-relaxed">{rec.description}</p>
                      </div>
                    </div>

                    {/* MANAGER SUBMISSION INCLUDES STAFF EVALUATION REVIEW */}
                    {rec.reviewText && (
                      <div className="border-t border-border/40 pt-3 mt-1 space-y-1">
                        <div className="flex items-center space-x-1 text-accent-foreground font-bold text-[10px] uppercase tracking-wider">
                          <Star className="w-3.5 h-3.5 fill-accent text-accent" />
                          <span>Manager's Staff Evaluation</span>
                        </div>
                        <p className="text-charcoal text-[11px] bg-accent-soft/30 border border-accent/20 rounded p-2 italic leading-snug">
                          {rec.reviewText}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
