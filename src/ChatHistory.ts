import { DurableObject } from "cloudflare:workers";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export class ChatHistory extends DurableObject {
  constructor(ctx: DurableObjectState, env: any) {
    super(ctx, env);
  }

  async addMessage(role: "user" | "assistant", content: string) {
    // Using the newer storage API which is optimized for SQLite
    let history = await this.ctx.storage.get<ChatMessage[]>("history") || [];
    history.push({ role, content });

    // Keep last 20 messages to stay within storage limits
    if (history.length > 20) history = history.slice(-20);

    await this.ctx.storage.put("history", history);
  }

  async getHistory(): Promise<ChatMessage[]> {
    return await this.ctx.storage.get<ChatMessage[]>("history") || [];
  }
}
