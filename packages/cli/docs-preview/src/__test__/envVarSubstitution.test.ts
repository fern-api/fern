import { vi } from "vitest";

import { replaceEnvVariables } from "@fern-api/core-utils";

describe("environment variable substitution in docs", () => {
    const originalEnv = process.env;

    beforeEach(() => {
        process.env = { ...originalEnv };
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    it("substitutes environment variables in docs definition when flag is enabled", () => {
        process.env.API_KEY = "test-api-key-123";
        process.env.BASE_URL = "https://api.example.com";

        const docsDefinition = {
            config: {
                title: "My API Docs",
                apiKey: "${API_KEY}",
                baseUrl: "${BASE_URL}/v1"
            },
            pages: {
                "getting-started": {
                    rawMarkdown: "Use your API key: ${API_KEY}"
                }
            }
        };

        const onError = vi.fn();
        const substituted = replaceEnvVariables(
            docsDefinition,
            { onError },
            { substituteAsEmpty: false }
        );

        expect(onError).not.toHaveBeenCalled();
        expect(substituted.config.apiKey).toEqual("test-api-key-123");
        expect(substituted.config.baseUrl).toEqual("https://api.example.com/v1");
        expect(substituted.pages["getting-started"].rawMarkdown).toEqual("Use your API key: test-api-key-123");
    });

    it("does not substitute when flag is disabled (no substitution applied)", () => {
        process.env.API_KEY = "test-api-key-123";

        const docsDefinition = {
            config: {
                apiKey: "${API_KEY}"
            }
        };

        expect(docsDefinition.config.apiKey).toEqual("${API_KEY}");
    });

    it("substitutes all env vars as empty string in preview mode (substituteAsEmpty: true)", () => {
        process.env.DEFINED_VAR = "defined-value";

        const docsDefinition = {
            config: {
                definedVar: "${DEFINED_VAR}",
                undefinedVar: "${UNDEFINED_VAR}"
            }
        };

        const onError = vi.fn();
        const substituted = replaceEnvVariables(
            docsDefinition,
            { onError },
            { substituteAsEmpty: true }
        );

        expect(onError).not.toHaveBeenCalled();
        expect(substituted.config.definedVar).toEqual("");
        expect(substituted.config.undefinedVar).toEqual("");
    });

    it("calls onError in production mode when env var is missing", () => {
        const docsDefinition = {
            config: {
                undefinedVar: "${UNDEFINED_VAR}"
            }
        };

        const onError = vi.fn();
        replaceEnvVariables(
            docsDefinition,
            { onError },
            { substituteAsEmpty: false }
        );

        expect(onError).toHaveBeenCalled();
    });

    it("handles deeply nested objects", () => {
        process.env.VAR1 = "value1";
        process.env.VAR2 = "value2";

        const docsDefinition = {
            nested: {
                deep: {
                    value: "${VAR1}",
                    deeper: {
                        anotherValue: "${VAR2}"
                    }
                }
            }
        };

        const onError = vi.fn();
        const substituted = replaceEnvVariables(
            docsDefinition,
            { onError },
            { substituteAsEmpty: false }
        );

        expect(onError).not.toHaveBeenCalled();
        expect(substituted.nested.deep.value).toEqual("value1");
        expect(substituted.nested.deep.deeper.anotherValue).toEqual("value2");
    });

    it("handles multiple env vars in single string", () => {
        process.env.HOST = "localhost";
        process.env.PORT = "3000";

        const docsDefinition = {
            config: {
                url: "http://${HOST}:${PORT}/api"
            }
        };

        const onError = vi.fn();
        const substituted = replaceEnvVariables(
            docsDefinition,
            { onError },
            { substituteAsEmpty: false }
        );

        expect(onError).not.toHaveBeenCalled();
        expect(substituted.config.url).toEqual("http://localhost:3000/api");
    });
});
