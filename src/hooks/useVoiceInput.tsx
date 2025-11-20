import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

export const useVoiceInput = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check if browser supports speech recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        const current = event.resultIndex;
        const transcriptText = event.results[current][0].transcript;
        setTranscript(transcriptText);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        setError(event.error);
        
        switch (event.error) {
          case 'network':
            toast.error("Network error. Please check your internet connection and try again.");
            break;
          case 'not-allowed':
            toast.error("Microphone access denied. Please allow microphone access in your browser settings.");
            break;
          case 'no-speech':
            toast.warning("No speech detected. Please try again and speak clearly.");
            break;
          case 'aborted':
            break;
          default:
            toast.error(`Speech recognition error: ${event.error}`);
        }
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startListening = async () => {
    if (recognitionRef.current && !isListening) {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        
        setTranscript("");
        setError(null);
        recognitionRef.current.start();
        setIsListening(true);
        toast.success("Listening... speak now");
      } catch (err) {
        toast.error("Microphone access denied. Please allow microphone access.");
        console.error("Microphone permission error:", err);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      if (transcript) {
        toast.success("Voice input captured");
      }
    }
  };

  const resetTranscript = () => {
    setTranscript("");
  };

  return {
    isListening,
    transcript,
    isSupported,
    error,
    startListening,
    stopListening,
    resetTranscript,
  };
};
