import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles } from "lucide-react";
import MessageBubble from "./MessageBubble";

interface Message {
  id: string;
  role: string;
  content: string;
  model?: string;
  created_at: string;
}

interface ChatMessagesProps {
  chatId: string | null;
  isGenerating?: boolean;
}

const ChatMessages = ({ chatId, isGenerating }: ChatMessagesProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chatId) {
      setMessages([]);
      return;
    }

    fetchMessages();

    const channel = supabase
      .channel("messages")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `chat_id=eq.${chatId}`,
        },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating]);

  const fetchMessages = async () => {
    if (!chatId) return;

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("chat_id", chatId)
      .order("created_at", { ascending: true });

    if (!error && data) {
      setMessages(data);
    }
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  if (!chatId) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-2xl">
          <div
            className="w-20 h-20 rounded-full mx-auto flex items-center justify-center"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold gradient-text mb-2 font-poppins">
              Welcome to Nova AI
            </h2>
            <p className="text-muted-foreground mb-6">
              Ask me anything - I'm powered by the latest AI models
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8">
            <button className="glass-panel rounded-xl p-4 hover:shadow-smooth hover-scale smooth-transition text-left">
              <div className="text-2xl mb-2">🎨</div>
              <h3 className="font-semibold text-sm mb-1">Create Image</h3>
              <p className="text-xs text-muted-foreground">Generate stunning visuals</p>
            </button>
            
            <button className="glass-panel rounded-xl p-4 hover:shadow-smooth hover-scale smooth-transition text-left">
              <div className="text-2xl mb-2">📝</div>
              <h3 className="font-semibold text-sm mb-1">Summarize Text</h3>
              <p className="text-xs text-muted-foreground">Condense any content</p>
            </button>
            
            <button className="glass-panel rounded-xl p-4 hover:shadow-smooth hover-scale smooth-transition text-left">
              <div className="text-2xl mb-2">💻</div>
              <h3 className="font-semibold text-sm mb-1">Write Code</h3>
              <p className="text-xs text-muted-foreground">Build anything you imagine</p>
            </button>
            
            <button className="glass-panel rounded-xl p-4 hover:shadow-smooth hover-scale smooth-transition text-left">
              <div className="text-2xl mb-2">💡</div>
              <h3 className="font-semibold text-sm mb-1">Get Ideas</h3>
              <p className="text-xs text-muted-foreground">Brainstorm solutions</p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1 p-4" ref={scrollRef}>
      <div className="max-w-3xl mx-auto space-y-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {isGenerating && (
          <div className="flex gap-3 animate-fade-in">
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-primary to-accent text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="glass-panel rounded-2xl px-4 py-3 bg-card/50">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Thinking</span>
                <div className="flex gap-1">
                  <span className="w-1 h-1 rounded-full bg-primary animate-pulse" style={{ animationDelay: "0ms" }} />
                  <span className="w-1 h-1 rounded-full bg-primary animate-pulse" style={{ animationDelay: "150ms" }} />
                  <span className="w-1 h-1 rounded-full bg-primary animate-pulse" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

export default ChatMessages;
