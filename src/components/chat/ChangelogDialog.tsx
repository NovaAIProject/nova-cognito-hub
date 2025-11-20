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
import { History } from "lucide-react";

interface ChangelogDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const changelogs = [
  {
    version: "1.0.0",
    changes: [
      { 
        title: "Image Generation", 
        description: "Create stunning AI-generated images from text descriptions" 
      },
      { 
        title: "Voice Input", 
        description: "Convert speech to text with our voice-to-text feature" 
      },
      { 
        title: "Profile Management", 
        description: "Customize your profile settings and preferences" 
      },
      { 
        title: "Support System", 
        description: "Get help anytime with our integrated support chat" 
      },
      { 
        title: "Smart Titles", 
        description: "Automatic chat title generation based on context" 
      },
      { 
        title: "Multiple AI Models", 
        description: "Choose from Gemini, GPT-5, and more powerful models" 
      },
      { 
        title: "Theme Modes", 
        description: "Seamlessly switch between dark and light themes" 
      },
      { 
        title: "Chat History", 
        description: "Search and organize your conversation history" 
      },
      { 
        title: "Model Guide", 
        description: "Compare AI models to choose the best for your needs" 
      }
    ]
  }
];

const ChangelogDialog = ({ open, onOpenChange }: ChangelogDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 hover:bg-foreground/10"
        >
          <History className="w-4 h-4" />
          What's New
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[85vh] border-border/50">
        <DialogHeader className="space-y-3 pb-4 border-b border-border/30">
          <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent font-poppins">
            What's New
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">
            Discover the latest features and improvements
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[520px] pr-4">
          <div className="space-y-8 pt-6">
            {changelogs.map((log) => (
              <div key={log.version} className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                    <span className="text-lg font-bold text-primary font-poppins">v{log.version}</span>
                  </div>
                </div>
                <div className="grid gap-4">
                  {log.changes.map((change, index) => (
                    <div 
                      key={index} 
                      className="group p-4 rounded-xl bg-card/50 border border-border/50 hover:border-primary/30 hover:bg-card/80 transition-all duration-200"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                        <div className="flex-1 space-y-1">
                          <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                            {change.title}
                          </h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {change.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ChangelogDialog;
