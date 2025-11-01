import { Sparkles } from "lucide-react";

const ChatHeader = () => {
  return (
    <header className="border-b border-border glass-panel p-4">
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: "var(--gradient-primary)" }}
        >
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-xl gradient-text">Nova AI</h1>
          <p className="text-xs text-muted-foreground">Your intelligent assistant</p>
        </div>
      </div>
    </header>
  );
};

export default ChatHeader;
