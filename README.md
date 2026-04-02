# OpenRouter Free Code

A simple code generation service using OpenRouter with StepFun models.

## Setup

1. Get your OpenRouter API key from https://openrouter.ai

2. Create a `.env` file:
```bash
OPENROUTER_API_KEY=your_api_key_here
PORT=3000
APP_URL=https://your-app-url.com  # optional, for OpenRouter referrer
```

3. Install dependencies:
```bash
npm install
```

## Usage

### As a server (default)
```bash
npm start
```
Runs on http://localhost:3000

### Generate code from CLI
```bash
npm run generate "Create a React component with a button"
```

### API endpoints

**POST /api/generate**
Generate code from a prompt.

```json
{
  "prompt": "Create a function that validates email",
  "model": "stepfun/step-3.5-flash",
  "language": "javascript",
  "temperature": 0.3,
  "maxTokens": 1000,
  "context": "Node.js environment"
}
```

Response:
```json
{
  "success": true,
  "code": "function validateEmail(email) { ... }",
  "model": "stepfun/step-3.5-flash",
  "usage": {
    "prompt_tokens": 50,
    "completion_tokens": 150,
    "total_tokens": 200
  },
  "finishReason": "stop"
}
```

**GET /api/health**
Health check endpoint.

**GET /api/models**
List available StepFun models.

## Supported Models

- `stepfun/step-3.5-flash` (default)
- `stepfun/step-3.5-max`
- `stepfun/step-4-flash`
- `stepfun/step-4-max`

## Deploy to Vercel

1. Push to GitHub
2. Import in Vercel
3. Set environment variable: `OPENROUTER_API_KEY`
4. Deploy

## License

MIT
