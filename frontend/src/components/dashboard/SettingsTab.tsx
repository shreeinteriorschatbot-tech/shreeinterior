import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { db, User } from '@/services/db';
import { Shield, KeyRound, UserPlus, RefreshCw, Key, Trash2, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SettingsTabProps {
  user: User;
}

export default function SettingsTab({ user }: SettingsTabProps) {
  const [usersList, setUsersList] = useState<User[]>(db.getUsers());

  // Self password reset form
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Admin staff creation form
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffPhone, setNewStaffPhone] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<'Admin' | 'Manager' | 'Staff'>('Staff');
  const [newStaffPassword, setNewStaffPassword] = useState('password123');
  const [adminKey, setAdminKey] = useState('');

  // Admin user password override
  const [overrideUserId, setOverrideUserId] = useState(usersList[0]?.id || '');
  const [overridePassword, setOverridePassword] = useState('');

  const handleSelfPasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields");
      return;
    }

    // Get current database record of user
    const dbUser = usersList.find(u => u.id === user.id);
    if (!dbUser || dbUser.password !== oldPassword) {
      toast.error("Incorrect current password");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (newPassword.length < 5) {
      toast.error("Password must be at least 5 characters long");
      return;
    }

    const updatedUsers = usersList.map(u => {
      if (u.id === user.id) {
        return { ...u, password: newPassword };
      }
      return u;
    });

    db.setUsers(updatedUsers);
    setUsersList(updatedUsers);
    
    // Clear form
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    toast.success("Password reset successfully! Please use new password next time you login.");
  };

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName.trim() || !newStaffEmail.trim() || !newStaffPhone.trim() || !newStaffPassword) {
      toast.error("Please fill in all new staff details");
      return;
    }

    const emailCheck = newStaffEmail.toLowerCase().trim();
    if (usersList.some(u => u.email.toLowerCase() === emailCheck)) {
      toast.error("A user with this email address already exists.");
      return;
    }

    if (newStaffRole === 'Admin' && adminKey.trim() !== 'IAMYOURMASTER') {
      toast.error("Invalid Master Admin Special Key!");
      return;
    }

    const newStaff: User = {
      id: `usr-${Date.now()}`,
      name: newStaffName,
      email: emailCheck,
      phone: newStaffPhone,
      role: newStaffRole,
      password: newStaffPassword,
      adminKey: newStaffRole === 'Admin' ? adminKey : undefined
    };

    const updated = [...usersList, newStaff];
    db.setUsers(updated);
    setUsersList(updated);

    // Reset
    setNewStaffName('');
    setNewStaffEmail('');
    setNewStaffPhone('');
    setNewStaffPassword('password123');
    setAdminKey('');
    toast.success(`Account for ${newStaffName} (${newStaffRole}) created successfully!`);
  };

  const handleOverridePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideUserId || !overridePassword) {
      toast.error("Please select a user and enter a new password");
      return;
    }

    const updated = usersList.map(u => {
      if (u.id === overrideUserId) {
        return { ...u, password: overridePassword };
      }
      return u;
    });

    db.setUsers(updated);
    setUsersList(updated);
    
    const targetUser = usersList.find(u => u.id === overrideUserId);
    setOverridePassword('');
    toast.success(`Password for ${targetUser?.name} (${targetUser?.role}) updated successfully!`);
  };

  const handleDeleteUser = async (userId: string) => {
    const targetUser = usersList.find(u => u.id === userId);
    if (!targetUser) return;
    
    let adminKey: string | undefined;
    if (targetUser.role === 'Admin') {
      const adminKeyInput = window.prompt("Enter the Special Master Admin Key to authorize deleting this Admin account:");
      if (adminKeyInput === null) return; // Cancelled
      if (adminKeyInput !== 'IAMYOURMASTER') {
        toast.error("Invalid Master Key. Authorization failed.");
        return;
      }
      adminKey = adminKeyInput;
    }
    
    if (window.confirm(`Are you sure you want to permanently delete the account for ${targetUser.name} (${targetUser.role})?`)) {
      const success = await db.deleteUser(userId, adminKey);
      if (success) {
        const updated = usersList.filter(u => u.id !== userId);
        setUsersList(updated);
        toast.success(`Deleted account for ${targetUser.name}`);
        
        // Update override select if needed
        if (overrideUserId === userId) {
          setOverrideUserId(updated[0]?.id || '');
        }
      } else {
        toast.error("Failed to delete user. Check master key or server connection.");
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in text-sm">
      {/* Self Password Reset Card */}
      <Card className="border border-border/50 shadow-soft bg-card">
        <CardHeader>
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-charcoal flex items-center space-x-1.5">
            <KeyRound className="w-4 h-4 text-accent" />
            <span>Reset Password Settings</span>
          </CardTitle>
          <CardDescription>Reset your personal credential details to secure your workspace</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSelfPasswordReset} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="oldPass">Current Password</Label>
              <Input
                id="oldPass"
                type="password"
                placeholder="Enter current password"
                value={oldPassword}
                onChange={e => setOldPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="newPass">New Password</Label>
              <Input
                id="newPass"
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirmPass">Confirm New Password</Label>
              <Input
                id="confirmPass"
                type="password"
                placeholder="Retype new password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full bg-accent text-charcoal hover:bg-accent/90 font-bold shadow-soft">
              Save Password Changes
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Admin Panel: Password Overrides */}
      {user.role === 'Admin' && (
        <div className="space-y-6">
          {/* Create Staff Account */}
          <Card className="border border-border/50 shadow-soft bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-charcoal flex items-center space-x-1.5">
                <UserPlus className="w-4 h-4 text-accent" />
                <span>Create Staff Account</span>
              </CardTitle>
              <CardDescription>Add new managers or field engineers under the company directory</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateStaff} className="space-y-3.5">
                <div className="space-y-1">
                  <Label htmlFor="staffName">Full Name</Label>
                  <Input
                    id="staffName"
                    placeholder="e.g. Ramesh Babu"
                    value={newStaffName}
                    onChange={e => setNewStaffName(e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="staffEmail">Email Address</Label>
                    <Input
                      id="staffEmail"
                      type="email"
                      placeholder="e.g. ramesh@shreeinteriors.com"
                      value={newStaffEmail}
                      onChange={e => setNewStaffEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="staffPhone">Phone Number</Label>
                    <Input
                      id="staffPhone"
                      placeholder="e.g. 9876543210"
                      value={newStaffPhone}
                      onChange={e => setNewStaffPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="staffRole">Company Role</Label>
                    <select
                      id="staffRole"
                      value={newStaffRole}
                      onChange={e => setNewStaffRole(e.target.value as 'Admin' | 'Manager' | 'Staff')}
                      className="w-full bg-card border border-input rounded-md px-3 py-1.5 text-xs focus:outline-none"
                    >
                      <option value="Staff">Staff / Field Worker</option>
                      <option value="Manager">Project Manager</option>
                      <option value="Admin">Master Admin</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="staffPass">Account Password</Label>
                    <Input
                      id="staffPass"
                      type="text"
                      value={newStaffPassword}
                      onChange={e => setNewStaffPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
                {newStaffRole === 'Admin' && (
                  <div className="space-y-1">
                    <Label htmlFor="adminKey" className="text-destructive font-bold">Special Master Admin Key</Label>
                    <Input
                      id="adminKey"
                      type="password"
                      placeholder="Enter IAMYOURMASTER key"
                      value={adminKey}
                      onChange={e => setAdminKey(e.target.value)}
                      required
                    />
                  </div>
                )}
                <Button type="submit" className="w-full bg-charcoal text-warm-white hover:bg-charcoal/90 font-semibold shadow-soft mt-1">
                  Register Staff Account
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Admin override user passwords */}
          <Card className="border border-border/50 shadow-soft bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-charcoal flex items-center space-x-1.5">
                <Key className="w-4 h-4 text-accent" />
                <span>Override Staff / Client Password</span>
              </CardTitle>
              <CardDescription>Administrative bypass key override for passwords</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleOverridePassword} className="space-y-3.5">
                <div className="space-y-1.5">
                  <Label htmlFor="targetUser">Select Staff / Admin User</Label>
                  <select
                    id="targetUser"
                    value={overrideUserId}
                    onChange={e => setOverrideUserId(e.target.value)}
                    className="w-full bg-card border border-input rounded-md px-3 py-2 text-sm focus:outline-none"
                    required
                  >
                    {usersList.map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="overridePass">Set New Password Override</Label>
                  <Input
                    id="overridePass"
                    placeholder="Enter new forced override password"
                    value={overridePassword}
                    onChange={e => setOverridePassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-accent text-charcoal hover:bg-accent/90 font-bold shadow-soft">
                  Force Reset User Password
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Directory User Management */}
          <Card className="border border-border/50 shadow-soft bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-charcoal flex items-center space-x-1.5">
                <Users className="w-4 h-4 text-accent" />
                <span>Manage Accounts Directory</span>
              </CardTitle>
              <CardDescription>View, audit, or delete active staff/manager accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {usersList.length <= 1 ? (
                  <p className="text-xs text-muted-foreground italic">No other registered accounts found.</p>
                ) : (
                  <div className="divide-y divide-border/40 max-h-[220px] overflow-y-auto pr-1">
                    {usersList.map(u => {
                      if (u.id === user.id) return null; // Can't delete self
                      return (
                        <div key={u.id} className="py-2 flex items-center justify-between text-xs">
                          <div>
                            <p className="font-semibold text-charcoal">{u.name}</p>
                            <p className="text-[10px] text-muted-foreground">{u.email} | {u.phone}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary" className="text-[9px] font-bold">
                              {u.role}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteUser(u.id)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/15 h-7 w-7 p-0 rounded-md"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
