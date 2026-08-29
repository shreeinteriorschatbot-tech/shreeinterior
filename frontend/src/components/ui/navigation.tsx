import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import logoImage from "@/assets/circle-logo.png";
import { useNavigate } from 'react-router-dom';
import { getActiveUserSession } from '@/services/db';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const activeUser = getActiveUserSession();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Home', href: '#home' },
    { name: 'About Us', href: '#about' },
    { name: 'Our Products', href: '#products' },
    { name: 'Services', href: '#services' },
    { name: 'Gallery', href: '#gallery' },
    { name: 'Contact Us', href: '#contact' },
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    element?.scrollIntoView({ behavior: 'smooth' });
    setIsOpen(false);
  };

  return (
    <>
      <nav className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "bg-card/95 backdrop-blur-md shadow-soft" : "bg-transparent"
      )}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => scrollToSection('#home')}>
              <img src={logoImage} alt="Shree Interiors Logo" className="h-10 w-10 object-contain rounded-full" />
              <span className="text-xl font-bold text-charcoal">Shree Interiors</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => scrollToSection(item.href)}
                  className="text-muted-foreground hover:text-charcoal transition-colors duration-200 relative group"
                >
                  {item.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all duration-300 group-hover:w-full"></span>
                </button>
              ))}
              <Button
                variant={scrolled ? "default" : "outline"}
                onClick={() => navigate(activeUser ? '/dashboard' : '/signin')}
                className={cn(
                  "ml-4 transition-all duration-300 font-semibold shadow-soft hover:scale-105",
                  scrolled 
                    ? "bg-accent text-charcoal hover:bg-accent/90" 
                    : "border-charcoal text-charcoal hover:bg-charcoal hover:text-warm-white"
                )}
              >
                {activeUser ? "Dashboard" : "Sign In"}
              </Button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(!isOpen)}
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden bg-card/95 backdrop-blur-md border-t border-border">
            <div className="px-4 py-4 space-y-3">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => scrollToSection(item.href)}
                  className="block w-full text-left px-3 py-2 text-muted-foreground hover:text-charcoal hover:bg-secondary rounded-lg transition-colors duration-200"
                >
                  {item.name}
                </button>
              ))}
              <div className="pt-2 border-t border-border">
                <Button
                  onClick={() => {
                    setIsOpen(false);
                    navigate(activeUser ? '/dashboard' : '/signin');
                  }}
                  className="w-full bg-accent text-charcoal hover:bg-accent/90 font-semibold"
                >
                  {activeUser ? "Dashboard" : "Sign In"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navigation;