import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Sparkles, Mail, Lock, Loader2, User, Eye, EyeOff } from "lucide-react";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const navigate = useNavigate();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLogin && !showVerification) {
      // Step 1: Send verification code
      setLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('send-verification-code', {
          body: { email }
        });

        if (error) throw error;

        setShowVerification(true);
        toast.success(`Verification code sent to ${email}`);
        // In development, show the code (remove in production!)
        if (data.code) {
          toast.info(`Your verification code is: ${data.code}`);
        }
      } catch (error: any) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!isLogin && showVerification) {
      // Step 2: Verify code and create account
      setLoading(true);
      try {
        // Verify the code
        const { data: codes, error: verifyError } = await supabase
          .from('verification_codes')
          .select('*')
          .eq('email', email)
          .eq('code', verificationCode)
          .eq('verified', false)
          .gte('expires_at', new Date().toISOString())
          .order('created_at', { ascending: false })
          .limit(1);

        if (verifyError || !codes || codes.length === 0) {
          throw new Error('Invalid or expired verification code');
        }

        // Mark code as verified
        await supabase
          .from('verification_codes')
          .update({ verified: true })
          .eq('id', codes[0].id);

        // Create account
        if (!username.trim()) {
          toast.error("Username is required");
          setLoading(false);
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/chat`,
            data: {
              username: username.trim(),
            },
          },
        });

        if (error) throw error;

        // Create welcome chat
        if (data.user) {
          const { error: chatError } = await supabase
            .from("chats")
            .insert([{
              user_id: data.user.id,
              title: "Welcome Chat 👋"
            }]);

          if (chatError) console.error("Failed to create welcome chat:", chatError);
        }

        toast.success("Account created! Welcome to Nova AI");
        navigate("/chat");
      } catch (error: any) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Login flow
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      toast.success("Welcome back!");
      navigate("/chat");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/chat`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-secondary/20" 
           style={{ background: "var(--gradient-mesh)" }} />
      
      {/* Auth card */}
      <div className="glass-panel rounded-2xl p-8 w-full max-w-md relative z-10 shadow-2xl smooth-transition hover:shadow-glow">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
               style={{ background: "var(--gradient-primary)" }}>
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold gradient-text mb-2">Nova AI</h1>
          <p className="text-muted-foreground">
            {isLogin ? "Welcome back" : "Create your account"}
          </p>
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-4">
          {!isLogin && !showVerification && (
            <div className="space-y-2 animate-fade-in">
              <Label htmlFor="username" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Username
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
                required={!isLogin}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              disabled={showVerification}
            />
          </div>

          {!showVerification && (
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          )}

          {!isLogin && showVerification && (
            <div className="space-y-2 animate-fade-in">
              <Label htmlFor="code" className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Verification Code
              </Label>
              <Input
                id="code"
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Enter 6-digit code"
                required
                maxLength={6}
              />
              <p className="text-xs text-muted-foreground">
                Check your email for the verification code
              </p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full smooth-transition hover-scale"
            style={{ background: "var(--gradient-primary)" }}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : showVerification ? (
              "Verify & Create Account"
            ) : isLogin ? (
              "Sign In"
            ) : (
              "Send Verification Code"
            )}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          {isLogin ? "Don't have an account? " : showVerification ? "Wrong email? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setShowVerification(false);
              setVerificationCode("");
            }}
            className="text-primary hover:underline font-medium"
          >
            {isLogin ? "Sign up" : showVerification ? "Go back" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;
