// BAML client configuration for LLM providers

// OpenAI client configuration
client<llm> OpenAI {
  provider openai
  options {
    model gpt-4o
    api_key env.OPENAI_API_KEY
  }
}

// Anthropic client configuration
client<llm> Anthropic {
  provider anthropic
  options {
    model claude-3-5-sonnet-20241022
    api_key env.ANTHROPIC_API_KEY
  }
}

// Fallback client that tries multiple providers
client<llm> DefaultClient {
  provider fallback
  options {
    strategy [
      Anthropic
      OpenAI
    ]
  }
}
