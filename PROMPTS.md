# Development Prompts

This document tracks the generative prompts used to build the core components of the Voice-Chat application.

---

### 1. Backend API Structure
> Generate a Cloudflare Worker in TypeScript that exposes a POST endpoint (/chat) for AI text responses using the Cloudflare Workers runtime and fetch API.

### 2. Stateful History Logic
> Generate a Cloudflare Durable Object in TypeScript that:
> 1. Stores conversation history as an array of { role, content }
> 2. Supports loading and saving history
> 3. Persists data using this.storage

### 3. AI Inference Integration
> Generate TypeScript code for a Cloudflare Worker that calls Llama 3 using Workers AI. The input should be a conversation history array and the output should be the assistant's reply text.

### 4. Prompt Engineering Logic
> Generate code that constructs an LLM prompt by combining:
> 1. A system prompt
> 2. Stored conversation history
> 3. The latest user message
> Ensure the format is compatible with chat-based LLMs.

### 5. Frontend User Interface
> Create a HTML chat interface with a scrollable messages area, a text input, a send button, and a voice record button. Use no frameworks, strictly plain HTML.

### 6. Application Styling
> Write simple CSS to style a chat app:
> 1. Center the chat box
> 2. Distinguish user vs AI messages with unique colors
> 3. Responsive layout for mobile and desktop
> Keep it minimal and readable.

### 7. Core Frontend Logic
> Write vanilla JavaScript for a chat frontend that reads user input, sends POST requests to /chat with JSON, and displays responses in the UI without using frameworks.

### 8. Voice-to-Text Integration
> Write vanilla JavaScript to:
> 1. Capture audio from the microphone
> 2. Convert speech to text using the Web Speech API
> 3. Automatically trigger the chat submission once the transcript is ready
