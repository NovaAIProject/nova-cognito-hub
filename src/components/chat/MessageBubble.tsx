import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check, Sparkles } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";

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
  const [username, setUsername] = useState<string>("U");
  const isUser = message.role === "user";

  useEffect(() => {
    if (isUser) {
      const fetchUsername = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("username")
            .eq("user_id", user.id)
            .single();
          
          if (profile?.username) {
            setUsername(profile.username.charAt(0).toUpperCase());
          }
        }
      };
      fetchUsername();
    }
  }, [isUser]);

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
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-semibold ${
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-gradient-to-br from-primary to-accent text-white"
        }`}
      >
        {isUser ? username : <Sparkles className="w-4 h-4" />}
      </div>

      <div className="group flex-1 space-y-2">
        <div
          className={`glass-panel rounded-2xl p-4 smooth-transition ${
            isUser
              ? "bg-primary/10 ml-auto max-w-[80%]"
              : "bg-card/50 mr-auto max-w-[90%]"
          }`}
        >
          <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:mt-3 prose-headings:mb-2 prose-p:my-2 prose-pre:bg-muted prose-pre:p-3 prose-pre:rounded-lg">
            <ReactMarkdown>{message.content}</ReactMarkdown>
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
