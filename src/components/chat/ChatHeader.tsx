import { Sparkles, Menu, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatHeaderProps {
  onToggleSidebar: () => void;
  onNewChat: () => void;
}

const ChatHeader = ({ onToggleSidebar, onNewChat }: ChatHeaderProps) => {
  return (
    <header className="border-b border-border glass-panel p-3 md:p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 md:gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="md:hidden"
          >
            <Menu className="w-5 h-5" />
          </Button>
          <div
            className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg md:text-xl gradient-text">Nova AI</h1>
            <p className="text-xs text-muted-foreground hidden sm:block">Your intelligent assistant</p>
          </div>
        </div>
        
        <Button
          onClick={onNewChat}
          size="icon"
          className="shrink-0"
          style={{ background: "var(--gradient-primary)" }}
        >
          <Plus className="w-5 h-5" />
        </Button>
      </div>
    </header>
  );
};

export default ChatHeader;
