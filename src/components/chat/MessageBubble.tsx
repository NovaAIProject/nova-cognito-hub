import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check, Sparkles, Lightbulb } from "lucide-react";
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
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [username, setUsername] = useState<string>("U");
  const [displayedContent, setDisplayedContent] = useState("");
  const isUser = message.role === "user";

  // Extract response time from message content
  const responseTimeMatch = message.content.match(/_Response time: (\d+)s_$/);
  const responseTime = responseTimeMatch ? responseTimeMatch[1] : null;
  const contentWithoutTime = responseTime 
    ? message.content.replace(/\n\n_Response time: \d+s_$/, '')
    : message.content;

  // Instant display for AI responses
  useEffect(() => {
    setDisplayedContent(contentWithoutTime);
  }, [contentWithoutTime]);

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

  const handleCopyCode = async (code: string, language: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(language);
    toast.success(`${language.toUpperCase()} code copied`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div
      className={`flex gap-3 animate-in slide-in-from-bottom-2 duration-300 ${
        isUser ? "flex-row-reverse" : "flex-row"
      }`}
    >
      <div className="group flex-1 space-y-2">
        {!isUser && responseTime && (
          <div className="text-xs text-muted-foreground ml-1 flex items-center gap-1.5">
            <Lightbulb className="w-3 h-3 text-muted-foreground/70" />
            <span>Thought for {responseTime}s</span>
          </div>
        )}
        
        <div
          className={`glass-panel rounded-2xl p-4 smooth-transition ${
            isUser
              ? "bg-primary/10 ml-auto max-w-[80%]"
              : "bg-card/50 mr-auto max-w-[90%]"
          }`}
        >
          <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:mt-4 prose-headings:mb-2 prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-p:my-2 prose-pre:bg-secondary/50 prose-pre:p-4 prose-pre:rounded-xl prose-pre:overflow-x-auto prose-pre:border prose-pre:border-border prose-code:text-sm prose-code:before:content-none prose-code:after:content-none prose-strong:font-bold prose-strong:text-foreground prose-img:rounded-lg prose-img:shadow-lg prose-img:max-w-full">
            <ReactMarkdown
              components={{
                img: ({ src, alt }) => (
                  <div className="my-4 rounded-xl overflow-hidden border border-border/50 bg-card/30">
                    <img 
                      src={src} 
                      alt={alt || "Generated image"} 
                      className="w-full h-auto object-contain max-h-[600px]"
                      loading="lazy"
                    />
                  </div>
                ),
                code: ({ node, inline, className, children, ...props }: any) => {
                  const match = /language-(\w+)/.exec(className || '');
                  const language = match ? match[1] : '';
                  const codeString = String(children).replace(/\n$/, '');
                  
                  return !inline ? (
                    <div className="my-4 rounded-xl overflow-hidden border border-border bg-secondary/50">
                      <div className="px-4 py-2 bg-muted/50 border-b border-border flex items-center justify-between">
                        <span className="text-xs font-mono text-muted-foreground uppercase">
                          {language || 'code'}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyCode(codeString, language || 'code')}
                          className="h-6 px-2 hover:bg-background/50"
                        >
                          {copiedCode === (language || 'code') ? (
                            <Check className="w-3 h-3 text-green-500" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </Button>
                      </div>
                      <pre className="p-4 overflow-x-auto m-0">
                        <code className={`language-${language} text-sm font-mono`} {...props}>
                          {children}
                        </code>
                      </pre>
                    </div>
                  ) : (
                    <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
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
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
