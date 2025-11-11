import { TaskContext } from "@fern-api/task-context";
import OpenAI from "openai";
import { AIExampleEnhancerConfig, ExampleEnhancementRequest, ExampleEnhancementResponse } from "./types";

export class OpenAIExampleEnhancer {
    private config: Required<AIExampleEnhancerConfig>;
    private context: TaskContext;
    private openai: OpenAI;

    constructor(config: AIExampleEnhancerConfig, context: TaskContext) {
        this.config = {
            enabled: config.enabled,
            openaiApiKey: config.openaiApiKey,
            model: config.model ?? "gpt-4o-mini",
            maxRetries: config.maxRetries ?? 3,
            requestTimeoutMs: config.requestTimeoutMs ?? 30000
        };
        this.context = context;
        this.openai = new OpenAI({
            apiKey: this.config.openaiApiKey,
            timeout: this.config.requestTimeoutMs
        });
    }

    async enhanceExample(request: ExampleEnhancementRequest): Promise<ExampleEnhancementResponse> {
        if (!this.config.enabled) {
            return {
                enhancedRequestExample: request.originalRequestExample,
                enhancedResponseExample: request.originalResponseExample
            };
        }

        const prompt = this.buildEnhancementPrompt(request);

        let lastError: Error | undefined;
        for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
            try {
                this.context.logger.debug(
                    `Enhancing example for ${request.method} ${request.endpointPath} (attempt ${attempt}/${this.config.maxRetries})`
                );

                // Try with JSON response format first, fall back if model doesn't support it
                let completion;
                const baseParams = {
                    model: this.config.model,
                    messages: [
                        {
                            role: "system" as const,
                            content:
                                "You are an API documentation expert. Your job is to replace ONLY generic placeholder values in API examples with realistic data. Do not add new fields, modify structure, or change data types. Only enhance existing placeholder values like 'string', 1, 0, true, false."
                        },
                        {
                            role: "user" as const,
                            content: prompt
                        }
                    ],
                    temperature: 0.3, // Lower temperature for more consistent results
                    max_tokens: 2000
                };

                try {
                    // Try with JSON response format (supported by gpt-4-turbo, gpt-3.5-turbo-1106+)
                    completion = await this.openai.chat.completions.create({
                        ...baseParams,
                        response_format: { type: "json_object" }
                    });
                } catch (jsonFormatError: unknown) {
                    const errorMessage =
                        jsonFormatError instanceof Error ? jsonFormatError.message : String(jsonFormatError);

                    if (errorMessage.includes("response_format")) {
                        this.context.logger.debug(
                            "Model doesn't support JSON response format, falling back to regular format"
                        );
                        completion = await this.openai.chat.completions.create(baseParams);
                    } else {
                        throw jsonFormatError;
                    }
                }

                const enhancedContent = completion.choices[0]?.message?.content;

                if (!enhancedContent) {
                    throw new Error("No content received from OpenAI");
                }

                // Parse the JSON response (should be clean JSON now)
                try {
                    const parsed = JSON.parse(enhancedContent);
                    return {
                        enhancedRequestExample: parsed.requestExample ?? request.originalRequestExample,
                        enhancedResponseExample: parsed.responseExample ?? request.originalResponseExample
                    };
                } catch (parseError) {
                    this.context.logger.debug(`Raw OpenAI response: ${enhancedContent}`);
                    throw new Error(`Failed to parse OpenAI response as JSON: ${parseError}`);
                }
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

    private buildEnhancementPrompt(request: ExampleEnhancementRequest): string {
        const parts: string[] = [
            "I need you to enhance API examples with realistic, meaningful data.",
            "",
            `**Endpoint**: ${request.method} ${request.endpointPath}`
        ];

        if (request.operationSummary) {
            parts.push(`**Operation**: ${request.operationSummary}`);
        }

        if (request.operationDescription) {
            parts.push(`**Description**: ${request.operationDescription}`);
        }

        parts.push("", "**Current Examples (auto-generated with generic data):**");

        if (request.originalRequestExample) {
            parts.push("", "**Request:**", "```json", JSON.stringify(request.originalRequestExample, null, 2), "```");
        }

        if (request.originalResponseExample) {
            parts.push("", "**Response:**", "```json", JSON.stringify(request.originalResponseExample, null, 2), "```");
        }

        parts.push(
            "",
            "**Instructions:**",
            "1. ONLY replace generic placeholder values like 'string', 1, 0, true, false with realistic data",
            "2. DO NOT add any new fields or properties that aren't already present",
            "3. DO NOT modify the JSON structure - keep it exactly the same",
            "4. DO NOT change data types (strings stay strings, numbers stay numbers, etc.)",
            "5. If a field has a meaningful value already, leave it unchanged",
            "6. For empty objects {}, leave them empty - do not add fields",
            "7. For empty arrays [], leave them empty - do not add items",
            "8. Make replacement values realistic for the API domain context",
            "",
            "**Example:**",
            '- Input: {"name": "string", "count": 1} → Output: {"name": "Rose Bush", "count": 25}',
            "- Input: {} → Output: {} (unchanged - don't add fields)",
            "- Input: [] → Output: [] (unchanged - don't add items)",
            "",
            "**Response Format:**",
            "Return a JSON object with this structure:",
            "```json",
            "{"
        );

        if (request.originalRequestExample) {
            parts.push('  "requestExample": { /* enhanced request data */ },');
        }

        if (request.originalResponseExample) {
            parts.push('  "responseExample": { /* enhanced response data */ }');
        }

        parts.push("}", "```");

        return parts.join("\\n");
    }
}
