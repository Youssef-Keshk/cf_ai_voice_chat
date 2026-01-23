import { ChatHistory } from "./ChatHistory";

export { ChatHistory };

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default {
  async fetch(request: Request, env: any): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const url = new URL(request.url);

    try {
      if (url.pathname === "/chat" && request.method === "POST") {
        const { message, sessionId } = await request.json() as any;

        // Retrieve session-specific history from Durable Object
        const id = env.CHAT_HISTORY.idFromName(sessionId);
        const stub = env.CHAT_HISTORY.get(id);
        const history = await stub.getHistory();

        // Process conversation using Llama 3
        const aiResponse = await env.AI.run("@cf/meta/llama-3-8b-instruct", {
          messages: [
            { role: "system", content: "You are a concise, witty, and helpful engineering assistant." },
            ...history,
            { role: "user", content: message }
          ]
        });

        const reply = aiResponse.response || "I encountered an issue generating a response.";

        // Persist the new turn in history
        await stub.addMessage("user", message);
        await stub.addMessage("assistant", reply);

        return new Response(JSON.stringify({ response: reply }), {
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      }

      return new Response("Not Found", { status: 404, headers: corsHeaders });
    } catch (err: any) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }
  }
};
