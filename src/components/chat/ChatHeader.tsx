import { Sparkles, Menu, Plus, PanelLeftClose, PanelLeft, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatHeaderProps {
  onToggleSidebar: () => void;
  onNewChat: () => void;
  sidebarOpen?: boolean;
}

const ChatHeader = ({ onToggleSidebar, onNewChat, sidebarOpen }: ChatHeaderProps) => {
  return (
    <header className="border-b border-border glass-panel p-3 md:p-4 animate-fade-in">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 md:gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="hover:bg-foreground/10"
          >
            {sidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeft className="w-5 h-5" />}
          </Button>
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
            <h1 className="font-bold text-lg md:text-xl gradient-text font-poppins">Nova AI</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="glass-panel px-3 py-1.5 rounded-full border border-border/50 flex items-center gap-2 animate-fade-in">
            <Crown className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium">Plus</span>
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Coming Soon</span>
          </div>
          
          <Button
            onClick={onNewChat}
            variant="ghost"
            size="icon"
            className="shrink-0 hover:bg-foreground/10 border border-border"
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default ChatHeader;
