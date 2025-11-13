export interface AIExampleEnhancerConfig {
    enabled: boolean;
    openaiApiKey: string;
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
    operationSummary?: string;
    operationDescription?: string;
    requestSchema?: unknown;
    responseSchema?: unknown;
    originalRequestExample?: unknown;
    originalResponseExample?: unknown;
    openApiSpec?: string;
}

export interface ExampleEnhancementResponse {
    enhancedRequestExample?: unknown;
    enhancedResponseExample?: unknown;
}
