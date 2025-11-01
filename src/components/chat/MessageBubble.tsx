import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface Message {
  role: string;
  content: string;
  model?: string;
}

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble = ({ message }: MessageBubbleProps) => {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`flex gap-3 animate-fade-in ${
        isUser ? "flex-row-reverse" : "flex-row"
      }`}
    >
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-gradient-to-br from-primary to-accent text-white"
        }`}
      >
        {isUser ? "U" : "AI"}
      </div>

      <div className="group flex-1 space-y-2">
        <div
          className={`glass-panel rounded-2xl p-4 smooth-transition ${
            isUser
              ? "bg-primary/10 ml-auto max-w-[80%]"
              : "bg-card/50 mr-auto max-w-[90%]"
          }`}
        >
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p className="whitespace-pre-wrap m-0">{message.content}</p>
          </div>
        </div>

        {!isUser && (
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 smooth-transition">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-7 px-2"
            >
              {copied ? (
                <Check className="w-3 h-3 text-green-500" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </Button>
            {message.model && (
              <span className="text-xs text-muted-foreground">{message.model}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
