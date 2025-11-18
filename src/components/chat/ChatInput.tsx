import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowUp, Square, Mic, MicOff } from "lucide-react";
import { toast } from "sonner";

interface ChatInputProps {
  chatId: string | null;
  onChatCreated: (id: string) => void;
  userId: string;
  onGeneratingChange?: (isGenerating: boolean) => void;
}

const ChatInput = ({ chatId, onChatCreated, userId, onGeneratingChange }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [model, setModel] = useState("google/gemini-2.5-flash-lite");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [hasSentMessage, setHasSentMessage] = useState(!!chatId);
  const [generateImage, setGenerateImage] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Reset hasSentMessage when chatId changes to null (new chat)
  useEffect(() => {
    if (!chatId) {
      setHasSentMessage(false);
    }
  }, [chatId]);

  const handleSend = async () => {
    if (!message.trim() || isGenerating) return;

    setHasSentMessage(true);
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
      await new Promise(resolve => setTimeout(resolve, 200));
      
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
              generateImage: generateImage,
              chatId: currentChatId,
            }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to get AI response");
      }

      const data = await response.json();
      const endTime = Date.now();
      const responseTime = Math.round((endTime - startTime) / 1000);

      // Stop thinking indicator immediately
      setIsGenerating(false);
      onGeneratingChange?.(false);

      let finalContent = data.response;
      if (data.images && data.images.length > 0) {
        const imageUrl = data.images[0].image_url.url;
        finalContent = `${data.response}\n\n![Generated Image](${imageUrl})`;
      }

      await supabase.from("messages").insert([
        {
          chat_id: currentChatId,
          role: "assistant",
          content: `${finalContent}\n\n_Response time: ${responseTime}s_`,
          model: model,
        },
      ]);

      // Generate a smart title for new chats
      const isNewChat = chatId !== currentChatId;
      if (isNewChat) {
        const titleResponse = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: JSON.stringify({
              message: `Generate a short, concise title (max 4-5 words) for a chat that starts with: "${userMessage.substring(0, 100)}". Return ONLY the title, no quotes or extra text.`,
              model: "google/gemini-2.5-flash",
              generateImage: false,
            }),
          }
        );

        if (titleResponse.ok) {
          const titleData = await titleResponse.json();
          const generatedTitle = titleData.response.trim().replace(/['"]/g, '').substring(0, 50);
          
          await supabase
            .from("chats")
            .update({ title: generatedTitle })
            .eq("id", currentChatId);
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to send message");
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

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.info("Recording started...");
    } catch (error) {
      console.error("Error starting recording:", error);
      toast.error("Failed to start recording");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      toast.info("Transcribing audio...");
      
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];
        
        const { data, error } = await supabase.functions.invoke('transcribe-audio', {
          body: { audio: base64Audio }
        });

        if (error) throw error;

        if (data.text) {
          setMessage(data.text);
          textareaRef.current?.focus();
          toast.success("Transcription complete!");
        }
      };
    } catch (error) {
      console.error("Transcription error:", error);
      toast.error("Failed to transcribe audio");
    }
  };

  return (
    <div className={`w-full ${
      !hasSentMessage 
        ? 'fixed top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 max-w-2xl px-4' 
        : 'p-4 border-t border-border bg-background'
    }`}>
      <div className={`flex flex-col gap-6 ${!hasSentMessage ? 'items-center' : 'max-w-4xl mx-auto'}`}>
        {!hasSentMessage && (
          <h2 className="text-3xl font-semibold text-foreground text-center mb-2">
            How can I help you?
          </h2>
        )}

        <div className={`flex items-center justify-center gap-4 ${!hasSentMessage ? 'opacity-100' : 'opacity-0 hidden'}`}>
          <div className="flex items-center gap-2">
            <Switch
              id="generate-image"
              checked={generateImage}
              onCheckedChange={setGenerateImage}
              className="scale-90"
            />
            <Label htmlFor="generate-image" className="text-sm cursor-pointer">
              Generate Image
            </Label>
          </div>
          
          <Select value={model} onValueChange={setModel}>
            <SelectTrigger className="w-48 h-9 bg-background/50 border-border/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="google/gemini-2.5-pro">Gemini 2.5 Pro</SelectItem>
              <SelectItem value="google/gemini-2.5-flash">Gemini 2.5 Flash</SelectItem>
              <SelectItem value="google/gemini-2.5-flash-lite">Gemini 2.5 Flash Lite</SelectItem>
              <SelectItem value="openai/gpt-5">GPT-5</SelectItem>
              <SelectItem value="openai/gpt-5-mini">GPT-5 Mini</SelectItem>
              <SelectItem value="openai/gpt-5-nano">GPT-5 Nano</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full">
          <div className="relative flex items-center gap-1.5 bg-background border border-border/50 rounded-full pr-1.5 shadow-sm hover:border-border transition-colors">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask Nova AI anything..."
              className="flex-1 resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[48px] max-h-[48px] py-3 px-4 rounded-full overflow-hidden"
              rows={1}
            />
            
            <Button
              variant="ghost"
              size="icon"
              onClick={isRecording ? stopRecording : startRecording}
              className={`rounded-full h-9 w-9 flex-shrink-0 transition-colors hover:bg-foreground/10 ${isRecording ? 'bg-destructive/20 text-destructive hover:bg-destructive/30' : ''}`}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>

            {isGenerating ? (
              <Button
                onClick={handleStopGenerating}
                size="icon"
                variant="ghost"
                className="rounded-full h-9 w-9 flex-shrink-0 hover:bg-foreground/10"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
              </Button>
            ) : (
              <Button
                onClick={handleSend}
                disabled={!message.trim()}
                size="icon"
                variant="ghost"
                className="rounded-full h-9 w-9 flex-shrink-0 hover:bg-foreground/10 disabled:opacity-40"
              >
                <ArrowUp className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {hasSentMessage && (
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                id="generate-image-bottom"
                checked={generateImage}
                onCheckedChange={setGenerateImage}
                className="scale-90"
              />
              <Label htmlFor="generate-image-bottom" className="text-sm cursor-pointer">
                Generate Image
              </Label>
            </div>
            
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger className="w-48 h-9 bg-background/50 border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="google/gemini-2.5-pro">Gemini 2.5 Pro</SelectItem>
                <SelectItem value="google/gemini-2.5-flash">Gemini 2.5 Flash</SelectItem>
                <SelectItem value="google/gemini-2.5-flash-lite">Gemini 2.5 Flash Lite</SelectItem>
                <SelectItem value="openai/gpt-5">GPT-5</SelectItem>
                <SelectItem value="openai/gpt-5-mini">GPT-5 Mini</SelectItem>
                <SelectItem value="openai/gpt-5-nano">GPT-5 Nano</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInput;
