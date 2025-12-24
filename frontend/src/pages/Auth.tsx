import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useLoginMutation } from '@/api/queries/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Library, LogIn, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const { isAuthenticated } = useAuthStore();
  const loginMutation = useLoginMutation();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    loginMutation.mutate(
      { email, password },
      {
        onError: (err) => {
          setError(err.message || 'Login failed');
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <Card className="w-full max-w-md relative animate-fade-in bg-card/80 backdrop-blur-xl border-border/50">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 shadow-glow">
            <Library className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-display">ECL Library</CardTitle>
          <CardDescription className="font-body">
            Sign in to access the library management system
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="font-body">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@ecl.fr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="bg-secondary/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="font-body">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="bg-secondary/50 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? (
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </>
              )}
            </Button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 p-4 rounded-lg bg-muted/30 border border-border/50">
            <p className="text-xs font-medium text-muted-foreground mb-2">Demo Credentials:</p>
            <div className="space-y-1.5 text-xs font-body">
              <p className="text-muted-foreground">
                <span className="text-foreground font-medium">Admin:</span> admin@ec-lyon.fr / admin123
              </p>
              <p className="text-muted-foreground">
                <span className="text-foreground font-medium">Lab Manager:</span> manager@ec-lyon.fr / manager123
              </p>
              <p className="text-muted-foreground">
                <span className="text-foreground font-medium">User:</span> user@ec-lyon.fr / user123
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
