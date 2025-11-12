export interface AIExampleEnhancerConfig {
    enabled: boolean;
    openaiApiKey?: string; // Optional - only needed for legacy direct OpenAI calls
    model?: string; // Default: "gpt-4o-mini"
    maxRetries?: number; // Default: 3
    requestTimeoutMs?: number; // Default: 30000
}

export interface EnhancedExample {
    originalExample: unknown;
    enhancedExample: unknown;
    wasEnhanced: boolean;
    enhancementError?: string;
}

export interface ExampleEnhancementRequest {
    endpointPath: string;
    method: string;
    organizationId: string;
    operationSummary?: string;
    operationDescription?: string;
    requestSchema?: unknown;
    responseSchema?: unknown;
    originalRequestExample?: unknown;
    originalResponseExample?: unknown;
}

export interface ExampleEnhancementResponse {
    enhancedRequestExample?: unknown;
    enhancedResponseExample?: unknown;
}
