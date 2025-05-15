import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, Github, Twitter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
// import { Separator } from '@/components/ui/separator'; // Assuming it might be missing like in Login
import { useAuth } from '../contexts/AuthContext';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { signUpWithPassword, isLoading: authLoading, error: authError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // const [firstName, setFirstName] = useState(''); // Not directly used by Supabase signUp, but you might store it later
  // const [lastName, setLastName] = useState('');  // Not directly used by Supabase signUp
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Clear local formError when the component unmounts
  useEffect(() => {
    return () => {
      setFormError(null);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null); // Clear previous local form error
    // authError (from context) will be updated by useAuth if signUpWithPassword itself has an issue
    setIsSubmitted(false);

    if (password.length < 8) {
      setFormError("Password must be at least 8 characters long");
      return;
    }

    // First name and last name are not part of Supabase default email/password sign up.
    // You can store them in the `options.data` field if you want to pass them to Supabase,
    // or handle them separately after user creation (e.g., create a profile record).
    const { error: signUpFuncError } = await signUpWithPassword({ 
      email, 
      password,
      // options: { data: { first_name: firstName, last_name: lastName } } // Example of passing extra data
    });

    if (signUpFuncError) {
      setFormError(signUpFuncError.message); // Show error returned by the signUpWithPassword function
    } else {
      // If signUpWithPassword itself didn't return an error, proceed to show confirmation.
      // AuthContext's own error state (authError) might still be set if Supabase internally had an issue.
      setIsSubmitted(true); 
    }
  };

  if (isSubmitted && !formError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md text-center">
          <Card className="border-border/40 p-8">
            <CardTitle className="text-2xl mb-4">Check your email</CardTitle>
            <CardDescription>
              A confirmation link has been sent to <strong>{email}</strong>. 
              Please click the link to complete your registration.
            </CardDescription>
            <Button asChild className="mt-6 w-full">
              <Link to="/login">Return to Sign In</Link>
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Lendist</h1>
          <p className="text-muted-foreground mt-2">Lending Management System</p>
        </div>

        <Card className="border-border/40">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Create an account</CardTitle>
            <CardDescription>Enter your information to create an account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First name</Label>
                  <Input id="firstName" placeholder="John" required onChange={(e) => setFirstName(e.target.value)} value={firstName} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last name</Label>
                  <Input id="lastName" placeholder="Doe" required onChange={(e) => setLastName(e.target.value)} value={lastName} />
                </div>
              </div> */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="name@example.com" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    required
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    <span className="sr-only">{showPassword ? 'Hide password' : 'Show password'}</span>
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Password must be at least 8 characters long</p>
              </div>
              {/* Display local formError first, then context-level authError if no local error */}
              {formError && <p className="text-sm text-red-500 py-2">{formError}</p>}
              {!formError && authError && <p className="text-sm text-red-500 py-2">{authError.message}</p>}
              <Button type="submit" className="w-full" disabled={authLoading}>
                {authLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                    Creating account...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    Create account
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                )}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                By creating an account, you agree to our{" "}
                <Link to="/terms" className="text-primary hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link to="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
              </p>
            </form>

            {/* <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-card px-2 text-xs text-muted-foreground">OR CONTINUE WITH</span>
              </div>
            </div> */}

            <div className="grid grid-cols-2 gap-4 mt-6"> {/* Added mt-6 for spacing */}
              <Button variant="outline" className="w-full" onClick={() => alert('GitHub sign-up not implemented')}>
                <Github className="mr-2 h-4 w-4" />
                Github
              </Button>
              <Button variant="outline" className="w-full" onClick={() => alert('Twitter sign-up not implemented')}>
                <Twitter className="mr-2 h-4 w-4" />
                Twitter
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 