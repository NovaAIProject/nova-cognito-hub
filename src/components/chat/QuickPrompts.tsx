import { Button } from "@/components/ui/button";
import { Sparkles, Code, FileText, Lightbulb } from "lucide-react";

interface QuickPromptsProps {
  onPromptSelect: (prompt: string) => void;
}

const QuickPrompts = ({ onPromptSelect }: QuickPromptsProps) => {
  const prompts = [
    {
      icon: Sparkles,
      label: "Brainstorm ideas",
      prompt: "Help me brainstorm creative ideas for",
    },
    {
      icon: Code,
      label: "Write code",
      prompt: "Write clean, efficient code to",
    },
    {
      icon: FileText,
      label: "Summarize",
      prompt: "Provide a clear summary of",
    },
    {
      icon: Lightbulb,
      label: "Explain concept",
      prompt: "Explain this concept in simple terms:",
    },
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-3">
      {prompts.map((item) => (
        <Button
          key={item.label}
          variant="outline"
          size="sm"
          onClick={() => onPromptSelect(item.prompt)}
          className="text-xs hover:bg-primary/10 hover:border-primary/30"
        >
          <item.icon className="w-3 h-3 mr-1" />
          {item.label}
        </Button>
      ))}
    </div>
  );
};

export default QuickPrompts;
