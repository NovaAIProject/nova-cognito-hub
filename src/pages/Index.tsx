import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, Zap, Shield, Cpu } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

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
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 animate-fade-in font-poppins">
            Experience the future of AI conversation. Generate images, code, and intelligent responses
            powered by GPT-5, Claude, and Gemini models.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
            <Button
              onClick={() => navigate("/auth")}
              size="lg"
              className="text-lg px-8 py-6 hover-scale smooth-transition"
              style={{ background: "var(--gradient-primary)" }}
            >
              Get Started
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-16">
            <div className="glass-panel rounded-xl p-6 smooth-transition hover:shadow-smooth hover-scale animate-fade-in">
              <Zap className="w-8 h-8 mb-4 text-primary" />
              <h3 className="font-semibold text-lg mb-2">Lightning Fast</h3>
              <p className="text-sm text-muted-foreground">
                Switch between GPT-5, Claude, and Gemini models instantly
              </p>
            </div>
            
            <div className="glass-panel rounded-xl p-6 smooth-transition hover:shadow-smooth hover-scale animate-fade-in">
              <Shield className="w-8 h-8 mb-4 text-primary" />
              <h3 className="font-semibold text-lg mb-2">Secure & Private</h3>
              <p className="text-sm text-muted-foreground">
                Your conversations are encrypted and private
              </p>
            </div>
            
            <div className="glass-panel rounded-xl p-6 smooth-transition hover:shadow-smooth hover-scale animate-fade-in">
              <Cpu className="w-8 h-8 mb-4 text-primary" />
              <h3 className="font-semibold text-lg mb-2">Powerful AI</h3>
              <p className="text-sm text-muted-foreground">
                Generate images, code, and creative content
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
