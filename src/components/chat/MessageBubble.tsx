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
  const [displayedContent, setDisplayedContent] = useState("");
  const isUser = message.role === "user";

  // Extract response time from message content
  const responseTimeMatch = message.content.match(/_Response time: (\d+)s_$/);
  const responseTime = responseTimeMatch ? responseTimeMatch[1] : null;
  const contentWithoutTime = responseTime 
    ? message.content.replace(/\n\n_Response time: \d+s_$/, '')
    : message.content;

  // Typing animation for AI responses
  useEffect(() => {
    if (!isUser && contentWithoutTime.length > 100) {
      setDisplayedContent("");
      let index = 0;
      const interval = setInterval(() => {
        if (index < contentWithoutTime.length) {
          setDisplayedContent(contentWithoutTime.slice(0, index + 1));
          index++;
        } else {
          clearInterval(interval);
        }
      }, 5);
      return () => clearInterval(interval);
    } else {
      setDisplayedContent(contentWithoutTime);
    }
  }, [contentWithoutTime, isUser]);

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
      className={`flex gap-3 message-appear ${
        isUser ? "flex-row-reverse" : "flex-row"
      }`}
    >
      <div className="group flex-1 space-y-2">
        {!isUser && responseTime && (
          <div className="text-xs text-muted-foreground ml-1">
            Thought for {responseTime}s
          </div>
        )}
        
        <div
          className={`glass-panel rounded-2xl p-4 smooth-transition ${
            isUser
              ? "bg-primary/10 ml-auto max-w-[80%]"
              : "bg-card/50 mr-auto max-w-[90%]"
          }`}
        >
          <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:mt-4 prose-headings:mb-2 prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-p:my-2 prose-pre:bg-muted prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto prose-code:text-sm prose-code:before:content-none prose-code:after:content-none prose-strong:font-bold prose-strong:text-foreground prose-img:rounded-lg prose-img:shadow-lg">
            <ReactMarkdown
              components={{
                code: ({ node, inline, className, children, ...props }: any) => {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline ? (
                    <div className="my-4">
                      <code className={className} {...props}>
                        {children}
                      </code>
                    </div>
                  ) : (
                    <code className="bg-muted px-1 py-0.5 rounded text-sm" {...props}>
                      {children}
                    </code>
                  );
                },
                p: ({ children }) => (
                  <p className="my-2">{children}</p>
                )
              }}
            >
              {displayedContent}
            </ReactMarkdown>
          </div>
        </div>

        {!isUser && (
          <div className="flex items-center gap-2 smooth-transition">
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
