import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().trim().nonempty({ message: "Name is required" }).max(100, { message: "Name must be less than 100 characters" }),
  email: z.string().trim().email({ message: "Please enter a valid email address" }).max(255, { message: "Email must be less than 255 characters" }),
  phone: z.string().trim().nonempty({ message: "Phone number is required" }).min(10, { message: "Please enter a valid phone number" }).max(15, { message: "Phone number is too long" }),
  message: z.string().trim().nonempty({ message: "Message is required" }).max(1000, { message: "Message must be less than 1000 characters" })
});

const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      // Validate form data
      const validatedData = contactSchema.parse(formData);
      
      // Send form data to FastAPI contact endpoint
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: validatedData.name,
          email: validatedData.email,
          phone: validatedData.phone,
          message: validatedData.message
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send contact submission');
      }

      const data = await response.json();
      
      if (data?.success) {
        toast({
          title: "Message Sent Successfully!",
          description: "Thank you for contacting us. We'll get back to you within 24 hours.",
        });
        
        // Reset form
        setFormData({ name: '', email: '', phone: '', message: '' });
      } else {
        throw new Error(data?.error || 'Failed to send message');
      }
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        console.error('Contact form error:', error);
        toast({
          title: "Error",
          description: "Something went wrong. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: <MapPin className="w-5 h-5" />,
      title: "Visit Our Office",
      details: "No.97B, Pachaiamman Kovil Street, Erikkarai Main Road, Virugambakkam, Chennai-600092, Tamil Nadu",
      action: "Get Directions"
    },
    {
      icon: <Phone className="w-5 h-5" />,
      title: "Call Us",
      details: "9941387939, 8015509036",
      action: "Call Now"
    },
    {
      icon: <Mail className="w-5 h-5" />,
      title: "Email Us",
      details: "shreeinterior1324@gmail.com",
      action: "Send Email"
    },
    {
      icon: <Clock className="w-5 h-5" />,
      title: "Working Hours",
      details: "Mon - Sat: 9:00 AM - 6:00 PM",
      action: "View Schedule"
    }
  ];

  return (
    <section id="contact" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 animate-fade-in-up">
            <Badge variant="outline" className="mb-4 text-accent border-accent">
              Get In Touch
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-charcoal mb-6">
              Let's Create Something Beautiful Together
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Ready to transform your space? Contact our expert team for a consultation and 
              let's bring your interior design vision to life.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="border-0 shadow-medium animate-slide-in">
                <CardHeader>
                  <CardTitle className="text-2xl text-charcoal flex items-center">
                    <Send className="w-6 h-6 mr-3 text-accent" />
                    Send Us a Message
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium text-charcoal">
                          Full Name *
                        </label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Enter your full name"
                          className={`transition-all duration-300 ${errors.name ? 'border-destructive' : 'focus:border-accent'}`}
                        />
                        {errors.name && (
                          <p className="text-destructive text-sm">{errors.name}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="phone" className="text-sm font-medium text-charcoal">
                          Phone Number *
                        </label>
                        <Input
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="Enter your phone number"
                          className={`transition-all duration-300 ${errors.phone ? 'border-destructive' : 'focus:border-accent'}`}
                        />
                        {errors.phone && (
                          <p className="text-destructive text-sm">{errors.phone}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium text-charcoal">
                        Email Address *
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Enter your email address"
                        className={`transition-all duration-300 ${errors.email ? 'border-destructive' : 'focus:border-accent'}`}
                      />
                      {errors.email && (
                        <p className="text-destructive text-sm">{errors.email}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="message" className="text-sm font-medium text-charcoal">
                        Message *
                      </label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder="Tell us about your project requirements..."
                        rows={5}
                        className={`transition-all duration-300 ${errors.message ? 'border-destructive' : 'focus:border-accent'}`}
                      />
                      {errors.message && (
                        <p className="text-destructive text-sm">{errors.message}</p>
                      )}
                    </div>

                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full bg-accent hover:bg-accent/90 text-charcoal py-3 px-6 transition-all duration-300 hover:shadow-medium"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-charcoal/20 border-t-charcoal rounded-full animate-spin mr-2"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              {contactInfo.map((info, index) => (
                <Card 
                  key={index} 
                  className="border-0 shadow-soft hover:shadow-medium transition-all duration-300 animate-fade-in bg-gradient-card"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 p-3 bg-accent-soft rounded-lg text-accent">
                        {info.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-charcoal mb-2">{info.title}</h4>
                        <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
                          {info.details}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Map */}
              <Card className="border-0 shadow-medium overflow-hidden">
                <CardContent className="p-0">
                  <div className="h-64 bg-gradient-to-br from-secondary to-accent-soft flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="w-12 h-12 text-accent mx-auto mb-4" />
                      <p className="text-charcoal font-medium">Interactive Map</p>
                      <p className="text-muted-foreground text-sm">Coming Soon</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;