import { Timestamp } from "firebase/firestore";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Timestamp | Date;
}

export interface Conversation {
  id: string;
  userId: string;
  title?: string; // Optional: can be generated from first message
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  messageCount: number; // Number of messages in the conversation
}

