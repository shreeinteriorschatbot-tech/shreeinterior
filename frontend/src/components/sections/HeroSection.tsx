import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import heroImage from "@/assets/hero-interior.jpg";

interface HeroSectionProps {
  onConsultationClick: () => void;
}

const HeroSection = ({ onConsultationClick }: HeroSectionProps) => {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage}
          alt="Elegant interior design showcase"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal/80 via-charcoal/60 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center lg:text-left">
        <div className="max-w-4xl mx-auto lg:mx-0">
          <div className="animate-fade-in-up">
            <div className="flex items-center justify-center lg:justify-start mb-6">
              <Sparkles className="w-6 h-6 text-accent mr-2 animate-glow" />
              <span className="text-accent font-medium tracking-wide">PREMIUM INTERIOR DESIGN</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-warm-white mb-6 leading-tight">
              Transforming
              <span className="block text-accent animate-glow">Spaces</span>
              into Modern Interiors
            </h1>
            
            <p className="text-xl md:text-2xl text-warm-white/90 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Create your dream space with Shree Interiors. From modular kitchens to complete home makeovers, 
              we bring your vision to life with premium craftsmanship and innovative design.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button 
                onClick={onConsultationClick}
                className="bg-accent hover:bg-accent/90 text-charcoal font-semibold px-8 py-6 text-lg rounded-xl shadow-strong hover:shadow-medium transition-all duration-300 transform hover:-translate-y-1"
              >
                Get Free Consultation
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              
              <button 
                className="border-2 border-warm-white text-warm-white bg-transparent hover:bg-warm-white hover:text-charcoal px-8 py-4 text-lg rounded-xl transition-all duration-300 transform hover:-translate-y-1 font-semibold flex items-center justify-center"
                onClick={() => document.querySelector('#gallery')?.scrollIntoView({ behavior: 'smooth' })}
              >
                View Our Work
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-12 max-w-lg mx-auto lg:mx-0">
              <div className="text-center lg:text-left">
                <div className="text-2xl md:text-3xl font-bold text-accent">150+</div>
                <div className="text-warm-white/80 text-sm">Projects Completed</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-2xl md:text-3xl font-bold text-accent">5+</div>
                <div className="text-warm-white/80 text-sm">Years Experience</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-2xl md:text-3xl font-bold text-accent">100%</div>
                <div className="text-warm-white/80 text-sm">Client Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <div className="w-6 h-10 border-2 border-warm-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-warm-white/70 rounded-full mt-2 animate-bounce"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;