import React from 'react';
import Navigation from '@/components/ui/navigation';
import HeroSection from '@/components/sections/HeroSection';
import AboutSection from '@/components/sections/AboutSection';
import ProductsSection from '@/components/sections/ProductsSection';
import GallerySection from '@/components/sections/GallerySection';
import ContactSection from '@/components/sections/ContactSection';
import logoImage from '@/assets/circle-logo.png';
import { ChatbotWidget } from '@/components/ui/ChatbotWidget';

const Index = () => {
  const scrollToContact = () => {
    document.querySelector('#contact')?.scrollIntoView({
      behavior: 'smooth'
    });
  };

  return <div className="min-h-screen bg-background">
      <Navigation />
      
      <main>
        <HeroSection onConsultationClick={scrollToContact} />
        <AboutSection />
        <ProductsSection onContactClick={scrollToContact} />
        <GallerySection />
        <ContactSection />
      </main>

      {/* Footer */}
      <footer className="bg-charcoal text-warm-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8">
              <div className="md:col-span-2">
                <div className="flex items-center space-x-2 mb-4">
                  <img src={logoImage} alt="Shree Interiors Logo" className="h-10 w-10 object-contain rounded-full bg-white p-0.5" />
                  <span className="text-xl font-bold">Shree Interiors</span>
                </div>
                <p className="text-warm-white/80 leading-relaxed mb-4">
                  Transforming spaces into modern interiors with over 15 years of excellence. 
                  We bring your vision to life with premium craftsmanship and innovative design.
                </p>
                <div className="flex space-x-4 text-sm">
                  <span>📞 9941387939, 8015509036</span>
                  <span>✉️ shreeinterior1324@gmail.com</span>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4 text-accent">Services</h4>
                <ul className="space-y-2 text-sm text-warm-white/80">
                  <li>Modular Kitchen</li>
                  <li>Wardrobe & Storage</li>
                  <li>False Ceiling</li>
                  <li>Interior Design</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4 text-accent">Company</h4>
                <ul className="space-y-2 text-sm text-warm-white/80">
                  <li>About Us</li>
                  <li>Our Portfolio</li>
                  <li>Contact</li>
                  <li>Consultation</li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-warm-white/20 mt-8 pt-8 text-center text-sm text-warm-white/60">
              <p>© 2025 Shree Interiors. All rights reserved. | Designed with ❤️ for modern living</p>
            </div>
          </div>
        </div>
      </footer>
      <ChatbotWidget />
    </div>;
};
export default Index;