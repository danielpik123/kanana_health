import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  orderBy,
  Timestamp,
  addDoc,
  getDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "./config";
import { Conversation, ChatMessage } from "@/types/conversation";

/**
 * Create a new conversation for a user
 */
export async function createConversation(userId: string): Promise<Conversation> {
  if (!db) {
    throw new Error("Firestore not initialized");
  }

  const conversationsRef = collection(db, "users", userId, "conversations");
  const conversationId = doc(conversationsRef).id;
  const now = Timestamp.now();

  const conversation: Conversation = {
    id: conversationId,
    userId,
    createdAt: now,
    updatedAt: now,
    messageCount: 0,
  };

  await setDoc(doc(conversationsRef, conversationId), {
    ...conversation,
    createdAt: now,
    updatedAt: now,
  });

  return conversation;
}

/**
 * Get all conversations for a user, ordered by updatedAt (latest first)
 */
export async function getUserConversations(userId: string): Promise<Conversation[]> {
  if (!db) {
    throw new Error("Firestore not initialized");
  }

  const conversationsRef = collection(db, "users", userId, "conversations");
  const q = query(conversationsRef, orderBy("updatedAt", "desc"));

  const querySnapshot = await getDocs(q);
  const conversations: Conversation[] = [];

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    conversations.push({
      id: doc.id,
      userId: data.userId,
      title: data.title,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
      messageCount: data.messageCount || 0,
    } as Conversation);
  });

  return conversations;
}

/**
 * Get the latest conversation for a user
 */
export async function getLatestConversation(userId: string): Promise<Conversation | null> {
  const conversations = await getUserConversations(userId);
  return conversations.length > 0 ? conversations[0] : null;
}

/**
 * Get all messages for a conversation
 */
export async function getConversationMessages(
  userId: string,
  conversationId: string
): Promise<ChatMessage[]> {
  if (!db) {
    throw new Error("Firestore not initialized");
  }

  const messagesRef = collection(
    db,
    "users",
    userId,
    "conversations",
    conversationId,
    "messages"
  );
  const q = query(messagesRef, orderBy("createdAt", "asc"));

  const querySnapshot = await getDocs(q);
  const messages: ChatMessage[] = [];

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    messages.push({
      id: doc.id,
      role: data.role,
      content: data.content,
      createdAt: data.createdAt.toDate(),
    } as ChatMessage);
  });

  return messages;
}

/**
 * Add a message to a conversation
 */
export async function addMessage(
  userId: string,
  conversationId: string,
  message: Omit<ChatMessage, "id" | "createdAt">
): Promise<ChatMessage> {
  if (!db) {
    throw new Error("Firestore not initialized");
  }

  const messagesRef = collection(
    db,
    "users",
    userId,
    "conversations",
    conversationId,
    "messages"
  );
  const now = Timestamp.now();

  const messageData = {
    role: message.role,
    content: message.content,
    createdAt: now,
  };

  const docRef = await addDoc(messagesRef, messageData);

  // Update conversation's updatedAt and messageCount
  const conversationRef = doc(db, "users", userId, "conversations", conversationId);
  const conversationDoc = await getDoc(conversationRef);
  
  if (conversationDoc.exists()) {
    const currentCount = conversationDoc.data().messageCount || 0;
    await setDoc(
      conversationRef,
      {
        updatedAt: now,
        messageCount: currentCount + 1,
      },
      { merge: true }
    );
  }

  return {
    id: docRef.id,
    role: message.role,
    content: message.content,
    createdAt: now,
  };
}

/**
 * Get a specific conversation by ID
 */
export async function getConversationById(
  userId: string,
  conversationId: string
): Promise<Conversation | null> {
  if (!db) {
    throw new Error("Firestore not initialized");
  }

  const conversationRef = doc(db, "users", userId, "conversations", conversationId);
  const conversationDoc = await getDoc(conversationRef);

  if (!conversationDoc.exists()) {
    return null;
  }

  const data = conversationDoc.data();
  return {
    id: conversationDoc.id,
    userId: data.userId,
    title: data.title,
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt.toDate(),
    messageCount: data.messageCount || 0,
  } as Conversation;
}

/**
 * Check if a conversation needs a name (has no title or title is "New Chat")
 */
export async function conversationNeedsName(
  userId: string,
  conversationId: string
): Promise<boolean> {
  const conversation = await getConversationById(userId, conversationId);
  return !conversation || !conversation.title || conversation.title === "New Chat";
}

/**
 * Update conversation title (optional, can be generated from first message)
 */
export async function updateConversationTitle(
  userId: string,
  conversationId: string,
  title: string
): Promise<void> {
  if (!db) {
    throw new Error("Firestore not initialized");
  }

  const conversationRef = doc(db, "users", userId, "conversations", conversationId);
  await updateDoc(conversationRef, {
    title,
    updatedAt: Timestamp.now(),
  });
}

/**
 * Delete a conversation and all its messages
 */
export async function deleteConversation(
  userId: string,
  conversationId: string
): Promise<void> {
  if (!db) {
    throw new Error("Firestore not initialized");
  }

  // First, delete all messages in the messages subcollection
  const messagesRef = collection(
    db,
    "users",
    userId,
    "conversations",
    conversationId,
    "messages"
  );
  const messagesSnapshot = await getDocs(messagesRef);
  
  // Delete all messages
  const deletePromises = messagesSnapshot.docs.map((messageDoc) =>
    deleteDoc(doc(messagesRef, messageDoc.id))
  );
  await Promise.all(deletePromises);

  // Then delete the conversation document itself
  const conversationRef = doc(db, "users", userId, "conversations", conversationId);
  await deleteDoc(conversationRef);
}

