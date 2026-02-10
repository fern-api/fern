export interface AIExampleEnhancerConfig {
    enabled: boolean;
    openaiApiKey?: string; // Optional - only needed for legacy direct OpenAI calls
    model?: string; // Default: "gpt-4o-mini"
    maxRetries?: number; // Default: 0 (1 attempt total, no retries)
    requestTimeoutMs?: number; // Default: 15000
    styleInstructions?: string; // Custom styling instructions for AI-generated examples (max 500 chars)
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
    openApiSpec?: string;
    exampleStyleInstructions?: string;
}

export interface ExampleEnhancementResponse {
    enhancedRequestExample?: unknown;
    enhancedResponseExample?: unknown;
}

export interface ExampleEnhancementBatchRequest {
    openApiSpec?: string;
    endpoints: ExampleEnhancementRequest[];
}

export interface ExampleEnhancementBatchResult {
    enhancedRequestExample?: unknown;
    enhancedResponseExample?: unknown;
    error?: string;
}

export interface ExampleEnhancementBatchResponse {
    results: ExampleEnhancementBatchResult[];
    modelUsed?: string;
    requestId?: string;
}

// Types for concurrent queue processing
export interface ProcessingResult {
    endpointKey: string;
    enhancedReq?: unknown;
    enhancedRes?: unknown;
    extractedHeaders?: Record<string, unknown>;
    extractedPathParams?: Record<string, unknown>;
    extractedQueryParams?: Record<string, unknown>;
    success: boolean;
    error?: string;
}

export interface QueuedRequest {
    id: string;
    promise: Promise<ProcessingResult>;
    startTime: number;
}

export interface ConcurrencyStats {
    pending: number;
    active: number;
    completed: number;
    failed: number;
    totalStarted: number;
}

export interface ProgressCallback {
    (stats: ConcurrencyStats, recentCompletions: ProcessingResult[]): void;
}
