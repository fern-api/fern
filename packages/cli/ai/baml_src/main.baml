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
    model claude-sonnet-4-5-20250929
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

// Response type for prettified documentation
class PrettifiedDocsResponse {
  improved_markdown string @description("The improved markdown content with Fern components integrated")
  changes_summary string @description("A summary of the changes made and why")
}

// Function to prettify documentation using Fern components
function PrettifyDocs(markdown_content: string, fern_components_reference: string) -> PrettifiedDocsResponse {
  client DefaultClient
  prompt #"
    You are a technical documentation expert specializing in Fern documentation.
    
    Your task is to analyze the provided markdown content and suggest improvements using Fern's documentation components.
    
    # Available Fern Components
    
    {{ fern_components_reference }}
    
    # Original Markdown Content
    
    {{ markdown_content }}
    
    # Instructions
    
    1. Analyze the markdown content and identify opportunities to enhance it with Fern components
    2. Look for:
       - Sequential instructions that could use <Steps> components
       - Related content that could be organized with <Card> or <CardGroup>
       - Important information that should be in callouts (<Info>, <Note>, <Warning>, <Tip>)
       - Code examples that could benefit from tabs, syntax highlighting, or deep linking
       - API references that could use <EndpointRequestSnippet> or <EndpointResponseSnippet>
       - Optional details that could be hidden in <Accordion> components
       - Lists that could be converted to tables for better readability
    3. Provide the improved markdown with Fern components integrated naturally
    4. Explain what changes you made and why
    5. Use plant-themed examples when generating API examples (e.g., POST /plants/{plantId})
    
    # Guidelines
    
    - Preserve all existing content and meaning
    - Only add components where they genuinely improve readability or organization
    - Don't overuse components - use them strategically
    - Maintain the original tone and style
    - Keep code examples realistic and practical
    - Use sentence case for all titles and headings
    
    Return your response with the improved markdown and a summary of changes.
  "#
}
