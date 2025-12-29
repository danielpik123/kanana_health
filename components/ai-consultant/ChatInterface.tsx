"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Send, Loader2, MessageSquarePlus } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import {
  createConversation,
  getLatestConversation,
  getConversationMessages,
  addMessage,
  getUserConversations,
  conversationNeedsName,
  updateConversationTitle,
} from "@/lib/firebase/conversations";
import { getUserTests } from "@/lib/firebase/tests";
import { ChatMessage, Conversation } from "@/types/conversation";
import { ConversationSidebar } from "./ConversationSidebar";

export function ChatInterface() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingConversation, setLoadingConversation] = useState(true);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [cachedTestData, setCachedTestData] = useState<any>(null);
  const [testDataTimestamp, setTestDataTimestamp] = useState<number>(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Cache test data for 5 minutes
  const TEST_DATA_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load conversations, latest conversation, and test data on mount
  useEffect(() => {
    if (user) {
      loadConversations();
      loadLatestConversation();
      loadTestData();
    } else {
      setLoadingConversation(false);
      setLoadingConversations(false);
    }
  }, [user]);

  // Load all conversations
  const loadConversations = async () => {
    if (!user) return;

    try {
      setLoadingConversations(true);
      const userConversations = await getUserConversations(user.uid);
      setConversations(userConversations);
    } catch (error) {
      console.error("Error loading conversations:", error);
    } finally {
      setLoadingConversations(false);
    }
  };

  // Load test data (cached)
  const loadTestData = async () => {
    if (!user) return;

    const now = Date.now();
    // Use cached data if it's still fresh
    if (cachedTestData && (now - testDataTimestamp) < TEST_DATA_CACHE_DURATION) {
      return;
    }

    try {
      const userTests = await getUserTests(user.uid);
      if (userTests.length > 0) {
        setCachedTestData({
          latestTest: userTests[0],
          testCount: userTests.length,
        });
        setTestDataTimestamp(now);
      } else {
        setCachedTestData(null);
        setTestDataTimestamp(now);
      }
    } catch (error) {
      console.error("Error loading test data:", error);
    }
  };

  const loadLatestConversation = async () => {
    if (!user) return;

    try {
      setLoadingConversation(true);
      const latestConversation = await getLatestConversation(user.uid);

      if (latestConversation) {
        // Load messages for the latest conversation
        const conversationMessages = await getConversationMessages(
          user.uid,
          latestConversation.id
        );
        setConversationId(latestConversation.id);
        setMessages(conversationMessages);
      } else {
        // No conversation exists, start with welcome message
        setMessages([
          {
            id: "welcome",
            role: "assistant",
            content: "Hello! I'm your Kavana Health Specialist. How can I help you understand your health data today?",
            createdAt: new Date(),
          },
        ]);
      }
    } catch (error) {
      console.error("Error loading conversation:", error);
      // Start with welcome message on error
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: "Hello! I'm your Kavana Health Specialist. How can I help you understand your health data today?",
          createdAt: new Date(),
        },
      ]);
    } finally {
      setLoadingConversation(false);
    }
  };

  // Handle conversation selection from sidebar
  const handleSelectConversation = async (selectedId: string) => {
    if (!user || selectedId === conversationId) return;

    try {
      setLoadingConversation(true);
      const conversationMessages = await getConversationMessages(user.uid, selectedId);
      setConversationId(selectedId);
      setMessages(conversationMessages);
    } catch (error) {
      console.error("Error loading conversation:", error);
    } finally {
      setLoadingConversation(false);
    }
  };

  // Handle conversation deletion
  const handleConversationDelete = async (deletedId: string) => {
    if (!user) return;

    // If the deleted conversation was the currently selected one, switch to latest
    if (deletedId === conversationId) {
      try {
        setLoadingConversation(true);
        const latestConversation = await getLatestConversation(user.uid);

        if (latestConversation) {
          const conversationMessages = await getConversationMessages(
            user.uid,
            latestConversation.id
          );
          setConversationId(latestConversation.id);
          setMessages(conversationMessages);
        } else {
          // No conversations left, show welcome message
          setConversationId(null);
          setMessages([
            {
              id: "welcome",
              role: "assistant",
              content: "Hello! I'm your Kavana Health Specialist. How can I help you understand your health data today?",
              createdAt: new Date(),
            },
          ]);
        }
      } catch (error) {
        console.error("Error loading conversation after delete:", error);
        // Fallback to welcome message
        setConversationId(null);
        setMessages([
          {
            id: "welcome",
            role: "assistant",
            content: "Hello! I'm your Kavana Health Specialist. How can I help you understand your health data today?",
            createdAt: new Date(),
          },
        ]);
      } finally {
        setLoadingConversation(false);
      }
    }
  };

  const handleNewChat = async () => {
    if (!user) return;

    try {
      // Create new conversation
      const newConversation = await createConversation(user.uid);
      setConversationId(newConversation.id);
      
      // Reset messages with welcome message
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: "Hello! I'm your Kavana Health Specialist. How can I help you understand your health data today?",
          createdAt: new Date(),
        },
      ]);

      // Reload conversations to include the new one
      await loadConversations();
    } catch (error) {
      console.error("Error creating new conversation:", error);
    }
  };

  // Generate conversation name using GPT
  const generateConversationName = async (firstMessage: string): Promise<string> => {
    try {
      const response = await fetch("/api/chat/name-conversation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ firstMessage }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate conversation name");
      }

      const data = await response.json();
      return data.title || "New Chat";
    } catch (error) {
      console.error("Error generating conversation name:", error);
      return "New Chat";
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading || !user) return;

    // Ensure we have a conversation
    let currentConversationId = conversationId;
    if (!currentConversationId) {
      try {
        const newConversation = await createConversation(user.uid);
        currentConversationId = newConversation.id;
        setConversationId(currentConversationId);
      } catch (error) {
        console.error("Error creating conversation:", error);
        return;
      }
    }

    const userMessageContent = input.trim();
    setInput("");
    setLoading(true);

    // Create user message object
    const userMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: userMessageContent,
      createdAt: new Date(),
    };

    // Add user message to UI immediately
    setMessages((prev) => [...prev, userMessage]);

    try {
      // Save user message to Firestore
      const savedUserMessage = await addMessage(
        user.uid,
        currentConversationId,
        {
          role: "user",
          content: userMessageContent,
        }
      );

      // Update message with saved ID
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === userMessage.id ? savedUserMessage : msg
        )
      );

      // Auto-generate conversation name if needed (check if this is the first user message)
      const currentMessages = [...messages, savedUserMessage];
      const userMessages = currentMessages.filter((m) => m.role === "user");
      if (userMessages.length === 1) {
        // This is the first user message, generate a name
        try {
          const needsName = await conversationNeedsName(user.uid, currentConversationId);
          if (needsName) {
            const generatedName = await generateConversationName(userMessageContent);
            await updateConversationTitle(user.uid, currentConversationId, generatedName);
            // Reload conversations to update the name in the sidebar
            await loadConversations();
          }
        } catch (error) {
          console.error("Error generating conversation name:", error);
          // Don't block the chat flow if naming fails
        }
      }

      // Use cached test data (refresh if stale)
      const now = Date.now();
      if (!cachedTestData || (now - testDataTimestamp) >= TEST_DATA_CACHE_DURATION) {
        await loadTestData();
      }
      const userTestData = cachedTestData;

      // Prepare messages for API (convert to OpenAI format)
      const messagesForAPI = [...messages, savedUserMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      // Call API with user test data
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: messagesForAPI,
          userId: user.uid,
          userTestData: userTestData, // Send test data from client
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();
      
      // Save assistant message to Firestore
      const savedAssistantMessage = await addMessage(
        user.uid,
        currentConversationId,
        {
          role: "assistant",
          content: data.message,
        }
      );

      // Add assistant message to UI
      setMessages((prev) => [...prev, savedAssistantMessage]);

      // Reload conversations to update message count and updatedAt
      await loadConversations();
    } catch (error) {
      console.error("Error:", error);
      // Remove the user message that failed
      setMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id));
      
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: "I'm sorry, I encountered an error. Please try again.",
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loadingConversation) {
    return (
      <div className="flex flex-col h-[calc(100vh-12rem)]">
        <Card className="flex-1 glass-card flex items-center justify-center">
          <div className="flex items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="text-muted-foreground">Loading conversation...</span>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      <div className="flex gap-4 flex-1 overflow-hidden">
        {/* Main Chat Area */}
        <Card className="flex-1 glass-card flex flex-col overflow-hidden">
          {/* Header with New Chat button */}
          <div className="border-b border-border p-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">AI Health Specialist</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNewChat}
              disabled={loading}
            >
              <MessageSquarePlus className="h-4 w-4 mr-2" />
              New Chat
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-4 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/20 text-primary">
                      AI
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
                {message.role === "user" && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-accent/20 text-accent">
                      U
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-4 justify-start">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/20 text-primary">
                    AI
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-lg p-4">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-border p-4">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about your health data..."
                disabled={loading || !user}
                className="flex-1"
              />
              <Button onClick={handleSend} disabled={loading || !input.trim() || !user}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </Card>

        {/* Conversation Sidebar */}
        <ConversationSidebar
          conversations={conversations}
          selectedConversationId={conversationId}
          onSelectConversation={handleSelectConversation}
          onConversationUpdate={loadConversations}
          onConversationDelete={handleConversationDelete}
          loading={loadingConversations}
        />
      </div>
    </div>
  );
}
