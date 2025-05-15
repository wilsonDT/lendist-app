import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useAuth } from '../contexts/AuthContext';

export default function ForgotPasswordPage() {
  const { sendPasswordResetEmail, isLoading: authLoading, error: authError } = useAuth();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitted(false);
    const { error } = await sendPasswordResetEmail(email);
    if (error) {
      setFormError(error.message);
    } else {
      setIsSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Lendist</h1>
          <p className="text-muted-foreground mt-2">Lending Management System</p>
        </div>

        <Card className="border-border/40">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Reset password</CardTitle>
            <CardDescription>
              {isSubmitted && !formError
                ? "Check your email for reset instructions"
                : "Enter your email to receive a password reset link"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSubmitted && !formError ? (
              <div className="text-center py-4 space-y-4">
                <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full w-fit">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <p className="text-muted-foreground">
                  We&apos;ve sent a password reset link to <strong>{email}</strong>. Please check your inbox and follow the
                  instructions.
                </p>
                <Button className="mt-4 w-full" asChild>
                  <Link to="/login">Return to login</Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="name@example.com" 
                    required 
                    autoComplete="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                {formError && <p className="text-sm text-red-500">{formError}</p>}
                {authError && !formError && <p className="text-sm text-red-500">{authError.message}</p>}
                <Button type="submit" className="w-full" disabled={authLoading}>
                  {authLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                      Sending...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      Send reset link
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </div>
                  )}
                </Button>
              </form>
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            <Link to="/login" className="text-sm text-primary hover:underline flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to login
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 