import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { db, User, Attendance, Site } from '@/services/db';
import { toast } from 'sonner';
import { MapPin, CheckCircle, Clock, MapIcon, Compass, ToggleLeft, ToggleRight, ListFilter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';


interface AttendanceTabProps {
  user: User;
}

// Haversine formula to compute distance in meters between two lat/long points
const getDistanceInMeters = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371e3; // Earth's radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c); // Distance in meters
};

export default function AttendanceTab({ user }: AttendanceTabProps) {
  const [logs, setLogs] = useState<Attendance[]>(db.getAttendance());
  const allSites = db.getSites().filter(s => s.status === 'Active');

  // Filter sites assigned to this manager/staff member
  const assignedSites = user.role === 'Admin'
    ? allSites
    : allSites.filter(s => s.managerId === user.id || s.staffIds.includes(user.id));

  const [selectedSiteId, setSelectedSiteId] = useState(assignedSites[0]?.id || '');
  const [gpsSimulated, setGpsSimulated] = useState(true); // default to true to allow easy out-of-box demo testing!
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [distFromSite, setDistFromSite] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'daywise' | 'sitewise'>('daywise');
  const [selectedSiteFilter, setSelectedSiteFilter] = useState('All');

  // Get active site details
  const activeSite = allSites.find(s => s.id === selectedSiteId);

  // Fetch / Mock geolocation
  useEffect(() => {
    if (!activeSite) return;

    if (gpsSimulated) {
      // Simulate being exactly 12 meters away from T-Nagar (or selected site)
      setCurrentCoords({
        lat: activeSite.latitude + 0.0001,
        lng: activeSite.longitude - 0.00005,
      });
    } else {
      // Get actual geolocation
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setCurrentCoords({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            });
          },
          (err) => {
            toast.error("Could not fetch GPS. Please toggle GPS simulation on.");
            setGpsSimulated(true);
          }
        );
      } else {
        toast.error("Geolocation not supported. Toggled simulation.");
        setGpsSimulated(true);
      }
    }
  }, [selectedSiteId, gpsSimulated, activeSite]);

  // Recalculate distance
  useEffect(() => {
    if (activeSite && currentCoords) {
      const distance = getDistanceInMeters(
        currentCoords.lat,
        currentCoords.lng,
        activeSite.latitude,
        activeSite.longitude
      );
      setDistFromSite(distance);
    } else {
      setDistFromSite(null);
    }
  }, [currentCoords, activeSite]);

  const handlePunch = (type: 'In' | 'Out') => {
    if (!activeSite || distFromSite === null) {
      toast.error("Site location and coordinates not loaded");
      return;
    }

    // Geofencing limit: 100 meters
    if (distFromSite > 100) {
      toast.error(`Punch Rejected. You are ${distFromSite}m away from the site. Geofence range is 100m. Please enable Simulation Mode to test.`);
      return;
    }

    const newLog: Attendance = {
      id: `att-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      role: user.role,
      siteId: activeSite.id,
      siteName: activeSite.name,
      type,
      timestamp: new Date().toISOString(),
      latitude: currentCoords?.lat || 0,
      longitude: currentCoords?.lng || 0,
      isSimulated: gpsSimulated,
      distance: distFromSite,
    };

    const updatedLogs = [newLog, ...logs];
    db.setAttendance(updatedLogs);
    setLogs(updatedLogs);
    toast.success(`Successfully punched ${type} for ${activeSite.name}`);
  };

  // Grouped logs for admin filters
  const getFilteredLogs = () => {
    let filtered = logs;
    if (selectedSiteFilter !== 'All') {
      filtered = filtered.filter(l => l.siteId === selectedSiteFilter);
    }
    return filtered;
  };

  const filteredLogs = getFilteredLogs();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h3 className="text-lg font-bold text-charcoal">Geo-Fenced Attendance Log</h3>
        <p className="text-xs text-muted-foreground">Punches are locked to within 100 meters of the site location</p>
      </div>

      {user.role !== 'Admin' ? (
        // MANAGER / STAFF PUNCH PANEL
        <div className="grid md:grid-cols-3 gap-6">
          {/* Punch Card UI */}
          <Card className="border border-border/50 shadow-soft bg-card md:col-span-2">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-charcoal">Register Daily Shift</CardTitle>
              <CardDescription>Select your assigned site and submit punch logs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {assignedSites.length === 0 ? (
                <p className="text-sm text-destructive font-semibold">You are not assigned to any active renovation sites.</p>
              ) : (
                <>
                  {/* Select Site */}
                  <div className="space-y-1.5">
                    <Label htmlFor="siteSelect">Select Construction/Work Site</Label>
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

                  {/* GPS Mode simulation toggle */}
                  <div className="flex items-center justify-between p-3.5 bg-secondary/35 rounded-xl border border-border/40 text-xs">
                    <div>
                      <strong className="text-charcoal font-bold block mb-0.5">GPS Simulation Override</strong>
                      <span className="text-muted-foreground">Bypasses local device GPS constraints for easy testing.</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setGpsSimulated(!gpsSimulated)}
                      className="p-1 hover:bg-transparent"
                    >
                      {gpsSimulated ? (
                        <ToggleRight className="w-9 h-9 text-accent cursor-pointer" />
                      ) : (
                        <ToggleLeft className="w-9 h-9 text-muted-foreground cursor-pointer" />
                      )}
                    </Button>
                  </div>

                  {/* Geo status */}
                  {activeSite && currentCoords && distFromSite !== null && (
                    <div className="p-4 bg-muted/30 border border-border/30 rounded-xl space-y-2">
                      <h5 className="text-xs font-bold text-charcoal uppercase tracking-wider">Device Geolocation Status</h5>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">Site GPS Coordinates:</span> <br />
                          <strong className="text-charcoal font-semibold">{activeSite.latitude.toFixed(4)}, {activeSite.longitude.toFixed(4)}</strong>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Your GPS Coordinates:</span> <br />
                          <strong className="text-charcoal font-semibold">{currentCoords.lat.toFixed(4)}, {currentCoords.lng.toFixed(4)}</strong>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 pt-2 text-xs border-t border-border/30">
                        <Compass className={`w-4 h-4 ${distFromSite <= 100 ? 'text-success' : 'text-destructive'}`} />
                        <span>
                          Distance to site: <strong className="font-bold">{distFromSite} meters</strong>
                        </span>
                        <Badge variant="outline" className={distFromSite <= 100 ? 'border-success text-success bg-success/5' : 'border-destructive text-destructive bg-destructive/5'}>
                          {distFromSite <= 100 ? 'Within Range (100m)' : 'Out of Geofence'}
                        </Badge>
                      </div>
                    </div>
                  )}

                  {/* Punch Buttons */}
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <Button
                      onClick={() => handlePunch('In')}
                      disabled={distFromSite === null || distFromSite > 100}
                      className="bg-success text-success-foreground hover:bg-success/90 font-bold h-12 shadow-soft"
                    >
                      Punch Shift IN
                    </Button>
                    <Button
                      onClick={() => handlePunch('Out')}
                      disabled={distFromSite === null || distFromSite > 100}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-bold h-12 shadow-soft"
                    >
                      Punch Shift OUT
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Personal Log Panel */}
          <Card className="border border-border/50 shadow-soft bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-charcoal">My Punch Logs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {logs.filter(l => l.userId === user.id).length === 0 ? (
                <p className="text-xs text-muted-foreground">No punches registered today.</p>
              ) : (
                logs.filter(l => l.userId === user.id).map(log => (
                  <div key={log.id} className="flex justify-between items-center text-xs p-2.5 bg-muted/40 border border-border/40 rounded-lg">
                    <div>
                      <div className="flex items-center space-x-1.5 font-bold text-charcoal">
                        <Clock className="w-3.5 h-3.5 text-accent" />
                        <span>Shift {log.type}</span>
                        <Badge variant="outline" className={log.type === 'In' ? 'border-success text-success text-[9px] py-0' : 'border-destructive text-destructive text-[9px] py-0'}>
                          {log.type}
                        </Badge>
                      </div>
                      <span className="text-[10px] text-muted-foreground block mt-1 truncate max-w-[150px]">{log.siteName}</span>
                    </div>
                    <span className="text-[10px] font-semibold text-charcoal">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        // ADMIN / OWNER ATTENDANCE SYSTEM
        <Card className="border border-border/50 shadow-soft bg-card">
          <CardHeader className="bg-gradient-card pb-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-charcoal">Site Attendance Log Ledger</CardTitle>
                <CardDescription>View punches, location accuracy, and shifts registered</CardDescription>
              </div>
              
              {/* Filter controls */}
              <div className="flex items-center space-x-2 text-xs">
                <ListFilter className="w-4 h-4 text-accent" />
                <span className="text-muted-foreground">Filter Site:</span>
                <select
                  value={selectedSiteFilter}
                  onChange={e => setSelectedSiteFilter(e.target.value)}
                  className="bg-card border border-input rounded-md px-2 py-1 text-xs focus:outline-none"
                >
                  <option value="All">All Active Sites</option>
                  {allSites.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-secondary/40 text-charcoal uppercase tracking-wider text-[10px] border-b border-border/40">
                  <tr>
                    <th className="py-3.5 px-6">Worker Name</th>
                    <th className="py-3.5 px-4">Role</th>
                    <th className="py-3.5 px-4">Project Site</th>
                    <th className="py-3.5 px-4">Shift Type</th>
                    <th className="py-3.5 px-4">Punch Time</th>
                    <th className="py-3.5 px-4 text-right">Site Dist.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-muted-foreground">No shift records registered yet.</td>
                    </tr>
                  ) : (
                    filteredLogs.map(log => (
                      <tr key={log.id} className="hover:bg-muted/10">
                        <td className="py-3.5 px-6 font-bold text-charcoal">{log.userName}</td>
                        <td className="py-3.5 px-4">
                          <Badge variant="outline" className="border-border text-muted-foreground text-[9px]">{log.role}</Badge>
                        </td>
                        <td className="py-3.5 px-4 text-muted-foreground">{log.siteName}</td>
                        <td className="py-3.5 px-4">
                          <Badge className={log.type === 'In' ? 'bg-success text-success-foreground' : 'bg-destructive text-destructive-foreground'}>
                            {log.type}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-charcoal">
                          {new Date(log.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <span className="font-semibold text-charcoal block">{log.distance}m</span>
                          <span className="text-[9px] text-muted-foreground block">{log.isSimulated ? 'Simulated' : 'Actual GPS'}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
