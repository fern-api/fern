import { FernToken } from "@fern-api/auth";
import { TaskContext } from "@fern-api/task-context";
import { AIExampleEnhancerConfig, ExampleEnhancementRequest, ExampleEnhancementResponse } from "./types";

export class LambdaExampleEnhancer {
    private config: Required<Omit<AIExampleEnhancerConfig, "openaiApiKey">> & Pick<AIExampleEnhancerConfig, "openaiApiKey">;
    private context: TaskContext;
    private lambdaOrigin: string;
    private token: FernToken;

    constructor(config: AIExampleEnhancerConfig, context: TaskContext, token: FernToken) {
        this.config = {
            enabled: config.enabled,
            openaiApiKey: config.openaiApiKey,
            model: config.model ?? "gpt-4o-mini",
            maxRetries: config.maxRetries ?? 3,
            requestTimeoutMs: config.requestTimeoutMs ?? 25000
        };
        this.context = context;
        this.lambdaOrigin =
            process.env.OVERRIDE_FDR_LAMBDA_ORIGIN ??
            process.env.DEFAULT_FDR_LAMBDA_ORIGIN ??
            "https://registry-v2.buildwithfern.com";
        this.token = token;
    }

    async enhanceExample(request: ExampleEnhancementRequest): Promise<ExampleEnhancementResponse> {
        if (!this.config.enabled) {
            return {
                enhancedRequestExample: request.originalRequestExample,
                enhancedResponseExample: request.originalResponseExample
            };
        }

        let lastError: Error | undefined;
        for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
            try {
                this.context.logger.debug(
                    `Enhancing example for ${request.method} ${request.endpointPath} via lambda (attempt ${attempt}/${this.config.maxRetries})`
                );

                const response = await fetch(`${this.lambdaOrigin}/v2/registry/ai/enhance-example`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${this.token.value}`
                    },
                    body: JSON.stringify({
                        method: request.method,
                        endpointPath: request.endpointPath,
                        operationSummary: request.operationSummary,
                        operationDescription: request.operationDescription,
                        originalRequestExample: request.originalRequestExample,
                        originalResponseExample: request.originalResponseExample
                    }),
                    signal: AbortSignal.timeout(this.config.requestTimeoutMs)
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Lambda returned ${response.status}: ${errorText || response.statusText}`);
                }

                const result = await response.json();
                return {
                    enhancedRequestExample: result.enhancedRequestExample ?? request.originalRequestExample,
                    enhancedResponseExample: result.enhancedResponseExample ?? request.originalResponseExample
                };
            } catch (error) {
                lastError = error as Error;
                this.context.logger.warn(`Attempt ${attempt} failed to enhance example: ${error}`);

                if (attempt < this.config.maxRetries) {
                    // Exponential backoff
                    const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
                    await new Promise((resolve) => setTimeout(resolve, delay));
                }
            }
        }

        this.context.logger.error(
            `Failed to enhance example after ${this.config.maxRetries} attempts: ${lastError?.message}`
        );

        // Return original examples if enhancement fails
        return {
            enhancedRequestExample: request.originalRequestExample,
            enhancedResponseExample: request.originalResponseExample
        };
    }
}
