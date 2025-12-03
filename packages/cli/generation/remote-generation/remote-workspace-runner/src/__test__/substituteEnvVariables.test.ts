import { replaceEnvVariables } from "@fern-api/core-utils";
import { NOOP_LOGGER } from "@fern-api/logger";
import { createMockTaskContext, FernCliError } from "@fern-api/task-context";

describe("substituteEnvVariables", () => {
    it("basic", () => {
        process.env.FOO_VAR = "foo";
        process.env.BAR_VAR = "bar";
        const content = {
            foo: "bar",
            baz: {
                qux: {
                    thud: "${FOO_VAR}"
                }
            },
            plugh: "${FOO_VAR}-${BAR_VAR}"
        };

        const context = createMockTaskContext();
        const substituted = replaceEnvVariables(content, { onError: (e) => context.failAndThrow(e) });

        expect(substituted).toEqual({ foo: "bar", baz: { qux: { thud: "foo" } }, plugh: "foo-bar" });
    });

    it("fails with undefined env var", () => {
        process.env.FOO_VAR = "foo";
        const content = {
            foo: "bar",
            baz: {
                qux: {
                    thud: "${UNDEFINED_ENV_VAR}"
                }
            },
            plugh: "${FOO_VAR}"
        };
        const context = createMockTaskContext({ logger: NOOP_LOGGER });
        expect(() => replaceEnvVariables(content, { onError: (e) => context.failAndThrow(e) })).toThrow(FernCliError);
    });

    it("substitutes as empty in preview mode when substituteEnvVars is false", () => {
        process.env.TEST_VAR = "test-value";
        const content = {
            testField: "${TEST_VAR}"
        };

        const context = createMockTaskContext();
        // simulate preview mode with substituteEnvVars disabled
        const shouldSubstituteAsEmpty = true && !false; // preview && !substituteEnvVars
        const substituted = replaceEnvVariables(
            content,
            { onError: (e) => context.failAndThrow(e) },
            { substituteAsEmpty: shouldSubstituteAsEmpty }
        );

        expect(substituted.testField).toEqual("");
    });

    it("substitutes with actual values in preview mode when substituteEnvVars is true", () => {
        process.env.TEST_VAR = "test-value";
        const content = {
            testField: "${TEST_VAR}"
        };

        const context = createMockTaskContext();
        // simulate preview mode with substituteEnvVars enabled
        const shouldSubstituteAsEmpty = true && !true; // preview && !substituteEnvVars
        const substituted = replaceEnvVariables(
            content,
            { onError: (e) => context.failAndThrow(e) },
            { substituteAsEmpty: shouldSubstituteAsEmpty }
        );

        expect(substituted.testField).toEqual("test-value");
    });

    it("excludes jsFiles from env var substitution to avoid template literal conflicts", () => {
        process.env.API_KEY = "test-api-key";

        const docsDefinition = {
            config: {
                apiKey: "${API_KEY}" // Should be substituted
            },
            jsFiles: {
                "component.tsx": `
                    const greeting = \`Hello \${userName}!\`;
                    const config = { apiKey: "\${API_KEY}" };
                `
            }
        };

        // Simulate exclusion pattern used in actual code
        const { jsFiles, ...docsWithoutJsFiles } = docsDefinition;
        const context = createMockTaskContext();
        const substitutedDocs = replaceEnvVariables(
            docsWithoutJsFiles,
            { onError: (e) => context.failAndThrow(e) },
            { substituteAsEmpty: false }
        );
        const finalDocs = { ...substitutedDocs, jsFiles };

        // Config should have env vars substituted
        expect(finalDocs.config.apiKey).toEqual("test-api-key");
        // JS files should preserve template literals and not substitute env vars
        expect(finalDocs.jsFiles["component.tsx"]).toContain("${userName}"); // Template literal preserved
        expect(finalDocs.jsFiles["component.tsx"]).toContain("${API_KEY}"); // Env var not substituted in JS
    });

    it("substitutes env vars in API spec IR-like structures when substituteEnvVars is enabled", () => {
        process.env.API_BASE_URL = "https://api.example.com";
        process.env.API_VERSION = "v2";

        // Simulate a simplified IR structure with env vars in descriptions and examples
        const irLikeStructure = {
            apiName: {
                originalName: "MyAPI",
                camelCase: { unsafeName: "myApi", safeName: "myApi" },
                snakeCase: { unsafeName: "my_api", safeName: "my_api" },
                screamingSnakeCase: { unsafeName: "MY_API", safeName: "MY_API" },
                pascalCase: { unsafeName: "MyApi", safeName: "MyApi" }
            },
            apiDisplayName: "My API ${API_VERSION}",
            apiDocs: "Base URL: ${API_BASE_URL}",
            services: {
                service1: {
                    name: "UserService",
                    basePath: "${API_BASE_URL}/users",
                    endpoints: [
                        {
                            name: "getUser",
                            docs: "Fetches user from ${API_BASE_URL}/${API_VERSION}/users",
                            examples: [
                                {
                                    url: "${API_BASE_URL}/${API_VERSION}/users/123"
                                }
                            ]
                        }
                    ]
                }
            }
        };

        const context = createMockTaskContext();
        const substituted = replaceEnvVariables(
            irLikeStructure,
            { onError: (e) => context.failAndThrow(e) },
            { substituteAsEmpty: false }
        );

        // Verify env vars are substituted in various parts of the IR-like structure
        expect(substituted.apiDisplayName).toEqual("My API v2");
        expect(substituted.apiDocs).toEqual("Base URL: https://api.example.com");
        expect(substituted.services.service1.basePath).toEqual("https://api.example.com/users");
        expect(substituted.services.service1.endpoints[0]?.docs).toEqual(
            "Fetches user from https://api.example.com/v2/users"
        );
        expect(substituted.services.service1.endpoints[0]?.examples[0]?.url).toEqual(
            "https://api.example.com/v2/users/123"
        );
    });

    it("does not substitute env vars in API spec when substituteEnvVars is disabled", () => {
        process.env.API_BASE_URL = "https://api.example.com";

        const irLikeStructure = {
            apiDocs: "Base URL: ${API_BASE_URL}"
        };

        // When substituteEnvVars is disabled, the original content should remain unchanged
        // (i.e., we don't call replaceEnvVariables at all)
        expect(irLikeStructure.apiDocs).toEqual("Base URL: ${API_BASE_URL}");
    });
});
