# cf_ai_voice_chat

A full-stack, stateful chat application built on the Cloudflare Workers ecosystem. This project utilizes Large Language Models (LLMs) for conversation and the Web Speech API for voice-driven input, maintained through a stateful architecture.

## System Architecture

The application is built using a distributed architecture that leverages Edge Computing:

1. **Frontend**: A vanilla JavaScript interface that utilizes the Web Speech API for client-side speech-to-text processing and manages asynchronous state for UI animations.
2. **State Management**: Powered by Cloudflare Durable Objects. Each session is assigned a unique Durable Object instance that persists conversation history in an on-device SQLite database.
3. **Inference Layer**: Orchestrated via Cloudflare Workers AI, utilizing Meta Llama 3 for intelligent text generation.



## Technical Stack

- **Runtime**: Cloudflare Workers (TypeScript)
- **Stateful Storage**: Durable Objects (SQLite-backed)
- **AI Models**: @cf/meta/llama-3-8b-instruct (Conversational Intelligence)
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Communication**: RESTful API with CORS preflight handling



## Getting Started

### Live Deployment
- **Live Application**: [live-chat](https://cf-ai-voice-chat.pages.dev/)

The frontend is hosted via Cloudflare Pages and interfaces with a Cloudflare Worker backend for AI inference and state persistence.

### Deployed Usage
If you simply wish to use the application, navigate to the Live Demo link above. The frontend communicates with the Cloudflare global network to process conversation history via Durable Objects and generate responses using Meta Llama 3.


### Prerequisites

- Node.js and npm installed
- A Cloudflare account with Workers AI access
- Wrangler CLI (`npm install -g wrangler`)


### Local Development

To run the project locally while utilizing remote AI bindings:

1. **Clone the Repository**:
    ```bash
    git clone https://github.com/Youssef-Keshk/cf_ai_voice_chat.git
    cd cf_ai_voice_chat
    ```

2. **Install Dependencies**:
    ```bash
    npm install
    ```

3. **Authenticate Wrangler**:
    ```bash
    npx wrangler login
    ```

4. **Start Development Server**:
    ```bash
    npx wrangler dev --remote
    ```
    The backend will be available at `http://127.0.0.1:8787`.

5. **Launch Frontend**:
    Open `frontend/index.html` using a local server (e.g., VS Code Live Server). Ensure the `API_BASE_URL` in `frontend/app.js` is set to `http://127.0.0.1:8787`.

### Production Deployment

To deploy the application to the Cloudflare global network:

1. **Deploy the Worker**:
    ```bash
    npx wrangler deploy
    ```

2. **Update Frontend**:
    Update the `API_BASE_URL` in `frontend/app.js` to your generated `*.workers.dev` URL.

## API Endpoints

### POST /chat
Processes user messages and maintains context via Durable Objects.
- **Body**: `{ "message": string, "sessionId": string }`
- **Returns**: `{ "response": string }`

## Project Structure

- `/src`: Contains the Worker logic and Durable Object class definitions.
- `/frontend`: Contains the client-side assets (HTML, CSS, JS).
- `wrangler.jsonc`: Configuration and Durable Object migration schema.
