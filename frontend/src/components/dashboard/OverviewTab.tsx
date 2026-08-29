import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { db, User } from '@/services/db';
import { MapPin, Users, Receipt, CreditCard, ChevronRight } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area, Legend } from 'recharts';

interface OverviewTabProps {
  user: User;
  onTabChange: (tab: string) => void;
}

export default function OverviewTab({ user, onTabChange }: OverviewTabProps) {
  const sites = db.getSites();
  const attendance = db.getAttendance();
  const bills = db.getBills();
  const payments = db.getPayments();
  const users = db.getUsers();

  // 1. Calculate stats based on role
  const activeSites = sites.filter(s => s.status === 'Active');
  const pastSites = sites.filter(s => s.status === 'Completed');
  const pendingBills = bills.filter(b => b.status === 'Pending');
  const managers = users.filter(u => u.role === 'Manager');
  const staff = users.filter(u => u.role === 'Staff');

  // Filtered stats for display
  const totalSitesCount = user.role === 'Admin' 
    ? sites.length 
    : sites.filter(s => s.managerId === user.id || s.staffIds.includes(user.id)).length;
  
  const activeSitesCount = user.role === 'Admin' 
    ? activeSites.length 
    : activeSites.filter(s => s.managerId === user.id || s.staffIds.includes(user.id)).length;

  const totalStaffCount = user.role === 'Admin' 
    ? staff.length 
    : staff.filter(s => activeSites.some(site => site.managerId === user.id && site.staffIds.includes(s.id))).length;

  const pendingBillsCount = user.role === 'Admin'
    ? pendingBills.length
    : pendingBills.filter(b => b.managerId === user.id).length;

  // Chart Data 1: Site Progress Chart
  const progressChartData = sites.map(site => {
    const total = site.checklist.length;
    const completed = site.checklist.filter(c => c.completed).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return {
      name: site.name.split(' ')[0], // short name
      fullName: site.name,
      percentage: percentage,
    };
  });

  // Chart Data 2: Payment summary
  const paymentsData = [
    { name: 'Approved Bills', amount: payments.filter(p => p.type === 'Bill' && p.status === 'Paid').reduce((sum, p) => sum + p.amount, 0) },
    { name: 'Pending Bills', amount: bills.filter(b => b.status === 'Pending').reduce((sum, b) => sum + b.amount, 0) },
    { name: 'Paid Salaries', amount: payments.filter(p => p.type === 'Salary' && p.status === 'Paid').reduce((sum, p) => sum + p.amount, 0) },
    { name: 'Pending Salaries', amount: payments.filter(p => p.type === 'Salary' && p.status === 'Pending').reduce((sum, p) => sum + p.amount, 0) },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-accent p-6 rounded-2xl text-charcoal border border-accent/20 shadow-soft">
        <h3 className="text-2xl font-bold">Hello, {user.name}!</h3>
        <p className="text-sm text-charcoal/80 mt-1">
          {user.role === 'Admin' 
            ? "Welcome to your Owner Administration dashboard. Here is the operational summary for Shree Interiors sites."
            : `Welcome to your dashboard. You are assigned to ${activeSitesCount} active site(s) as a ${user.role}.`}
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-soft bg-card">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">My Sites</span>
              <h4 className="text-2xl font-bold text-charcoal">{totalSitesCount}</h4>
              <p className="text-[10px] text-muted-foreground">{activeSitesCount} Active / {totalSitesCount - activeSitesCount} Completed</p>
            </div>
            <div className="p-3 bg-accent/20 text-charcoal rounded-xl">
              <MapPin className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        {user.role !== 'Staff' && (
          <Card className="border-0 shadow-soft bg-card">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Staff Supervised</span>
                <h4 className="text-2xl font-bold text-charcoal">{totalStaffCount}</h4>
                <p className="text-[10px] text-muted-foreground">Active on assigned projects</p>
              </div>
              <div className="p-3 bg-accent/20 text-charcoal rounded-xl">
                <Users className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>
        )}

        {user.role !== 'Staff' && (
          <Card className="border-0 shadow-soft bg-card">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Pending Bills</span>
                <h4 className="text-2xl font-bold text-charcoal">{pendingBillsCount}</h4>
                <p className="text-[10px] text-muted-foreground">Awaiting admin clearance approval</p>
              </div>
              <div className="p-3 bg-accent/20 text-charcoal rounded-xl">
                <Receipt className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border-0 shadow-soft bg-card">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Total Payments</span>
              <h4 className="text-2xl font-bold text-charcoal">
                ₹{payments.filter(p => p.status === 'Paid' && (user.role === 'Admin' || p.userId === user.id)).reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
              </h4>
              <p className="text-[10px] text-muted-foreground">Paid Salary & Bills</p>
            </div>
            <div className="p-3 bg-accent/20 text-charcoal rounded-xl">
              <CreditCard className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visualizations Chart Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Site Progress Completion Chart */}
        <Card className="border border-border/50 shadow-soft bg-card">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-charcoal uppercase tracking-wider">Active Site Progress (%)</CardTitle>
            <CardDescription>Overall completion rates based on checklists</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={progressChartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="name" stroke="#888" fontSize={11} />
                <YAxis domain={[0, 100]} stroke="#888" fontSize={11} unit="%" />
                <Tooltip formatter={(value) => [`${value}%`, 'Work Completed']} />
                <Bar dataKey="percentage" fill="hsl(45, 90%, 65%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Expenses / Ledger chart (only visible to admin/managers) */}
        {user.role !== 'Staff' && (
          <Card className="border border-border/50 shadow-soft bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-charcoal uppercase tracking-wider">Financial Overview</CardTitle>
              <CardDescription>Paid Ledger vs. Pending Bills and Salaries</CardDescription>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={paymentsData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis type="number" stroke="#888" fontSize={11} unit="₹" />
                  <YAxis dataKey="name" type="category" stroke="#888" fontSize={10} width={100} />
                  <Tooltip formatter={(value) => [`₹${value}`, 'Amount']} />
                  <Bar dataKey="amount" fill="hsl(20, 14%, 15%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Access panel depending on roles */}
      <Card className="border border-border/50 shadow-soft bg-card">
        <CardHeader>
          <CardTitle className="text-sm font-bold text-charcoal uppercase tracking-wider">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button 
            onClick={() => onTabChange('sites')} 
            variant="outline" 
            className="h-16 flex flex-col items-center justify-center space-y-1 hover:bg-accent/10 border-border/60"
          >
            <span className="font-bold text-xs text-charcoal">View Assigned Sites</span>
            <span className="text-[10px] text-muted-foreground">Manage files & details</span>
          </Button>

          <Button 
            onClick={() => onTabChange('attendance')} 
            variant="outline" 
            className="h-16 flex flex-col items-center justify-center space-y-1 hover:bg-accent/10 border-border/60"
          >
            <span className="font-bold text-xs text-charcoal">
              {user.role === 'Admin' ? 'Check Attendance Logs' : 'Mark Daily Attendance'}
            </span>
            <span className="text-[10px] text-muted-foreground">Geofenced Punch-in</span>
          </Button>

          {user.role !== 'Staff' && (
            <Button 
              onClick={() => onTabChange('bills')} 
              variant="outline" 
              className="h-16 flex flex-col items-center justify-center space-y-1 hover:bg-accent/10 border-border/60"
            >
              <span className="font-bold text-xs text-charcoal">
                {user.role === 'Admin' ? 'Clear Pending Bills' : 'Upload Purchase Bills'}
              </span>
              <span className="text-[10px] text-muted-foreground">Reimbursement panel</span>
            </Button>
          )}

          <Button 
            onClick={() => onTabChange('chat')} 
            variant="outline" 
            className="h-16 flex flex-col items-center justify-center space-y-1 hover:bg-accent/10 border-border/60"
          >
            <span className="font-bold text-xs text-charcoal">Open Messenger</span>
            <span className="text-[10px] text-muted-foreground">Contact Admin/Workers</span>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
