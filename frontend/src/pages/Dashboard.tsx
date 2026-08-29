import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getActiveUserSession, setActiveUserSession, User, syncWithBackend } from '@/services/db';
import { toast } from 'sonner';
import {
  LayoutDashboard,
  MapPin,
  CalendarCheck,
  ClipboardList,
  FileSpreadsheet,
  Receipt,
  CreditCard,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  UserCheck,
  Bot,
  Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Import Tab Components (to be created)
import OverviewTab from '@/components/dashboard/OverviewTab';
import SitesTab from '@/components/dashboard/SitesTab';
import AttendanceTab from '@/components/dashboard/AttendanceTab';
import WorkDoneTab from '@/components/dashboard/WorkDoneTab';
import BillsTab from '@/components/dashboard/BillsTab';
import PaymentsTab from '@/components/dashboard/PaymentsTab';
import ChatTab from '@/components/dashboard/ChatTab';
import ChecklistTab from '@/components/dashboard/ChecklistTab';
import SettingsTab from '@/components/dashboard/SettingsTab';
import EnquiriesTab from '@/components/dashboard/EnquiriesTab';
import { ChatbotWidget } from '@/components/ui/ChatbotWidget';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [syncCount, setSyncCount] = useState(0);

  // Auth Guard check
  useEffect(() => {
    const session = getActiveUserSession();
    const token = localStorage.getItem('shree_token');
    if (!session || !token) {
      toast.error("Session expired or invalid. Please sign in again.");
      setActiveUserSession(null);
      navigate('/signin');
    } else {
      setUser(session);
      // Run sync in background
      syncWithBackend().then((success) => {
        if (success) {
          setSyncCount(c => c + 1);
        }
      });
    }
  }, [navigate]);

  if (!user) return <div className="min-h-screen flex items-center justify-center bg-background">Loading session...</div>;

  const handleLogout = () => {
    setActiveUserSession(null);
    toast.success("Successfully logged out");
    navigate('/signin');
  };

  // Define tab navigation buttons based on role permissions
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, roles: ['Admin', 'Manager', 'Staff'] },
    { id: 'sites', label: 'Sites', icon: MapPin, roles: ['Admin', 'Manager', 'Staff'] },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck, roles: ['Admin', 'Manager', 'Staff'] },
    { id: 'checklist', label: 'Checklist Progress', icon: ClipboardList, roles: ['Admin', 'Manager'] },
    { id: 'workdone', label: 'Work Done Submissions', icon: FileSpreadsheet, roles: ['Admin', 'Manager', 'Staff'] },
    { id: 'bills', label: 'Bills Claims', icon: Receipt, roles: ['Admin', 'Manager'] },
    { id: 'payments', label: 'Payments Tracker', icon: CreditCard, roles: ['Admin', 'Manager', 'Staff'] },
    { id: 'chat', label: 'Internal Messages', icon: MessageSquare, roles: ['Admin', 'Manager', 'Staff'] },
    { id: 'enquiries', label: 'Customer Enquiries', icon: Mail, roles: ['Admin'] },
    { id: 'settings', label: 'Account Settings', icon: Settings, roles: ['Admin', 'Manager', 'Staff'] },
  ];

  const visibleMenuItems = menuItems.filter(item => item.roles.includes(user.role));

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab user={user} onTabChange={setActiveTab} />;
      case 'sites':
        return <SitesTab user={user} />;
      case 'attendance':
        return <AttendanceTab user={user} />;
      case 'checklist':
        return <ChecklistTab user={user} />;
      case 'workdone':
        return <WorkDoneTab user={user} />;
      case 'bills':
        return <BillsTab user={user} />;
      case 'payments':
        return <PaymentsTab user={user} />;
      case 'chat':
        return <ChatTab user={user} />;
      case 'enquiries':
        return <EnquiriesTab />;
      case 'settings':
        return <SettingsTab user={user} />;
      default:
        return <OverviewTab user={user} onTabChange={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-secondary/20 flex flex-col md:flex-row relative">
      {/* Mobile Drawer Trigger */}
      <div className="md:hidden flex items-center justify-between p-4 bg-charcoal text-warm-white border-b border-border z-20">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-accent tracking-wide text-lg">Shree Interiors</span>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-warm-white hover:bg-white/10 p-2">
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </Button>
      </div>

      {/* Sidebar Navigation Panel */}
      <aside className={cn(
        "fixed inset-y-0 left-0 w-64 bg-charcoal text-warm-white flex flex-col justify-between p-5 border-r border-border/20 z-30 transition-transform duration-300 md:relative md:translate-x-0 overflow-y-auto",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="space-y-6">
          {/* Logo Brand area */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center font-bold text-charcoal text-sm">S</div>
              <span className="font-bold text-lg tracking-wide">Shree Interiors</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setIsSidebarOpen(false)} className="md:hidden text-warm-white hover:bg-white/10 p-1">
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Active User profile card */}
          <div className="bg-white/5 rounded-xl p-4 border border-white/10 flex items-center space-x-3">
            <div className="w-10 h-10 bg-accent text-charcoal font-bold rounded-full flex items-center justify-center text-sm shadow-soft">
              {user.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="overflow-hidden">
              <h4 className="font-semibold text-sm truncate">{user.name}</h4>
              <div className="flex items-center mt-1 space-x-1">
                <UserCheck className="w-3.5 h-3.5 text-accent" />
                <span className="text-[10px] text-accent font-bold uppercase tracking-wider">{user.role === 'Admin' ? 'Founder Admin' : user.role}</span>
              </div>
            </div>
          </div>

          {/* Nav Items Menu */}
          <nav className="space-y-1.5 pt-4">
            {visibleMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsSidebarOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-accent text-charcoal font-semibold shadow-medium"
                      : "text-warm-white/70 hover:text-warm-white hover:bg-white/5"
                  )}
                >
                  <Icon className={cn("w-4 h-4", isActive ? "text-charcoal" : "text-accent")} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer (Logout) */}
        <div className="pt-4 border-t border-white/10">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full flex items-center justify-start space-x-3 text-warm-white/60 hover:text-destructive hover:bg-white/5 p-2.5 rounded-lg"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Sign Out</span>
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-0 bg-secondary/15 overflow-x-hidden">
        {/* Top Header */}
        <header className="hidden md:flex justify-between items-center bg-card border-b border-border/60 py-4 px-8 shadow-soft">
          <div>
            <h2 className="text-xl font-bold text-charcoal">
              {menuItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
            </h2>
            <p className="text-xs text-muted-foreground">Manage Shree Interiors properties and schedules</p>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-xs text-muted-foreground font-medium bg-secondary py-1.5 px-3 rounded-full border border-border/40">
              📅 {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
            </span>
            <div className="h-4 w-[1px] bg-border" />
            <span className="text-xs font-semibold text-charcoal bg-accent-soft text-accent-foreground border border-accent/20 px-3 py-1.5 rounded-lg">
              Role: {user.role === 'Admin' ? 'Master Admin' : user.role}
            </span>
          </div>
        </header>

        {/* Tab Panel Render */}
        <div className="flex-1 p-4 md:p-8 overflow-y-auto" key={syncCount}>
          {renderActiveTabContent()}
        </div>
      </main>
      <ChatbotWidget />
    </div>
  );
}
