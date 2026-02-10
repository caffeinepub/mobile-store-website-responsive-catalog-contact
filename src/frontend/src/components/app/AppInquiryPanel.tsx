import { useState } from 'react';
import { Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSubmitInquiry } from '../../hooks/useQueries';

export default function AppInquiryPanel() {
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

  const isFormValid = formData.name.trim() && formData.contact.trim() && formData.message.trim();

  return (
    <div className="p-4 pb-20">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Send Us an Inquiry</CardTitle>
          <CardDescription>
            Have questions about our products? We're here to help!
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Success Message */}
          {showSuccess && (
            <Alert className="mb-6 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                Thank you! Your inquiry has been submitted successfully. We'll get back to you soon.
              </AlertDescription>
            </Alert>
          )}

          {/* Error Message */}
          {submitInquiry.isError && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to submit inquiry. Please try again.
              </AlertDescription>
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                name="name"
                placeholder="Your full name"
                value={formData.name}
                onChange={handleChange}
                disabled={submitInquiry.isPending}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact">Contact (Phone/Email) *</Label>
              <Input
                id="contact"
                name="contact"
                placeholder="Your phone number or email"
                value={formData.contact}
                onChange={handleChange}
                disabled={submitInquiry.isPending}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                name="message"
                placeholder="Tell us about your inquiry..."
                value={formData.message}
                onChange={handleChange}
                disabled={submitInquiry.isPending}
                rows={6}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full gap-2"
              disabled={!isFormValid || submitInquiry.isPending}
            >
              {submitInquiry.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send Inquiry
                </>
              )}
            </Button>
          </form>

          {/* Contact Info */}
          <div className="mt-6 pt-6 border-t space-y-2 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Or reach us directly:</p>
            <p>📞 +91 9937070901</p>
            <p>✉️ sister.telesystem@gmail.com</p>
            <p>📍 Lane 5, SISTER TELESYSTEM, Bapuji Nagar</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
