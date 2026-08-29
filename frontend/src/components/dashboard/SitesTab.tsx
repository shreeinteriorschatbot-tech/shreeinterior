import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { db, Site, User, ChecklistItem } from '@/services/db';
import { MapPin, Calendar, Users, Eye, Plus, CheckCircle, Trash2, Edit, ExternalLink, Archive } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

interface SitesTabProps {
  user: User;
}

export default function SitesTab({ user }: SitesTabProps) {
  const [sites, setSites] = useState<Site[]>(db.getSites());
  const allUsers = db.getUsers();
  const managers = allUsers.filter(u => u.role === 'Manager');
  const staff = allUsers.filter(u => u.role === 'Staff');

  // Modal / Editor States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<Site | null>(null);
  
  // Form fields
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [managerId, setManagerId] = useState('');
  const [assignedStaff, setAssignedStaff] = useState<string[]>([]);
  const [startDate, setStartDate] = useState('');
  const [checklistTexts, setChecklistTexts] = useState<string>(''); // comma-separated strings for new items

  // Filter sites depending on role
  const getVisibleSites = () => {
    if (user.role === 'Admin') return sites;
    if (user.role === 'Manager') return sites.filter(s => s.managerId === user.id);
    return sites.filter(s => s.staffIds.includes(user.id));
  };

  const visibleSites = getVisibleSites();
  const activeSites = visibleSites.filter(s => s.status === 'Active');
  const pastSites = visibleSites.filter(s => s.status === 'Completed');

  const openAddModal = () => {
    setEditingSite(null);
    setName('');
    setAddress('');
    setLatitude('13.0418'); // Chennai default
    setLongitude('80.2341');
    setManagerId(managers[0]?.id || '');
    setAssignedStaff([]);
    setStartDate(new Date().toISOString().split('T')[0]);
    setChecklistTexts("Modular Kitchen framework setup, False ceiling wiring, Wall plaster painting");
    setIsModalOpen(true);
  };

  const openEditModal = (site: Site) => {
    setEditingSite(site);
    setName(site.name);
    setAddress(site.address);
    setLatitude(site.latitude.toString());
    setLongitude(site.longitude.toString());
    setManagerId(site.managerId);
    setAssignedStaff(site.staffIds);
    setStartDate(site.startDate);
    setChecklistTexts(site.checklist.map(c => c.text).join('\n'));
    setIsModalOpen(true);
  };

  const handleSaveSite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !address.trim() || !latitude || !longitude || !managerId) {
      toast.error("Please fill all required fields");
      return;
    }

    // Parse checklist lines
    const checklistLines = checklistTexts
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    const parsedChecklist: ChecklistItem[] = checklistLines.map((line, idx) => {
      // If we are editing, try to preserve completed statuses
      const existing = editingSite?.checklist.find(c => c.text.toLowerCase() === line.toLowerCase());
      return {
        id: existing?.id || `chk-${Date.now()}-${idx}`,
        text: line,
        completed: existing?.completed || false,
        percentage: existing?.percentage || 0,
        description: existing?.description || ''
      };
    });

    const latVal = parseFloat(latitude);
    const lngVal = parseFloat(longitude);

    let updatedSitesList: Site[] = [];

    if (editingSite) {
      // Update existing
      updatedSitesList = sites.map(s => {
        if (s.id === editingSite.id) {
          return {
            ...s,
            name,
            address,
            latitude: latVal,
            longitude: lngVal,
            gmapLink: `https://maps.google.com/?q=${latVal},${lngVal}`,
            managerId,
            staffIds: assignedStaff,
            startDate,
            checklist: parsedChecklist,
          };
        }
        return s;
      });
      toast.success("Site updated successfully");
    } else {
      // Add new
      const newSite: Site = {
        id: `site-${Date.now()}`,
        name,
        address,
        latitude: latVal,
        longitude: lngVal,
        gmapLink: `https://maps.google.com/?q=${latVal},${lngVal}`,
        managerId,
        staffIds: assignedStaff,
        startDate,
        status: 'Active',
        checklist: parsedChecklist,
      };
      updatedSitesList = [...sites, newSite];
      toast.success("New site added successfully");
    }

    db.setSites(updatedSitesList);
    setSites(updatedSitesList);
    setIsModalOpen(false);
  };

  const handleDeleteSite = (siteId: string) => {
    if (confirm("Are you sure you want to delete this site? This cannot be undone.")) {
      const updated = sites.filter(s => s.id !== siteId);
      db.setSites(updated);
      setSites(updated);
      toast.success("Site deleted successfully");
    }
  };

  const handleArchiveSite = (siteId: string, toStatus: 'Active' | 'Completed') => {
    const updated = sites.map(s => {
      if (s.id === siteId) {
        return { ...s, status: toStatus };
      }
      return s;
    });
    db.setSites(updated);
    setSites(updated);
    toast.success(toStatus === 'Completed' ? "Site marked as completed" : "Site moved to active");
  };

  const toggleStaffSelection = (staffId: string) => {
    if (assignedStaff.includes(staffId)) {
      setAssignedStaff(prev => prev.filter(id => id !== staffId));
    } else {
      setAssignedStaff(prev => [...prev, staffId]);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title Header with Add button */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-charcoal">Construction & Interior Sites</h3>
          <p className="text-xs text-muted-foreground">List of active renovations and completed properties</p>
        </div>
        {user.role === 'Admin' && (
          <Button onClick={openAddModal} className="bg-accent text-charcoal hover:bg-accent/90 font-semibold shadow-soft">
            <Plus className="w-4 h-4 mr-2" />
            Add New Site
          </Button>
        )}
      </div>

      {/* Tabs Layout */}
      <div className="space-y-6">
        <div>
          <h4 className="text-sm font-bold text-charcoal uppercase tracking-wider mb-3">Active Renovation Sites ({activeSites.length})</h4>
          {activeSites.length === 0 ? (
            <p className="text-sm text-muted-foreground bg-card border border-border/40 rounded-xl p-6 text-center">
              No active sites assigned at the moment.
            </p>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {activeSites.map(site => (
                <Card key={site.id} className="border border-border/50 shadow-soft bg-card overflow-hidden hover:shadow-medium transition-all duration-300">
                  <CardHeader className="bg-gradient-card pb-3">
                    <div className="flex justify-between items-start">
                      <Badge variant="outline" className="text-accent border-accent bg-accent/5 font-semibold">Active</Badge>
                      <span className="text-[10px] text-muted-foreground font-semibold">Started: {site.startDate}</span>
                    </div>
                    <CardTitle className="text-md font-bold text-charcoal mt-2 truncate">{site.name}</CardTitle>
                    <CardDescription className="text-xs flex items-center mt-1 truncate">
                      <MapPin className="w-3 h-3 mr-1 text-accent flex-shrink-0" />
                      {site.address}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="py-4 space-y-3.5 text-sm">
                    {/* GPS Coordinates and Link */}
                    <div className="flex justify-between items-center text-xs bg-secondary/40 p-2.5 rounded-lg border border-border/40">
                      <div>
                        <span className="text-muted-foreground">Location:</span>{' '}
                        <strong className="text-charcoal font-semibold">{site.latitude}, {site.longitude}</strong>
                      </div>
                      <a
                        href={site.gmapLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-accent hover:underline flex items-center font-bold text-[11px]"
                      >
                        Map View <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </div>

                    {/* Assigned Manager & Staff */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground block mb-0.5">Manager</span>
                        <strong className="text-charcoal font-semibold">
                          {allUsers.find(u => u.id === site.managerId)?.name || 'Unassigned'}
                        </strong>
                      </div>
                      <div>
                        <span className="text-muted-foreground block mb-0.5">Assigned Workers ({site.staffIds.length})</span>
                        <strong className="text-charcoal font-semibold truncate block">
                          {site.staffIds.map(id => allUsers.find(u => u.id === id)?.name).filter(Boolean).join(', ') || 'None'}
                        </strong>
                      </div>
                    </div>

                    {/* Checklist Mini summary */}
                    <div className="space-y-1">
                      <span className="text-xs font-semibold text-muted-foreground">Work Checklist Summary</span>
                      <div className="flex items-center justify-between text-xs text-charcoal font-semibold mt-1">
                        <span>{site.checklist.filter(c => c.completed).length} / {site.checklist.length} Completed</span>
                        <span>
                          {site.checklist.length > 0 
                            ? Math.round((site.checklist.filter(c => c.completed).length / site.checklist.length) * 100)
                            : 0}%
                        </span>
                      </div>
                      <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-accent h-full transition-all duration-300"
                          style={{
                            width: `${site.checklist.length > 0 
                              ? (site.checklist.filter(c => c.completed).length / site.checklist.length) * 100 
                              : 0}%`
                          }}
                        />
                      </div>
                    </div>
                  </CardContent>
                  
                  {/* Admin Site Action Panel */}
                  {user.role === 'Admin' && (
                    <CardFooter className="bg-muted/30 border-t border-border/40 py-2.5 px-4 justify-between">
                      <div className="flex space-x-1">
                        <Button size="sm" variant="ghost" onClick={() => openEditModal(site)} className="h-8 text-charcoal hover:bg-black/5">
                          <Edit className="w-3.5 h-3.5 mr-1" /> Edit
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDeleteSite(site.id)} className="h-8 text-destructive hover:bg-destructive/10">
                          <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                        </Button>
                      </div>
                      <Button size="sm" onClick={() => handleArchiveSite(site.id, 'Completed')} className="h-8 bg-charcoal text-warm-white hover:bg-charcoal/90">
                        <Archive className="w-3.5 h-3.5 mr-1 text-accent" /> Mark Completed
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Completed Sites archived section */}
        <div>
          <h4 className="text-sm font-bold text-charcoal uppercase tracking-wider mb-3">Completed/Past Sites ({pastSites.length})</h4>
          {pastSites.length === 0 ? (
            <p className="text-sm text-muted-foreground bg-card border border-border/40 rounded-xl p-6 text-center">
              No completed sites archived yet.
            </p>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {pastSites.map(site => (
                <Card key={site.id} className="border border-border/40 shadow-soft bg-muted/20 opacity-90 overflow-hidden">
                  <CardHeader className="bg-secondary/40 pb-3">
                    <div className="flex justify-between items-start">
                      <Badge variant="outline" className="text-muted-foreground border-muted bg-white/5 font-semibold">Completed</Badge>
                      <span className="text-[10px] text-muted-foreground font-semibold">Started: {site.startDate}</span>
                    </div>
                    <CardTitle className="text-md font-bold text-charcoal mt-2 truncate">{site.name}</CardTitle>
                    <CardDescription className="text-xs flex items-center mt-1 truncate">
                      <MapPin className="w-3 h-3 mr-1 text-muted-foreground" />
                      {site.address}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="py-4 space-y-3.5 text-sm">
                    {/* Checklist summary */}
                    <div className="flex items-center space-x-2 text-success font-semibold text-xs">
                      <CheckCircle className="w-4 h-4" />
                      <span>All {site.checklist.length} checklist items completed successfully!</span>
                    </div>
                  </CardContent>
                  
                  {user.role === 'Admin' && (
                    <CardFooter className="bg-muted/40 border-t border-border/40 py-2 px-4 justify-between">
                      <Button size="sm" variant="ghost" onClick={() => handleDeleteSite(site.id)} className="h-8 text-destructive hover:bg-destructive/10">
                        <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleArchiveSite(site.id, 'Active')} className="h-8 border-border hover:bg-black/5">
                        Move to Active
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Site Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto w-full max-w-lg bg-card">
          <DialogHeader>
            <DialogTitle>{editingSite ? 'Edit Site Settings' : 'Add New Project Site'}</DialogTitle>
            <DialogDescription>
              Provide site location, address coordinates, checklist points, and assign staff members.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveSite} className="space-y-4">
            {/* Site Name */}
            <div className="space-y-1.5">
              <Label htmlFor="siteName">Site Name *</Label>
              <Input
                id="siteName"
                placeholder="e.g. T-Nagar Residential Renovation"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>

            {/* Site Address */}
            <div className="space-y-1.5">
              <Label htmlFor="siteAddress">Site Address *</Label>
              <Textarea
                id="siteAddress"
                placeholder="Enter complete postal address"
                value={address}
                onChange={e => setAddress(e.target.value)}
                required
              />
            </div>

            {/* Latitude / Longitude */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="lat">Latitude *</Label>
                <Input
                  id="lat"
                  type="number"
                  step="0.000001"
                  value={latitude}
                  onChange={e => setLatitude(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lng">Longitude *</Label>
                <Input
                  id="lng"
                  type="number"
                  step="0.000001"
                  value={longitude}
                  onChange={e => setLongitude(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Start Date */}
            <div className="space-y-1.5">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
              />
            </div>

            {/* Assign Manager */}
            <div className="space-y-1.5">
              <Label htmlFor="manager">Assigned Project Manager *</Label>
              <select
                id="manager"
                value={managerId}
                onChange={e => setManagerId(e.target.value)}
                className="w-full bg-card border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                required
              >
                {managers.map(mgr => (
                  <option key={mgr.id} value={mgr.id}>{mgr.name}</option>
                ))}
              </select>
            </div>

            {/* Assign Staff (Multi-select) */}
            <div className="space-y-2">
              <Label>Assign Staff / Workers</Label>
              <div className="grid grid-cols-2 gap-2 border border-border p-3 rounded-lg max-h-32 overflow-y-auto">
                {staff.map(st => (
                  <label key={st.id} className="flex items-center space-x-2 text-xs text-charcoal cursor-pointer">
                    <input
                      type="checkbox"
                      checked={assignedStaff.includes(st.id)}
                      onChange={() => toggleStaffSelection(st.id)}
                      className="rounded border-border text-accent focus:ring-accent w-4 h-4"
                    />
                    <span>{st.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Checklist items */}
            <div className="space-y-1.5">
              <Label htmlFor="checklist">Work Checklist Items (One per line)</Label>
              <Textarea
                id="checklist"
                placeholder="Modular Kitchen cabinet setup&#10;False ceiling frames installation&#10;Bedroom wardrobe assembly"
                value={checklistTexts}
                onChange={e => setChecklistTexts(e.target.value)}
                rows={4}
              />
              <p className="text-[10px] text-muted-foreground">Each line entered here will represent a checklist requirement for progress updates.</p>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-accent text-charcoal hover:bg-accent/90 font-bold">Save Project Site</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
