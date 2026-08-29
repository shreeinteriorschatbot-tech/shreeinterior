import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";

// For demo purposes, we'll use the same images multiple times with different contexts
import modularKitchenImage from "@/assets/modular-kitchen.jpg";
import wardrobeImage from "@/assets/wardrobe-storage.jpg";
import falseCeilingImage from "@/assets/false-ceiling.jpg";
import heroImage from "@/assets/hero-interior.jpg";

const GallerySection = () => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  const galleryItems = [
    {
      id: 1,
      image: heroImage,
      title: "Modern Living Room",
      category: "Living Room",
      description: "Elegant contemporary living space with premium furnishing"
    },
    {
      id: 2,
      image: modularKitchenImage,
      title: "Premium Modular Kitchen",
      category: "Kitchen",
      description: "State-of-the-art kitchen with smart storage solutions"
    },
    {
      id: 3,
      image: wardrobeImage,
      title: "Custom Wardrobe Design",
      category: "Storage",
      description: "Spacious wardrobe with organized compartments"
    },
    {
      id: 4,
      image: falseCeilingImage,
      title: "Designer False Ceiling",
      category: "Ceiling",
      description: "Sophisticated ceiling design with integrated lighting"
    },
    {
      id: 5,
      image: heroImage,
      title: "Luxury Bedroom Suite",
      category: "Bedroom",
      description: "Comfortable and stylish bedroom interior"
    },
    {
      id: 6,
      image: modularKitchenImage,
      title: "Contemporary Kitchen Island",
      category: "Kitchen",
      description: "Modern kitchen with functional island design"
    },
    {
      id: 7,
      image: wardrobeImage,
      title: "Walk-in Closet",
      category: "Storage",
      description: "Spacious walk-in closet with premium finishes"
    },
    {
      id: 8,
      image: falseCeilingImage,
      title: "Ambient Ceiling Design",
      category: "Ceiling",
      description: "Creative ceiling with mood lighting"
    }
  ];

  const categories = ["All", "Living Room", "Kitchen", "Storage", "Ceiling", "Bedroom"];
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredItems = activeCategory === "All" 
    ? galleryItems 
    : galleryItems.filter(item => item.category === activeCategory);

  return (
    <section id="gallery" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 animate-fade-in-up">
            <Badge variant="outline" className="mb-4 text-accent border-accent">
              Our Portfolio
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-charcoal mb-6">
              Gallery of Our Finest Work
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Explore our portfolio of completed projects showcasing our expertise in 
              transforming spaces into beautiful, functional environments.
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((category) => (
              <Button
                key={category}
                variant={activeCategory === category ? "default" : "outline"}
                onClick={() => setActiveCategory(category)}
                className={cn(
                  "transition-all duration-300",
                  activeCategory === category 
                    ? "bg-accent text-charcoal hover:bg-accent/90" 
                    : "border-accent text-accent hover:bg-accent hover:text-charcoal"
                )}
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Gallery Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item, index) => (
              <Card 
                key={item.id}
                className="group border-0 shadow-soft hover:shadow-strong transition-all duration-500 overflow-hidden animate-scale-in cursor-pointer"
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => setSelectedImage(item.id)}
              >
                <div className="relative">
                  <img 
                    src={item.image}
                    alt={item.title}
                    className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <Badge variant="secondary" className="mb-2 text-xs">
                        {item.category}
                      </Badge>
                      <h4 className="text-white font-semibold text-sm mb-1">{item.title}</h4>
                      <p className="text-white/80 text-xs">{item.description}</p>
                    </div>
                  </div>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                      <ZoomIn className="w-4 h-4 text-charcoal" />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Load More Button */}
          <div className="text-center mt-12">
            <Button 
              variant="outline"
              className="border-accent text-accent hover:bg-accent hover:text-charcoal px-8 py-3"
            >
              View More Projects
            </Button>
          </div>
        </div>
      </div>

      {/* Modal for selected image */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 animate-fade-in">
          <div className="relative max-w-4xl w-full max-h-[90vh] bg-card rounded-lg overflow-hidden animate-scale-in">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-10 bg-black/50 text-white hover:bg-black/70"
            >
              <X className="w-4 h-4" />
            </Button>
            {(() => {
              const item = galleryItems.find(item => item.id === selectedImage);
              return item ? (
                <>
                  <img 
                    src={item.image}
                    alt={item.title}
                    className="w-full h-96 object-cover"
                  />
                  <div className="p-6">
                    <Badge variant="secondary" className="mb-3">
                      {item.category}
                    </Badge>
                    <h3 className="text-2xl font-semibold text-charcoal mb-2">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                </>
              ) : null;
            })()}
          </div>
        </div>
      )}
    </section>
  );
};

export default GallerySection;