import { generateCode } from './index.js';

const testPrompt = 'Create a JavaScript function that debounces another function';
const testOptions = {
  language: 'javascript',
  temperature: 0.3,
  maxTokens: 500
};

try {
  console.log('Testing OpenRouter Free Code...\n');
  console.log('Prompt:', testPrompt);
  console.log('---\n');
  
  const result = await generateCode(testPrompt, testOptions);
  
  console.log('Generated code:');
  console.log(result.code);
  console.log('\n---');
  console.log('Model:', result.model);
  console.log('Tokens:', result.usage?.total_tokens);
  console.log('Finish reason:', result.finishReason);
  
  if (result.code && result.code.length > 0) {
    console.log('\n✓ Test PASSED: Code generated successfully');
    process.exit(0);
  } else {
    console.log('\n✗ Test FAILED: No code generated');
    process.exit(1);
  }
} catch (error) {
  console.error('\n✗ Test FAILED:', error.message);
  if (error.message.includes('OPENROUTER_API_KEY')) {
    console.log('\nSet OPENROUTER_API_KEY environment variable to run tests');
  }
  process.exit(1);
}
