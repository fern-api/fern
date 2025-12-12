import { FernToken } from "@fern-api/auth";
import { TaskContext } from "@fern-api/task-context";
import { AIExampleEnhancerConfig, ExampleEnhancementRequest, ExampleEnhancementResponse } from "./types";

type AIEnhancerResolvedConfig = Required<Omit<AIExampleEnhancerConfig, "openaiApiKey" | "exampleStyleInstructions">> &
    Pick<AIExampleEnhancerConfig, "openaiApiKey" | "exampleStyleInstructions">;

interface VenusJwtResponse {
    token: string;
    expiresAt: string;
}

export class LambdaExampleEnhancer {
    private config: AIEnhancerResolvedConfig;
    private context: TaskContext;
    private lambdaOrigin: string;
    private venusOrigin: string;
    private token: FernToken;
    private jwtPromise: Promise<string> | undefined;
    private organizationId: string;

    constructor(config: AIExampleEnhancerConfig, context: TaskContext, token: FernToken, organizationId: string) {
        this.config = {
            enabled: config.enabled,
            openaiApiKey: config.openaiApiKey,
            model: config.model ?? "gpt-4o-mini",
            maxRetries: config.maxRetries ?? 1, // Single retry - caller handles additional retries
            requestTimeoutMs: 75000, // Increased timeout for larger batches
            exampleStyleInstructions: config.exampleStyleInstructions
        };
        this.context = context;

        // Get Lambda origin - throw error if not configured
        const lambdaOrigin = process.env.DEFAULT_FDR_LAMBDA_DOCS_ORIGIN;
        if (!lambdaOrigin) {
            throw new Error(
                "DEFAULT_FDR_LAMBDA_DOCS_ORIGIN environment variable is not set. AI example enhancement requires this to be configured."
            );
        }
        this.lambdaOrigin = lambdaOrigin;

        // Get Venus origin for JWT exchange
        this.venusOrigin = process.env.DEFAULT_VENUS_ORIGIN ?? "https://venus.buildwithfern.com";

        this.token = token;
        this.organizationId = organizationId;
    }

    /**
     * Fetches a JWT from Venus by exchanging the organization API token.
     * The JWT is cached for the lifetime of this instance to avoid repeated calls.
     */
    private async getJwt(): Promise<string> {
        if (this.jwtPromise == null) {
            this.jwtPromise = this.fetchJwtFromVenus();
        }
        return this.jwtPromise;
    }

    /**
     * Exchanges the organization API token for a short-lived JWT from Venus.
     */
    private async fetchJwtFromVenus(): Promise<string> {
        this.context.logger.debug("Fetching JWT from Venus for AI example enhancement");

        // Debug logging for token information
        this.context.logger.debug(`Token type: ${this.token.type}`);
        this.context.logger.debug(`Token value (first 10 chars): ${this.token.value.substring(0, 10)}...`);
        this.context.logger.debug(`Token value starts with 'fern_': ${this.token.value.startsWith("fern_")}`);
        this.context.logger.debug(`Venus origin: ${this.venusOrigin}`);
        this.context.logger.debug(`Organization ID: ${this.organizationId}`);

        const response = await fetch(`${this.venusOrigin}/auth/jwt`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.token.value}`
            },
            body: JSON.stringify({ organizationId: this.organizationId }),
            signal: AbortSignal.timeout(10000) // 10 second timeout for JWT fetch
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to fetch JWT from Venus: ${response.status} ${errorText || response.statusText}`);
        }

        const result = (await response.json()) as VenusJwtResponse;
        this.context.logger.debug(`Successfully obtained JWT from Venus (expires at ${result.expiresAt})`);
        return result.token;
    }

    async enhanceExample(request: ExampleEnhancementRequest): Promise<ExampleEnhancementResponse> {
        if (!this.config.enabled) {
            return {
                enhancedRequestExample: request.originalRequestExample,
                enhancedResponseExample: request.originalResponseExample
            };
        }

        // Fetch JWT from Venus (cached after first call)
        let jwt: string;
        try {
            jwt = await this.getJwt();
        } catch (error) {
            this.context.logger.warn(
                `Failed to obtain JWT from Venus: ${error}. AI example enhancement will be skipped.`
            );
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

                const requestBody = {
                    method: request.method,
                    endpointPath: request.endpointPath,
                    organizationId: request.organizationId,
                    operationSummary: request.operationSummary,
                    operationDescription: request.operationDescription,
                    originalRequestExample: request.originalRequestExample,
                    originalResponseExample: request.originalResponseExample,
                    openApiSpec: request.openApiSpec,
                    exampleStyleInstructions: request.exampleStyleInstructions ?? this.config.exampleStyleInstructions
                };

                this.context.logger.debug(
                    `Sending to enhanceExamples: ${JSON.stringify(
                        {
                            ...requestBody,
                            openApiSpec: request.openApiSpec
                                ? `[OpenAPI spec present: ${request.openApiSpec.length} chars]`
                                : "[No OpenAPI spec]"
                        },
                        null,
                        2
                    )}`
                );

                const response = await fetch(`${this.lambdaOrigin}/v2/registry/ai/enhance-example`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${jwt}`
                    },
                    body: JSON.stringify(requestBody),
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
