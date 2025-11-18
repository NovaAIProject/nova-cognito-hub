import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Info } from "lucide-react";

interface ModelComparisonDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const models = [
  {
    name: "Gemini 2.5 Flash",
    description: "Balanced and fast model, perfect for most conversations",
    features: [
      "Quick response times",
      "Great for general conversations",
      "Excellent reasoning capabilities",
      "Cost-effective"
    ],
    bestFor: "Daily conversations, coding help, general questions"
  },
  {
    name: "Gemini 2.5 Pro",
    description: "Most powerful model with advanced reasoning",
    features: [
      "Superior reasoning and analysis",
      "Handles complex tasks",
      "Best quality responses",
      "Multimodal capabilities"
    ],
    bestFor: "Complex problems, in-depth analysis, advanced coding"
  },
  {
    name: "GPT-5",
    description: "OpenAI's flagship model with exceptional performance",
    features: [
      "State-of-the-art reasoning",
      "Excellent at creative tasks",
      "Strong coding capabilities",
      "Nuanced understanding"
    ],
    bestFor: "Creative writing, complex coding, detailed analysis"
  },
  {
    name: "GPT-5 Mini",
    description: "Faster GPT variant with great performance",
    features: [
      "Faster than GPT-5",
      "Strong reasoning",
      "Good for most tasks",
      "More affordable"
    ],
    bestFor: "Quick responses, general tasks, everyday use"
  }
];

const ModelComparisonDialog = ({ open, onOpenChange }: ModelComparisonDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 hover:bg-foreground/10"
        >
          <Info className="w-4 h-4" />
          Model Comparison
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">AI Models</DialogTitle>
          <DialogDescription>
            Compare features and find the best model for your needs
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-6">
            {models.map((model) => (
              <div key={model.name} className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
                <h3 className="text-lg font-semibold mb-2">{model.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">{model.description}</p>
                
                <div className="mb-3">
                  <h4 className="text-sm font-medium mb-2">Features:</h4>
                  <ul className="space-y-1">
                    {model.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <span className="text-primary mt-1">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-muted/50 rounded-md p-3">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Best for:</p>
                  <p className="text-sm">{model.bestFor}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ModelComparisonDialog;
