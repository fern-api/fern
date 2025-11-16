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

// Bedrock client configuration
client<llm> Bedrock {
    provider aws-bedrock
    options {
        model anthropic.claude-3-5-sonnet-20240620-v1:0
    }
}

// Fallback client that tries multiple providers
// TODO(tjb9dc): I wish we didn't have to specify this, we're only going to use one at runtime
client<llm> DefaultClient {
  provider fallback
  options {
    strategy [
      Anthropic
      OpenAI
      Bedrock
    ]
  }
}
