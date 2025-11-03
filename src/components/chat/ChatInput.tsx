import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Send, Square } from "lucide-react";
import { toast } from "sonner";

interface ChatInputProps {
  chatId: string | null;
  onChatCreated: (id: string) => void;
  userId: string;
  onGeneratingChange?: (isGenerating: boolean) => void;
}

const ChatInput = ({ chatId, onChatCreated, userId, onGeneratingChange }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [model, setModel] = useState("google/gemini-2.5-flash");
  const [isGenerating, setIsGenerating] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = async () => {
    if (!message.trim() || isGenerating) return;

    let currentChatId = chatId;

    if (!currentChatId) {
      const { data, error } = await supabase
        .from("chats")
        .insert([{ user_id: userId, title: message.substring(0, 50) }])
        .select()
        .single();

      if (error || !data) {
        toast.error("Failed to create chat");
        return;
      }

      currentChatId = data.id;
      onChatCreated(currentChatId);
    }

    const userMessage = message;
    const startTime = Date.now();
    setMessage("");

    try {
      const { error: userMsgError } = await supabase.from("messages").insert([
        {
          chat_id: currentChatId,
          role: "user",
          content: userMessage,
        },
      ]);

      if (userMsgError) throw userMsgError;

      // Small delay to ensure user message renders before showing thinking
      await new Promise(resolve => setTimeout(resolve, 100));
      
      setIsGenerating(true);
      onGeneratingChange?.(true);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            message: userMessage,
            model: model,
            generateImage: false,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to get AI response");
      }

      const data = await response.json();
      const endTime = Date.now();
      const responseTime = Math.round((endTime - startTime) / 1000);

      let finalContent = data.response;
      if (data.images && data.images.length > 0) {
        const imageUrl = data.images[0].image_url.url;
        finalContent = `${data.response}\n\n![](${imageUrl})`;
      }

      await supabase.from("messages").insert([
        {
          chat_id: currentChatId,
          role: "assistant",
          content: `${finalContent}\n\n_Response time: ${responseTime}s_`,
          model: model,
        },
      ]);
    } catch (error: any) {
      toast.error(error.message || "Failed to send message");
    } finally {
      setIsGenerating(false);
      onGeneratingChange?.(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleStopGenerating = () => {
    setIsGenerating(false);
    onGeneratingChange?.(false);
    toast.info("Generation stopped");
  };

  return (
    <div className="border-t border-border glass-panel p-4">
      <div className="max-w-3xl mx-auto space-y-3">
        <div className="flex items-center gap-2">
          <Select value={model} onValueChange={setModel}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="openai/gpt-5">GPT-5</SelectItem>
              <SelectItem value="google/gemini-2.5-flash">
                Gemini 2.5 Flash
              </SelectItem>
              <SelectItem value="google/gemini-2.5-pro">
                Gemini 2.5 Pro
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2 items-center">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask Nova AI..."
            className="min-h-[50px] max-h-[50px] resize-none smooth-transition py-3 flex-1"
            disabled={isGenerating}
          />

          {isGenerating ? (
            <Button
              onClick={handleStopGenerating}
              size="icon"
              variant="outline"
              className="h-[44px] w-[44px] rounded-lg border-2 smooth-transition hover-scale hover:bg-destructive/10 hover:border-destructive"
            >
              <Square className="w-4 h-4 fill-current" />
            </Button>
          ) : (
            <Button
              onClick={handleSend}
              disabled={!message.trim()}
              size="icon"
              className="h-[44px] w-[44px] rounded-lg smooth-transition hover-scale disabled:opacity-50"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Send className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
