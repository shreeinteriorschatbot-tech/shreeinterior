import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Award, Target, Heart } from "lucide-react";
import anandImage from "@/assets/anand.png";
import arunkumarImage from "@/assets/arunkumar.png";

const AboutSection = () => {
  const partners = [
    {
      name: "Anand R",
      role: "Managing Partner",
      expertise: "Interior Architecture & Design Strategy",
      image: anandImage
    },
    {
      name: "Arunkumar P", 
      role: "Managing Partner",
      expertise: "Project Management & Client Relations",
      image: arunkumarImage
    }
  ];

  const values = [
    {
      title: "Quality Craftsmanship",
      description: "Every project is executed with meticulous attention to detail and premium materials.",
      icon: <Award className="w-8 h-8 text-accent" />
    },
    {
      title: "Client-Centric Approach",
      description: "We listen, understand, and translate your vision into stunning realities.",
      icon: <Heart className="w-8 h-8 text-accent" />
    },
    {
      title: "Innovative Solutions",
      description: "Combining modern trends with timeless elegance for spaces that inspire.",
      icon: <Target className="w-8 h-8 text-accent" />
    }
  ];

  return (
    <section id="about" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 animate-fade-in-up">
            <Badge variant="outline" className="mb-4 text-accent border-accent">
              About Shree Interiors
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-charcoal mb-6">
              Crafting Dreams into Reality
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              With over 15 years of excellence in interior design, Shree Interiors has been transforming 
              homes and spaces across Chennai, creating environments that blend functionality with 
              aesthetic beauty.
            </p>
          </div>

          {/* Company Story */}
          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            <div className="space-y-6 animate-slide-in">
              <h3 className="text-2xl font-semibold text-charcoal">Our Journey</h3>
              <p className="text-muted-foreground leading-relaxed">
                Founded with a passion for creating beautiful, functional spaces, Shree Interiors 
                has grown from a small design studio to one of Chennai's most trusted interior 
                design companies. Our journey is marked by countless satisfied clients and spaces 
                that tell unique stories.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Located in the heart of Virugambakkam, Chennai, we serve clients across Tamil Nadu, 
                bringing modern design sensibilities combined with traditional craftsmanship to 
                every project we undertake.
              </p>
              
              <div className="flex flex-wrap gap-3 pt-4">
                <Badge variant="secondary">5+ Years Experience</Badge>
                <Badge variant="secondary">150+ Projects</Badge>
                <Badge variant="secondary">Chennai Based</Badge>
                <Badge variant="secondary">Full Service Design</Badge>
              </div>
            </div>

            {/* Values */}
            <div className="space-y-6">
              {values.map((value, index) => (
                <Card key={index} className="border-0 shadow-soft hover:shadow-medium transition-all duration-300 animate-fade-in">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 p-2 bg-accent-soft rounded-lg">
                        {value.icon}
                      </div>
                      <div>
                        <h4 className="font-semibold text-charcoal mb-2">{value.title}</h4>
                        <p className="text-muted-foreground text-sm leading-relaxed">{value.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Managing Partners */}
          <div className="text-center mb-12">
            <h3 className="text-3xl font-semibold text-charcoal mb-8">Meet Our Managing Partners</h3>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {partners.map((partner, index) => (
                <Card key={index} className="border-0 shadow-medium hover:shadow-strong transition-all duration-300 animate-scale-in bg-gradient-card">
                  <CardContent className="p-8 text-center">
                    <div className="w-32 h-32 md:w-36 md:h-36 rounded-full overflow-hidden mx-auto mb-6 border-4 border-white shadow-soft relative group">
                      <img src={partner.image} alt={partner.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    </div>
                    <h4 className="text-xl font-semibold text-charcoal mb-2">{partner.name}</h4>
                    <Badge variant="outline" className="mb-4 text-accent border-accent">
                      {partner.role}
                    </Badge>
                    <p className="text-muted-foreground text-sm">{partner.expertise}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <Card className="border-0 shadow-strong bg-gradient-accent text-center">
            <CardContent className="p-8">
              <h4 className="text-2xl font-semibold text-charcoal mb-4">Ready to Transform Your Space?</h4>
              <p className="text-charcoal/80 mb-6">
                Contact our expert team today for a consultation and let's bring your vision to life.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-sm text-charcoal/80">
                <span>📞 9941387939, 8015509036</span>
                <span>✉️ shreeinterior1324@gmail.com</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;