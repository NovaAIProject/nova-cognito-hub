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
          
          <div className="glass-panel px-3 py-1.5 rounded-full border border-border/50 flex items-center gap-2">
            <Crown className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium hidden sm:inline">Nova Plus</span>
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Coming Soon</span>
          </div>
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
    </header>
  );
};

export default ChatHeader;
