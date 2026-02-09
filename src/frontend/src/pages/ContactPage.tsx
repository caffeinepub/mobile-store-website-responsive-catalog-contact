import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useSubmitInquiry } from '../hooks/useQueries';

export default function ContactPage() {
  useDocumentTitle('Contact Us');
  const submitInquiry = useSubmitInquiry();
  
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    message: '',
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await submitInquiry.mutateAsync(formData);
      setShowSuccess(true);
      setFormData({ name: '', contact: '', message: '' });
      
      // Hide success message after 5 seconds
      setTimeout(() => setShowSuccess(false), 5000);
    } catch (error) {
      console.error('Failed to submit inquiry:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: 'Visit Us',
      details: ['Lane 5, SISTER TELESYSTEM', 'Bapuji Nagar, Near Bank of Maharashtra'],
    },
    {
      icon: Phone,
      title: 'Call Us',
      details: ['+91 9937070901', 'Mon-Sat: 9AM-7PM'],
    },
    {
      icon: Mail,
      title: 'Email Us',
      details: ['sister.telesystem@gmail.com'],
    },
    {
      icon: Clock,
      title: 'Store Hours',
      details: ['Mon-Fri: 9AM-7PM', 'Sat-Sun: 10AM-6PM'],
    },
  ];

  return (
    <div className="container py-12">
      <div className="mb-12 text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Get In Touch</h1>
        <p className="text-lg text-muted-foreground">
          Have a question or need assistance? We're here to help! Reach out to us using the form below or visit our store.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Contact Information Cards */}
        <div className="lg:col-span-1 space-y-6">
          {contactInfo.map((info, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <info.icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{info.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {info.details.map((detail, idx) => (
                  <p key={idx} className="text-sm text-muted-foreground">
                    {detail}
                  </p>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2">
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-2xl">Send Us a Message</CardTitle>
              <CardDescription>
                Fill out the form below and we'll get back to you as soon as possible
              </CardDescription>
            </CardHeader>
            <CardContent>
              {showSuccess && (
                <Alert className="mb-6 border-green-500 bg-green-50 dark:bg-green-950">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <AlertDescription className="text-green-800 dark:text-green-200">
                    Thank you for your message! We'll get back to you soon.
                  </AlertDescription>
                </Alert>
              )}

              {submitInquiry.isError && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Failed to send message. Please try again or contact us directly.
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Your Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    disabled={submitInquiry.isPending}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact">
                    Email or Phone <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="contact"
                    name="contact"
                    type="text"
                    placeholder="john@example.com or +91 9876543210"
                    value={formData.contact}
                    onChange={handleChange}
                    required
                    disabled={submitInquiry.isPending}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">
                    Message <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Tell us how we can help you..."
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    required
                    disabled={submitInquiry.isPending}
                  />
                </div>

                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full"
                  disabled={submitInquiry.isPending}
                >
                  {submitInquiry.isPending ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Map Placeholder */}
      <section className="rounded-2xl overflow-hidden bg-muted/30 h-64 flex items-center justify-center">
        <div className="text-center space-y-2">
          <MapPin className="h-12 w-12 text-muted-foreground mx-auto" />
          <p className="text-muted-foreground">Map location placeholder</p>
          <p className="text-sm text-muted-foreground">Lane 5, SISTER TELESYSTEM, Bapuji Nagar, Near Bank of Maharashtra</p>
        </div>
      </section>
    </div>
  );
}
