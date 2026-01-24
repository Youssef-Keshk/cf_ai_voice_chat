import { ChatHistory } from "./ChatHistory";

// The Durable Object class MUST be exported at the top level
export { ChatHistory };

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default {
  async fetch(request: Request, env: any): Promise<Response> {
    // 1. Immediate CORS handling
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);

    if (url.pathname === "/chat" && request.method === "POST") {
      try {
        const body = await request.json() as any;
        const message = body.message;
        const sessionId = body.sessionId;

        if (!message || !sessionId) {
          return new Response("Missing fields", { status: 400, headers: corsHeaders });
        }

        // 2. Access Durable Object
        const id = env.CHAT_HISTORY.idFromName(sessionId);
        const stub = env.CHAT_HISTORY.get(id);

        // 3. Get History from DO
        const history = await stub.getHistory();

        const messages = [
          { role: "system", content: "You are a concise assistant." },
          ...history,
          { role: "user", content: message }
        ];

        // 4. Run AI Model
        const aiResponse = await env.AI.run("@cf/meta/llama-3-8b-instruct", {
          messages
        });

        // Ensure we capture the text output correctly
        const assistantReply = aiResponse.response || "Error processing AI response.";

        // 5. Update History
        await stub.addMessage("user", message);
        await stub.addMessage("assistant", assistantReply);

        return new Response(JSON.stringify({ response: assistantReply }), {
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });

      } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      }
    }

    return new Response("Not Found", { status: 404, headers: corsHeaders });
  }
};
