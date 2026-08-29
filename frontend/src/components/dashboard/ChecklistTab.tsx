import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { db, User, Site, ChecklistItem } from '@/services/db';
import { ClipboardList, CheckCircle, ChevronDown, ChevronRight, Save, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ChecklistTabProps {
  user: User;
}

export default function ChecklistTab({ user }: ChecklistTabProps) {
  const [sites, setSites] = useState<Site[]>(db.getSites());
  const activeSites = sites.filter(s => s.status === 'Active');

  // Filter assigned sites for managers
  const assignedSites = user.role === 'Admin'
    ? activeSites
    : activeSites.filter(s => s.managerId === user.id);

  // States
  const [selectedSiteId, setSelectedSiteId] = useState(assignedSites[0]?.id || '');
  const [expandedSiteId, setExpandedSiteId] = useState<string | null>(null);

  // Local copy of checklist for active manager edit
  const activeSite = activeSites.find(s => s.id === selectedSiteId);
  const [tempChecklist, setTempChecklist] = useState<ChecklistItem[]>(activeSite?.checklist || []);

  // Sync checklist when selected site changes
  React.useEffect(() => {
    if (activeSite) {
      setTempChecklist(activeSite.checklist);
    } else {
      setTempChecklist([]);
    }
  }, [selectedSiteId, sites, activeSite]);

  const handleCheckboxChange = (itemId: string, checked: boolean) => {
    setTempChecklist(prev => prev.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          completed: checked,
          percentage: checked ? 100 : (item.percentage === 100 ? 0 : item.percentage)
        };
      }
      return item;
    }));
  };

  const handlePercentageChange = (itemId: string, val: string) => {
    let pct = parseInt(val) || 0;
    if (pct < 0) pct = 0;
    if (pct > 100) pct = 100;

    setTempChecklist(prev => prev.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          percentage: pct,
          completed: pct === 100
        };
      }
      return item;
    }));
  };

  const handleDescriptionChange = (itemId: string, text: string) => {
    setTempChecklist(prev => prev.map(item => {
      if (item.id === itemId) {
        return { ...item, description: text };
      }
      return item;
    }));
  };

  const handleSaveChecklist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSiteId) return;

    const updatedSites = sites.map(s => {
      if (s.id === selectedSiteId) {
        return {
          ...s,
          checklist: tempChecklist.map(item => ({
            ...item,
            dateUpdated: new Date().toISOString().split('T')[0]
          }))
        };
      }
      return s;
    });

    db.setSites(updatedSites);
    setSites(updatedSites);
    toast.success("Site work checklist progress saved successfully!");
  };

  const toggleExpandSite = (siteId: string) => {
    setExpandedSiteId(expandedSiteId === siteId ? null : siteId);
  };

  return (
    <div className="space-y-6 animate-fade-in text-sm">
      <div>
        <h3 className="text-lg font-bold text-charcoal">Daily Checklist & Progress Tracker</h3>
        <p className="text-xs text-muted-foreground">Log completed modules and configure overall construction completion percentages</p>
      </div>

      {user.role === 'Manager' ? (
        // MANAGER WORKFLOW CHECKLIST EDITOR
        <Card className="border border-border/50 shadow-soft bg-card">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-charcoal">Log Site Work Progress</CardTitle>
            <CardDescription>Review list of elements and update percentages completed</CardDescription>
          </CardHeader>
          <CardContent>
            {assignedSites.length === 0 ? (
              <p className="text-sm text-destructive font-semibold">You are not assigned as manager to any active construction sites.</p>
            ) : (
              <form onSubmit={handleSaveChecklist} className="space-y-5">
                {/* Select Site */}
                <div className="space-y-1.5">
                  <Label htmlFor="siteSelect">Select Assigned Site</Label>
                  <select
                    id="siteSelect"
                    value={selectedSiteId}
                    onChange={e => setSelectedSiteId(e.target.value)}
                    className="w-full bg-card border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                  >
                    {assignedSites.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                {/* Checklist editor list */}
                <div className="space-y-4 pt-2">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Element Checklist Grid</span>
                  {tempChecklist.length === 0 ? (
                    <p className="text-xs text-muted-foreground bg-muted/40 p-4 rounded-lg border border-dashed border-border">
                      No checklist items defined for this site. Define checklist requirements in Site Settings first.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {tempChecklist.map((item) => (
                        <div key={item.id} className="p-4 bg-muted/30 border border-border/40 rounded-xl space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <label className="flex items-center space-x-2.5 font-bold text-charcoal cursor-pointer">
                              <input
                                type="checkbox"
                                checked={item.completed}
                                onChange={(e) => handleCheckboxChange(item.id, e.target.checked)}
                                className="rounded border-border text-accent focus:ring-accent w-4 h-4"
                              />
                              <span className="text-xs">{item.text}</span>
                            </label>
                            
                            {/* Percentage input */}
                            <div className="flex items-center space-x-2 text-xs">
                              <Label htmlFor={`pct-${item.id}`} className="text-muted-foreground">Completed:</Label>
                              <Input
                                id={`pct-${item.id}`}
                                type="number"
                                min="0"
                                max="100"
                                value={item.percentage}
                                onChange={(e) => handlePercentageChange(item.id, e.target.value)}
                                className="w-16 h-8 text-center text-xs font-bold bg-card"
                              />
                              <span className="font-semibold text-charcoal">%</span>
                            </div>
                          </div>

                          {/* Progress slider bar representation */}
                          <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                            <div 
                              className="bg-accent h-full transition-all duration-300"
                              style={{ width: `${item.percentage}%` }}
                            />
                          </div>

                          {/* Detail comment text */}
                          <div className="space-y-1.5">
                            <Label htmlFor={`desc-${item.id}`} className="text-[10px] text-muted-foreground">Daily Progress/Remarks update</Label>
                            <Input
                              id={`desc-${item.id}`}
                              placeholder="Describe work completed today, e.g. plywood frames secured, wiring ran..."
                              value={item.description}
                              onChange={(e) => handleDescriptionChange(item.id, e.target.value)}
                              className="text-xs h-8 bg-card"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button type="submit" disabled={tempChecklist.length === 0} className="w-full bg-accent text-charcoal hover:bg-accent/90 font-bold h-11 shadow-soft">
                  <Save className="w-4 h-4 mr-2" /> Save Site Checklist Logs
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      ) : (
        // ADMIN OPERATIONS TRACKING PANEL
        <div className="space-y-4">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Sites Operations Tracker</span>
          
          <div className="space-y-4">
            {activeSites.map(site => {
              const totalItems = site.checklist.length;
              const completedItems = site.checklist.filter(c => c.completed).length;
              const overallPercent = totalItems > 0 
                ? Math.round((site.checklist.reduce((sum, c) => sum + c.percentage, 0) / (totalItems * 100)) * 100)
                : 0;
              const isExpanded = expandedSiteId === site.id;

              return (
                <Card key={site.id} className="border border-border/50 shadow-soft bg-card overflow-hidden">
                  <CardHeader 
                    onClick={() => toggleExpandSite(site.id)} 
                    className="p-4 cursor-pointer hover:bg-muted/10 transition-colors duration-150 flex flex-row items-center justify-between"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center space-x-2">
                        {isExpanded ? <ChevronDown className="w-4 h-4 text-accent" /> : <ChevronRight className="w-4 h-4 text-accent" />}
                        <CardTitle className="text-sm font-bold text-charcoal">{site.name}</CardTitle>
                      </div>
                      <CardDescription className="text-xs max-w-md truncate ml-6">{site.address}</CardDescription>
                    </div>

                    <div className="flex items-center space-x-4 text-right">
                      <div className="hidden sm:block">
                        <span className="text-[10px] text-muted-foreground block">Items Complete</span>
                        <strong className="text-charcoal font-semibold text-xs">{completedItems} / {totalItems}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground block">Overall Pct</span>
                        <Badge className="bg-accent text-charcoal font-bold">{overallPercent}%</Badge>
                      </div>
                    </div>
                  </CardHeader>

                  {/* Expansion area detailed list */}
                  {isExpanded && (
                    <CardContent className="border-t border-border/40 p-5 bg-secondary/5 space-y-4">
                      {totalItems === 0 ? (
                        <p className="text-xs text-muted-foreground text-center">No checklist elements registered.</p>
                      ) : (
                        <div className="space-y-3.5">
                          {site.checklist.map(item => (
                            <div key={item.id} className="bg-card border border-border/40 p-3.5 rounded-xl space-y-2 text-xs">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2 font-bold text-charcoal">
                                  <CheckCircle className={`w-4 h-4 ${item.completed ? 'text-success' : 'text-muted-foreground'}`} />
                                  <span>{item.text}</span>
                                </div>
                                <Badge variant="outline" className={item.completed ? 'border-success text-success bg-success/5' : 'border-border text-charcoal bg-muted/40'}>
                                  {item.percentage}% Done
                                </Badge>
                              </div>
                              <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                                <div className="bg-accent h-full" style={{ width: `${item.percentage}%` }} />
                              </div>
                              {item.description && (
                                <p className="text-[11px] text-muted-foreground bg-muted/30 p-2 rounded leading-snug border border-border/20 italic">
                                  <strong>Update:</strong> {item.description}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
