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
      "Image generation capability",
      "Voice-to-text speech input",
      "User profile management",
      "Contact Support system",
      "Automatic chat title generation",
      "Multiple AI model selection",
      "Dark and light theme modes",
      "Conversation history and search",
      "Model comparison guide"
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
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Changelog</DialogTitle>
          <DialogDescription>
            Recent updates and improvements to Nova AI
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-6">
            {changelogs.map((log) => (
              <div key={log.version} className="border-b border-border pb-4 last:border-0">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xl font-semibold">v{log.version}</span>
                </div>
                <ul className="space-y-2">
                  {log.changes.map((change, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="text-primary mt-1">•</span>
                      <span>{change}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ChangelogDialog;
