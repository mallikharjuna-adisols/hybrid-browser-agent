const freeProviders = [
  {
    key: 'openrouter',
    name: 'OpenRouter',
    baseUrl: 'https://openrouter.ai/api/v1',
    websiteUrl: 'https://openrouter.ai/',
    signupUrl: 'https://openrouter.ai/',
    defaultModel: 'openai/gpt-4o-mini',
    note: 'Broad model access and a generous low-cost entry path.',
  },
  {
    key: 'groq',
    name: 'Groq',
    baseUrl: 'https://api.groq.com/openai/v1',
    websiteUrl: 'https://console.groq.com/',
    signupUrl: 'https://console.groq.com/',
    defaultModel: 'llama-3.3-70b-versatile',
    note: 'Very fast inference and easy developer onboarding.',
  },
  {
    key: 'together',
    name: 'Together AI',
    baseUrl: 'https://api.together.xyz/v1',
    websiteUrl: 'https://www.together.ai/',
    signupUrl: 'https://api.together.xyz/',
    defaultModel: 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free',
    note: 'Convenient open-model access with trial credits.',
  },
  {
    key: 'huggingface',
    name: 'Hugging Face',
    baseUrl: 'https://api-inference.huggingface.co/models',
    websiteUrl: 'https://huggingface.co/',
    signupUrl: 'https://huggingface.co/join',
    defaultModel: 'google/gemma-2-2b-it',
    note: 'Strong free ecosystem for open model experimentation.',
  },
];

const browserJobStatuses = {
  pending: 'pending',
  running: 'running',
  completed: 'completed',
  failed: 'failed',
};

module.exports = {
  freeProviders,
  browserJobStatuses,
};
