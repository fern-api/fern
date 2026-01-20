import { FernToken } from "@fern-api/auth";
import { isNetworkError } from "@fern-api/lazy-fern-workspace";
import { TaskContext } from "@fern-api/task-context";
import { AIExampleEnhancerConfig, ExampleEnhancementRequest, ExampleEnhancementResponse } from "./types";

// Configuration constants for AI enhancement
const DEFAULT_AI_ENHANCEMENT_MAX_RETRIES = 0; // 0 retries = 1 attempt total
const DEFAULT_AI_ENHANCEMENT_TIMEOUT_MS = 15000; // 15 seconds

type AIEnhancerResolvedConfig = Required<Omit<AIExampleEnhancerConfig, "openaiApiKey" | "styleInstructions">> &
    Pick<AIExampleEnhancerConfig, "openaiApiKey" | "styleInstructions">;

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
    private venusAirGappedResult: boolean | undefined;

    constructor(config: AIExampleEnhancerConfig, context: TaskContext, token: FernToken, organizationId: string) {
        this.config = {
            enabled: config.enabled,
            openaiApiKey: config.openaiApiKey,
            model: config.model ?? "gpt-4o-mini",
            maxRetries: config.maxRetries ?? DEFAULT_AI_ENHANCEMENT_MAX_RETRIES,
            requestTimeoutMs: config.requestTimeoutMs ?? DEFAULT_AI_ENHANCEMENT_TIMEOUT_MS,
            styleInstructions: config.styleInstructions
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
     * Check if Venus is reachable. This is a separate check from the global air-gapped detection
     * because in self-hosted environments, the local FDR server may be reachable while Venus is not.
     * The result is cached for the lifetime of this instance.
     */
    private async isVenusAirGapped(): Promise<boolean> {
        if (this.venusAirGappedResult !== undefined) {
            return this.venusAirGappedResult;
        }

        this.context.logger.debug(`Checking Venus connectivity at ${this.venusOrigin}/health`);

        try {
            await fetch(`${this.venusOrigin}/health`, {
                method: "GET",
                signal: AbortSignal.timeout(5000) // 5 second timeout
            });
            this.venusAirGappedResult = false;
            this.context.logger.debug("Venus connectivity check succeeded");
            return false;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            if (isNetworkError(errorMessage)) {
                this.venusAirGappedResult = true;
                this.context.logger.debug(`Venus connectivity check failed - air-gapped mode: ${errorMessage}`);
                return true;
            }
            // Non-network error - assume not air-gapped
            this.venusAirGappedResult = false;
            return false;
        }
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

        // Check for air-gapped environment before attempting network calls
        // This uses a Venus-specific check that doesn't rely on the global cache,
        // since in self-hosted environments the local FDR server may be reachable while Venus is not
        const isAirGapped = await this.isVenusAirGapped();
        if (isAirGapped) {
            this.context.logger.debug("Skipping AI example enhancement - Venus is not reachable");
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
        const maxAttempts = this.config.maxRetries + 1; // maxRetries=0 means 1 attempt, maxRetries=1 means 2 attempts
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                this.context.logger.debug(
                    `Enhancing example for ${request.method} ${request.endpointPath} via lambda (attempt ${attempt}/${maxAttempts})`
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
                    exampleStyleInstructions: request.exampleStyleInstructions ?? this.config.styleInstructions
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

                if (attempt < maxAttempts) {
                    // Exponential backoff before retry
                    const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
                    await new Promise((resolve) => setTimeout(resolve, delay));
                }
            }
        }

        this.context.logger.error(`Failed to enhance example after ${maxAttempts} attempts: ${lastError?.message}`);

        // Return original examples if enhancement fails
        return {
            enhancedRequestExample: request.originalRequestExample,
            enhancedResponseExample: request.originalResponseExample
        };
    }
}
