import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Sparkles, Zap, Shield, Cpu, Image, FileText, Mic, Globe } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/chat");
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        navigate("/chat");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0" style={{ background: "var(--gradient-mesh)" }} />
      
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-center space-y-8 max-w-4xl">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-4 animate-scale-in"
               style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}>
            <Sparkles className="w-12 h-12 text-white" />
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold mb-6 animate-fade-in font-poppins">
            <span className="gradient-text">Nova AI</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 animate-fade-in font-poppins max-w-3xl mx-auto">
            Experience the future of AI conversation for <span className="text-primary font-semibold">free</span>. 
            Chat with advanced AI, generate images, analyze documents, and get instant voice responses.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
            <Button
              onClick={() => navigate("/auth")}
              size="lg"
              className="text-lg px-8 py-6 hover-scale smooth-transition"
              style={{ background: "var(--gradient-primary)" }}
            >
              Start Chatting Free
            </Button>
            <Button
              onClick={() => navigate("/auth")}
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 hover-scale smooth-transition border-2"
            >
              Learn More
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
            <div className="glass-panel rounded-xl p-6 smooth-transition hover:shadow-smooth hover-scale animate-fade-in">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ background: "var(--gradient-primary)" }}>
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Multiple AI Models</h3>
              <p className="text-sm text-muted-foreground">
                Choose from GPT-5, Gemini Pro, and more advanced models
              </p>
            </div>
            
            <div className="glass-panel rounded-xl p-6 smooth-transition hover:shadow-smooth hover-scale animate-fade-in">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ background: "var(--gradient-primary)" }}>
                <Image className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Image Generation</h3>
              <p className="text-sm text-muted-foreground">
                Create stunning images from text descriptions instantly
              </p>
            </div>
            
            <div className="glass-panel rounded-xl p-6 smooth-transition hover:shadow-smooth hover-scale animate-fade-in">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ background: "var(--gradient-primary)" }}>
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Document Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Upload and analyze PDFs, documents, and notes with AI
              </p>
            </div>
            
            <div className="glass-panel rounded-xl p-6 smooth-transition hover:shadow-smooth hover-scale animate-fade-in">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ background: "var(--gradient-primary)" }}>
                <Mic className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Voice Features</h3>
              <p className="text-sm text-muted-foreground">
                Voice input and text-to-speech for hands-free interaction
              </p>
            </div>
          </div>

          {/* Additional benefits section */}
          <div className="mt-20 glass-panel rounded-2xl p-8 max-w-3xl mx-auto animate-fade-in">
            <h2 className="text-2xl font-bold mb-6 text-center">Why Choose Nova AI?</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex gap-3">
                <Shield className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-medium mb-1">100% Free Forever</h4>
                  <p className="text-sm text-muted-foreground">No hidden costs, no credit card required</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Cpu className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-medium mb-1">Latest AI Models</h4>
                  <p className="text-sm text-muted-foreground">Access to GPT-5 and Gemini 2.5</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Globe className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-medium mb-1">Always Available</h4>
                  <p className="text-sm text-muted-foreground">24/7 access from anywhere in the world</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Sparkles className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-medium mb-1">Regular Updates</h4>
                  <p className="text-sm text-muted-foreground">New features added continuously</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
