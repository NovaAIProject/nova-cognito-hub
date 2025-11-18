import { useState } from "react";
import { MessageSquare, MoreVertical, Pencil, Trash2, Copy, Pin, PinOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

interface ChatItemProps {
  chat: {
    id: string;
    title: string;
    pinned?: boolean;
  };
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onRename: (newTitle: string) => void;
  onDuplicate: () => void;
  onTogglePin: () => void;
}

const ChatItem = ({
  chat,
  isActive,
  onSelect,
  onDelete,
  onRename,
  onDuplicate,
  onTogglePin,
}: ChatItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(chat.title);

  const handleRename = () => {
    if (editTitle.trim()) {
      onRename(editTitle);
      setIsEditing(false);
    }
  };

  return (
    <div
      className={`group flex items-center gap-2 p-3 rounded-lg mb-1 smooth-transition cursor-pointer ${
        isActive
          ? "bg-primary/10 border border-primary/20"
          : "hover:bg-secondary/50"
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {chat.pinned && <Pin className="w-3 h-3 text-primary flex-shrink-0" />}
        <MessageSquare className="w-4 h-4 flex-shrink-0" />
      
      {isEditing ? (
        <Input
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onBlur={handleRename}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleRename();
            if (e.key === "Escape") setIsEditing(false);
          }}
          className="h-6 text-sm"
          autoFocus
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <span className="flex-1 truncate text-sm">{chat.title}</span>
      )}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="sm"
            className="opacity-50 group-hover:opacity-100 hover:opacity-100 h-7 w-7 p-0 flex-shrink-0 hover:bg-foreground/10 ml-1"
          >
            <MoreVertical className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onTogglePin}>
            {chat.pinned ? (
              <>
                <PinOff className="w-3 h-3 mr-2" />
                Unpin
              </>
            ) : (
              <>
                <Pin className="w-3 h-3 mr-2" />
                Pin
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsEditing(true)}>
            <Pencil className="w-3 h-3 mr-2" />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onDuplicate}>
            <Copy className="w-3 h-3 mr-2" />
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onDelete} className="text-destructive">
            <Trash2 className="w-3 h-3 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ChatItem;
