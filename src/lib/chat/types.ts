export type ChatRole = "system" | "user" | "assistant";

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

export type ChatRequest = {
  messages: ChatMessage[];
  userContext?: {
    userId?: string;
    username?: string;
  };
  preferences?: Record<string, any>;
};

export type ChatResponse = {
  text: string;
};
