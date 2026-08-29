import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { KeyRound, Mail, ArrowLeft, ShieldAlert } from 'lucide-react';
import logoImage from '@/assets/circle-logo.png';
import { db, setActiveUserSession, User, login } from '@/services/db';

export default function SignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Please enter email and password");
      return;
    }

    setIsLoading(true);

    const user = await login(email, password);

    setIsLoading(false);

    if (user) {
      toast.success(`Welcome back, ${user.name}!`);
      navigate('/dashboard');
    } else {
      toast.error("Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-accent-soft/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Back to main site link */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 flex items-center space-x-2 text-muted-foreground hover:text-charcoal transition-colors duration-200 text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </button>

      <div className="w-full max-w-md z-10 animate-fade-in">
        {/* Logo and Brand Title */}
        <div className="text-center mb-8">
          <img src={logoImage} alt="Shree Interiors Logo" className="h-16 w-16 mx-auto rounded-full object-contain bg-white p-1 shadow-soft mb-3" />
          <h2 className="text-3xl font-bold text-charcoal">Shree Interiors</h2>
          <p className="text-muted-foreground text-sm mt-1">Management Portal</p>
        </div>

        <Card className="border border-border/50 shadow-strong bg-card/90 backdrop-blur-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Sign In</CardTitle>
            <CardDescription className="text-center">
              Access your personalized workspace dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@shreeinteriors.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <Button type="submit" disabled={isLoading} className="w-full bg-accent text-charcoal hover:bg-accent/90 font-semibold h-11">
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="text-center justify-center text-xs text-muted-foreground border-t border-border/30 pt-4">
            © 2026 Shree Interiors. All rights reserved.
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
