import { Sparkles, Menu, Plus, PanelLeftClose, PanelLeft } from "lucide-react";
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
            className="hover-scale smooth-transition"
          >
            {sidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeft className="w-5 h-5" />}
          </Button>
          <div
            className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg md:text-xl gradient-text font-poppins">Nova AI</h1>
            <p className="text-xs text-muted-foreground hidden sm:block">Powered by advanced AI models</p>
          </div>
        </div>
        
        <Button
          onClick={onNewChat}
          variant="ghost"
          size="icon"
          className="shrink-0 hover-scale smooth-transition border border-border"
        >
          <Plus className="w-5 h-5" />
        </Button>
      </div>
    </header>
  );
};

export default ChatHeader;
