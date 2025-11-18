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
    version: "1.5.0",
    date: "2024-01-20",
    changes: [
      "Added image generation capability",
      "Integrated voice-to-text speech input",
      "Implemented user profile management with dropdown menu",
      "Added email verification during sign-up"
    ]
  },
  {
    version: "1.4.0",
    date: "2024-01-18",
    changes: [
      "Added working Contact Support system",
      "Improved theme-aware button hover effects",
      "Redesigned generate image toggle with modern switch",
      "Enhanced stop generation button styling"
    ]
  },
  {
    version: "1.3.0",
    date: "2024-01-15",
    changes: [
      "Added message send animations",
      "Fixed thinking indicator timing",
      "Improved sidebar animations with slide effects",
      "Sidebar now hidden by default on new chats"
    ]
  },
  {
    version: "1.2.0",
    date: "2024-01-12",
    changes: [
      "Implemented automatic chat title generation",
      "Enhanced conversation context memory",
      "Added syntax highlighting for code blocks",
      "Redesigned input bar to be more compact"
    ]
  },
  {
    version: "1.1.0",
    date: "2024-01-10",
    changes: [
      "Added admin panel for user management",
      "Implemented light mode as default theme",
      "Improved welcome message animations",
      "Enhanced chat centering when sidebar toggles"
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
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-lg font-semibold">v{log.version}</span>
                  <span className="text-xs text-muted-foreground">{log.date}</span>
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
