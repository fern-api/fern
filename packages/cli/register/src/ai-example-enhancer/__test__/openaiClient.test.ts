import { TaskContext } from "@fern-api/task-context";
import { OpenAIExampleEnhancer } from "../openaiClient";
import { ExampleEnhancementRequest } from "../types";

// Mock TaskContext for testing
const mockTaskContext: TaskContext = {
    logger: {
        debug: () => {},
        info: () => {},
        warn: () => {},
        error: () => {}
    } as any
} as any;

describe("OpenAIExampleEnhancer", () => {
    describe("initialization", () => {
        it("should initialize with OpenAI SDK", () => {
            const config = {
                enabled: true,
                openaiApiKey: "test-key",
                model: "gpt-4o-mini",
                maxRetries: 3,
                requestTimeoutMs: 30000
            };

            const enhancer = new OpenAIExampleEnhancer(config, mockTaskContext);
            expect(enhancer).toBeDefined();
        });

        it("should use default values for optional config", () => {
            const config = {
                enabled: true,
                openaiApiKey: "test-key"
            };

            const enhancer = new OpenAIExampleEnhancer(config, mockTaskContext);
            expect(enhancer).toBeDefined();
        });
    });

    describe("enhanceExample", () => {
        it("should return original examples when disabled", async () => {
            const config = {
                enabled: false,
                openaiApiKey: "test-key"
            };

            const enhancer = new OpenAIExampleEnhancer(config, mockTaskContext);
            const request: ExampleEnhancementRequest = {
                endpointPath: "/users",
                method: "POST",
                originalRequestExample: { name: "string", age: 1 },
                originalResponseExample: { id: 1, status: "success" }
            };

            const result = await enhancer.enhanceExample(request);

            expect(result.enhancedRequestExample).toEqual(request.originalRequestExample);
            expect(result.enhancedResponseExample).toEqual(request.originalResponseExample);
        });

        // Note: We can't test actual API calls without a real API key and making live requests
        // For integration testing, you could run this with a real OPENAI_API_KEY environment variable
    });
});
