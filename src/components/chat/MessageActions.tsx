import { Button } from "@/components/ui/button";
import { Copy, RefreshCw, Check, Volume2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface MessageActionsProps {
  content: string;
  onRegenerate?: () => void;
  isUser: boolean;
}

const MessageActions = ({ content, onRegenerate, isUser }: MessageActionsProps) => {
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = async () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    try {
      setIsSpeaking(true);
      toast.info("Generating speech...");

      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text: content, voice: 'alloy' }
      });

      if (error) throw error;

      if (data.audioContent) {
        const audioBlob = new Blob(
          [Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0))],
          { type: 'audio/mpeg' }
        );
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        audio.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
        };
        
        audio.onerror = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
          toast.error("Failed to play audio");
        };

        await audio.play();
        toast.success("Playing audio");
      }
    } catch (error) {
      console.error("Text-to-speech error:", error);
      toast.error("Failed to generate speech");
      setIsSpeaking(false);
    }
  };

  if (isUser) return null;

  return (
    <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCopy}
        className="h-7 px-2 hover:bg-foreground/10"
      >
        {copied ? (
          <Check className="w-3 h-3 text-green-500" />
        ) : (
          <Copy className="w-3 h-3" />
        )}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleSpeak}
        className="h-7 px-2 hover:bg-foreground/10"
      >
        <Volume2 className={`w-3 h-3 ${isSpeaking ? 'text-primary animate-pulse' : ''}`} />
      </Button>
      {onRegenerate && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRegenerate}
          className="h-7 px-2 hover:bg-foreground/10"
        >
          <RefreshCw className="w-3 h-3" />
        </Button>
      )}
    </div>
  );
};

export default MessageActions;
