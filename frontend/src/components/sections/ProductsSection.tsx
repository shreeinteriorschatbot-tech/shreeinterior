import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChefHat, Layers, Sofa, Grid3X3, Droplets, Palette, Wrench, Home } from "lucide-react";
import modularKitchenImage from "@/assets/modular-kitchen.jpg";
import wardrobeImage from "@/assets/wardrobe-storage.jpg";
import falseCeilingImage from "@/assets/false-ceiling.jpg";

interface ProductsSectionProps {
  onContactClick: () => void;
}

const ProductsSection = ({ onContactClick }: ProductsSectionProps) => {
  const products = [
    {
      title: "Modular Kitchen",
      description: "Transform your cooking space with our premium modular kitchen solutions featuring modern designs, smart storage, and durable materials.",
      image: modularKitchenImage,
      icon: <ChefHat className="w-6 h-6" />,
      features: ["Smart Storage Solutions", "Premium Materials", "Custom Designs", "Modern Appliances"],
      category: "Kitchen"
    },
    {
      title: "Wardrobe & Storage Unit",
      description: "Maximize your space with our elegant wardrobes and storage solutions designed for modern living and optimal organization.",
      image: wardrobeImage,
      icon: <Layers className="w-6 h-6" />,
      features: ["Space Optimization", "Custom Layouts", "Premium Finishes", "Sliding Doors"],
      category: "Storage"
    },
    {
      title: "False Ceiling",
      description: "Add elegance to your interiors with our sophisticated false ceiling designs that enhance lighting and acoustics.",
      image: falseCeilingImage,
      icon: <Grid3X3 className="w-6 h-6" />,
      features: ["LED Integration", "Acoustic Solutions", "Modern Designs", "Easy Maintenance"],
      category: "Ceiling"
    },
    {
      title: "Space Saving Furniture",
      description: "Smart furniture solutions that maximize space utilization while maintaining style and functionality for modern homes.",
      icon: <Sofa className="w-6 h-6" />,
      features: ["Multi-functional", "Compact Design", "Quality Materials", "Custom Solutions"],
      category: "Furniture"
    },
    {
      title: "Movable Furniture",
      description: "Flexible furniture options that adapt to your changing needs with easy mobility and versatile configurations.",
      icon: <Home className="w-6 h-6" />,
      features: ["Easy Mobility", "Versatile Designs", "Durable Build", "Modern Aesthetics"],
      category: "Furniture"
    },
    {
      title: "Shower Cubicle",
      description: "Luxury shower cubicles with modern glass designs, premium fittings, and water-efficient solutions.",
      icon: <Droplets className="w-6 h-6" />,
      features: ["Tempered Glass", "Water Efficient", "Modern Fittings", "Easy Cleaning"],
      category: "Bathroom"
    },
    {
      title: "Wall Painting",
      description: "Professional wall painting services with premium paints, creative designs, and flawless finish for every room.",
      icon: <Palette className="w-6 h-6" />,
      features: ["Premium Paints", "Creative Designs", "Texture Options", "Long Lasting"],
      category: "Painting"
    },
    {
      title: "All Interior Works",
      description: "Complete interior solutions covering every aspect of home and office design with comprehensive project management.",
      icon: <Wrench className="w-6 h-6" />,
      features: ["End-to-End Service", "Project Management", "Quality Assurance", "Timely Delivery"],
      category: "Complete"
    }
  ];

  return (
    <section id="products" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 animate-fade-in-up">
            <Badge variant="outline" className="mb-4 text-accent border-accent">
              Our Products & Services
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-charcoal mb-6">
              Complete Interior Solutions
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              From modular kitchens to complete home makeovers, we offer comprehensive interior 
              design solutions tailored to your lifestyle and preferences.
            </p>
          </div>

          {/* Products Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            {products.map((product, index) => (
              <Card 
                key={index} 
                className="group border-0 shadow-soft hover:shadow-strong transition-all duration-500 hover:-translate-y-2 animate-scale-in bg-gradient-card overflow-hidden"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {product.image && (
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={product.image}
                      alt={product.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                )}
                
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {product.category}
                    </Badge>
                    <div className="p-2 bg-accent-soft rounded-lg text-accent">
                      {product.icon}
                    </div>
                  </div>
                  <CardTitle className="text-lg text-charcoal group-hover:text-accent transition-colors duration-300">
                    {product.title}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    {product.description}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    {product.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center text-xs text-muted-foreground">
                        <div className="w-1 h-1 bg-accent rounded-full mr-2"></div>
                        {feature}
                      </div>
                    ))}
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={onContactClick}
                    className="w-full text-accent hover:bg-accent hover:text-charcoal transition-all duration-300 group-hover:translate-x-1"
                  >
                    Learn More
                    <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <Card className="border-0 shadow-strong bg-gradient-accent inline-block">
              <CardContent className="p-8">
                <h3 className="text-2xl font-semibold text-charcoal mb-4">
                  Ready to Start Your Project?
                </h3>
                <p className="text-charcoal/80 mb-6">
                  Get a free consultation and personalized quote for your interior design needs.
                </p>
                <Button 
                  onClick={onContactClick}
                  className="bg-charcoal hover:bg-charcoal/90 text-warm-white px-8 py-3"
                >
                  Get Free Quote
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductsSection;