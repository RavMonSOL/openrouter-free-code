#!/usr/bin/env node

/**
 * OpenRouter Free Code - Code Generation API
 * Supports StepFun models via OpenRouter
 * 
 * Usage:
 *   OPENROUTER_API_KEY=your_key node index.js
 * 
 * Endpoints:
 *   POST /api/generate - Generate code from prompt
 *   GET  /api/health   - Health check
 */

import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(import.meta.dirname)); // Serve static files

// OpenRouter configuration
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

// Supported StepFun models through OpenRouter
const STEPFUN_MODELS = [
  'stepfun/step-3.5-flash',
  'stepfun/step-3.5-max',
  'stepfun/step-4-flash',
  'stepfun/step-4-max'
];

// Default model
const DEFAULT_MODEL = 'stepfun/step-3.5-flash';

/**
 * Generate code using OpenRouter
 */
async function generateCode(prompt, options = {}) {
  const {
    model = DEFAULT_MODEL,
    temperature = 0.3,
    maxTokens = 2000,
    language = 'javascript',
    context = ''
  } = options;

  if (!OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY environment variable is required');
  }

  // Construct system prompt for code generation
  const systemPrompt = `You are an expert software engineer. Generate clean, well-documented code in ${language}.

Requirements:
- Write production-ready code
- Include error handling
- Add appropriate comments
- Follow best practices for the language
- Only output the code, no explanations or markdown`;

  const userPrompt = context 
    ? `Context: ${context}\n\nTask: ${prompt}`
    : prompt;

  const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.APP_URL || 'https://localhost:3000',
      'X-Title': 'OpenRouter Free Code'
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature,
      max_tokens: maxTokens,
      stream: false
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter API error (${response.status}): ${error}`);
  }

  const data = await response.json();
  
  if (data.error) {
    throw new Error(`OpenRouter error: ${data.error.message || JSON.stringify(data.error)}`);
  }

  const code = data.choices[0].message.content
    .replace(/^```[a-z]*\n?/gm, '') // Remove code fences
    .replace(/```$/gm, '')
    .trim();

  return {
    code,
    model: data.model,
    usage: data.usage,
    finishReason: data.choices[0].finish_reason
  };
}

// Routes

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'openrouter-free-code',
    models: STEPFUN_MODELS,
    defaultModel: DEFAULT_MODEL,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/models', (req, res) => {
  res.json({
    models: STEPFUN_MODELS,
    default: DEFAULT_MODEL
  });
});

app.post('/api/generate', async (req, res) => {
  try {
    const { prompt, model, temperature, maxTokens, language, context } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const result = await generateCode(prompt, {
      model: model || DEFAULT_MODEL,
      temperature,
      maxTokens,
      language,
      context
    });

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: error.stack
    });
  }
});

// Simple CLI usage if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const prompt = process.argv[2];
  if (prompt) {
    generateCode(prompt, { language: 'javascript' })
      .then(result => {
        console.log('Generated code:\n');
        console.log(result.code);
        console.log('\n---\nModel:', result.model);
        if (result.usage) {
          console.log('Tokens:', result.usage.total_tokens);
        }
      })
      .catch(err => {
        console.error('Error:', err.message);
        process.exit(1);
      });
  } else {
    // Start server if no prompt provided
    app.listen(PORT, () => {
      console.log(`OpenRouter Free Code server running on http://localhost:${PORT}`);
      console.log(`Default model: ${DEFAULT_MODEL}`);
    });
  }
}

export { app, generateCode };
