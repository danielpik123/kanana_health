"use client";

import { useState, useEffect, useRef } from "react";
import { Conversation } from "@/types/conversation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2, MessageSquare, Edit2, Check, X, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { updateConversationTitle, deleteConversation } from "@/lib/firebase/conversations";

interface ConversationSidebarProps {
  conversations: Conversation[];
  selectedConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
  onConversationUpdate?: () => void; // Callback to refresh conversations list
  onConversationDelete?: (conversationId: string) => void; // Callback when conversation is deleted
  loading?: boolean;
}

export function ConversationSidebar({
  conversations,
  selectedConversationId,
  onSelectConversation,
  onConversationUpdate,
  onConversationDelete,
  loading,
}: ConversationSidebarProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  const handleStartEdit = (conversation: Conversation) => {
    setEditingId(conversation.id);
    setEditValue(conversation.title || "New Chat");
  };

  const handleSaveEdit = async (conversationId: string, userId: string) => {
    if (!editValue.trim()) {
      setEditingId(null);
      return;
    }

    try {
      await updateConversationTitle(userId, conversationId, editValue.trim());
      setEditingId(null);
      // Refresh conversations list
      if (onConversationUpdate) {
        onConversationUpdate();
      }
    } catch (error) {
      console.error("Error updating conversation title:", error);
      setEditingId(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  const handleDelete = async (conversation: Conversation, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent selecting the conversation when clicking delete

    if (!confirm(`Are you sure you want to delete "${conversation.title || "New Chat"}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeletingId(conversation.id);
      await deleteConversation(conversation.userId, conversation.id);
      
      // Refresh conversations list
      if (onConversationUpdate) {
        onConversationUpdate();
      }

      // Notify parent that conversation was deleted
      if (onConversationDelete) {
        onConversationDelete(conversation.id);
      }
    } catch (error) {
      console.error("Error deleting conversation:", error);
      alert("Failed to delete conversation. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (date: Date | any): string => {
    const d = date instanceof Date ? date : date?.toDate?.() || new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
      });
    }
  };

  if (loading) {
    return (
      <Card className="w-80 glass-card h-full flex items-center justify-center p-4">
        <div className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Loading conversations...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-80 glass-card h-full flex flex-col overflow-hidden">
      <div className="border-b border-border p-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Conversation History
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {conversations.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No conversations yet. Start a new chat to begin!
          </div>
        ) : (
          <div className="space-y-1">
            {conversations.map((conversation) => {
              const isSelected = conversation.id === selectedConversationId;
              const isEditing = editingId === conversation.id;

              return (
                <div
                  key={conversation.id}
                  className={cn(
                    "group relative rounded-lg p-3 cursor-pointer transition-colors",
                    isSelected
                      ? "bg-primary/20 border border-primary/30"
                      : "hover:bg-muted/50 border border-transparent"
                  )}
                  onClick={() => !isEditing && onSelectConversation(conversation.id)}
                >
                  {isEditing ? (
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <Input
                        ref={inputRef}
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleSaveEdit(conversation.id, conversation.userId);
                          } else if (e.key === "Escape") {
                            handleCancelEdit();
                          }
                        }}
                        className="h-8 text-sm flex-1"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => handleSaveEdit(conversation.id, conversation.userId)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={handleCancelEdit}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <MessageSquare className="h-4 w-4 text-muted-foreground shrink-0" />
                            <p className="text-sm font-medium truncate">
                              {conversation.title || "New Chat"}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{formatDate(conversation.updatedAt)}</span>
                            {conversation.messageCount > 0 && (
                              <>
                                <span>•</span>
                                <span>{conversation.messageCount} messages</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartEdit(conversation);
                            }}
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={(e) => handleDelete(conversation, e)}
                            disabled={deletingId === conversation.id}
                          >
                            {deletingId === conversation.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}

