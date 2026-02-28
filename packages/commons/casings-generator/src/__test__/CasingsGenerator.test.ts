import { constructCasingsGenerator } from "../CasingsGenerator.js";

describe("CasingsGenerator underscore preservation with preserveUnderscores option", () => {
    describe("without preserveUnderscores (default behavior - underscores stripped by lodash)", () => {
        const generator = constructCasingsGenerator({
            generationLanguage: undefined,
            keywords: undefined,
            smartCasing: false
        });

        it("strips leading underscore by default", () => {
            const result = generator.generateName("_internal");
            expect(result.camelCase.unsafeName).toBe("internal");
            expect(result.snakeCase.unsafeName).toBe("internal");
            expect(result.pascalCase.unsafeName).toBe("Internal");
        });

        it("does not affect names without underscores", () => {
            const result = generator.generateName("normalName");
            expect(result.camelCase.unsafeName).toBe("normalName");
            expect(result.snakeCase.unsafeName).toBe("normal_name");
            expect(result.pascalCase.unsafeName).toBe("NormalName");
        });

        it("preserves originalName exactly as input", () => {
            const result = generator.generateName("_internal");
            expect(result.originalName).toBe("_internal");
        });
    });

    describe("with preserveUnderscores: true (no smartCasing)", () => {
        const generator = constructCasingsGenerator({
            generationLanguage: undefined,
            keywords: undefined,
            smartCasing: false
        });

        it("preserves single leading underscore", () => {
            const result = generator.generateName("_internal", { preserveUnderscores: true });
            expect(result.camelCase.unsafeName).toBe("_internal");
            expect(result.snakeCase.unsafeName).toBe("_internal");
            expect(result.pascalCase.unsafeName).toBe("_Internal");
            expect(result.screamingSnakeCase.unsafeName).toBe("_INTERNAL");
        });

        it("preserves double leading underscores", () => {
            const result = generator.generateName("__private", { preserveUnderscores: true });
            expect(result.camelCase.unsafeName).toBe("__private");
            expect(result.snakeCase.unsafeName).toBe("__private");
            expect(result.pascalCase.unsafeName).toBe("__Private");
            expect(result.screamingSnakeCase.unsafeName).toBe("__PRIVATE");
        });

        it("preserves trailing underscore", () => {
            const result = generator.generateName("reserved_", { preserveUnderscores: true });
            expect(result.camelCase.unsafeName).toBe("reserved_");
            expect(result.snakeCase.unsafeName).toBe("reserved_");
            expect(result.pascalCase.unsafeName).toBe("Reserved_");
            expect(result.screamingSnakeCase.unsafeName).toBe("RESERVED_");
        });

        it("preserves both leading and trailing underscores", () => {
            const result = generator.generateName("_both_", { preserveUnderscores: true });
            expect(result.camelCase.unsafeName).toBe("_both_");
            expect(result.snakeCase.unsafeName).toBe("_both_");
            expect(result.pascalCase.unsafeName).toBe("_Both_");
            expect(result.screamingSnakeCase.unsafeName).toBe("_BOTH_");
        });

        it("handles all-underscore input without doubling", () => {
            const result = generator.generateName("_", { preserveUnderscores: true });
            expect(result.camelCase.unsafeName).toBe("_");
            expect(result.snakeCase.unsafeName).toBe("_");
        });

        it("handles double underscore input without quadrupling", () => {
            const result = generator.generateName("__", { preserveUnderscores: true });
            expect(result.camelCase.unsafeName).toBe("__");
            expect(result.snakeCase.unsafeName).toBe("__");
        });

        it("does not affect names without underscores", () => {
            const result = generator.generateName("normalName", { preserveUnderscores: true });
            expect(result.camelCase.unsafeName).toBe("normalName");
            expect(result.snakeCase.unsafeName).toBe("normal_name");
            expect(result.pascalCase.unsafeName).toBe("NormalName");
        });

        it("handles multi-word underscore-prefixed names", () => {
            const result = generator.generateName("_internal_api", { preserveUnderscores: true });
            expect(result.camelCase.unsafeName).toBe("_internalApi");
            expect(result.snakeCase.unsafeName).toBe("_internal_api");
            expect(result.pascalCase.unsafeName).toBe("_InternalApi");
        });

        it("preserves original name", () => {
            const result = generator.generateName("_internal", { preserveUnderscores: true });
            expect(result.originalName).toBe("_internal");
        });
    });

    describe("with preserveUnderscores: true and smartCasing + Go (initialism capitalization)", () => {
        const generator = constructCasingsGenerator({
            generationLanguage: "go",
            keywords: undefined,
            smartCasing: true
        });

        it("preserves leading underscore with smartCasing for camelCase", () => {
            const result = generator.generateName("_internal", { preserveUnderscores: true });
            expect(result.camelCase.unsafeName).toBe("_internal");
        });

        it("preserves leading underscore with smartCasing for pascalCase", () => {
            const result = generator.generateName("_internal", { preserveUnderscores: true });
            expect(result.pascalCase.unsafeName).toBe("_Internal");
        });

        it("preserves leading underscore with smartCasing for snakeCase", () => {
            const result = generator.generateName("_internal", { preserveUnderscores: true });
            expect(result.snakeCase.unsafeName).toBe("_internal");
        });

        it("preserves underscore with initialism in smartCasing", () => {
            const result = generator.generateName("_httpClient", { preserveUnderscores: true });
            expect(result.camelCase.unsafeName).toBe("_httpClient");
            expect(result.snakeCase.unsafeName).toBe("_http_client");
        });

        it("handles underscore-prefixed name with API initialism", () => {
            const result = generator.generateName("_apiKey", { preserveUnderscores: true });
            expect(result.camelCase.unsafeName).toBe("_apiKey");
            expect(result.snakeCase.unsafeName).toBe("_api_key");
        });

        it("uppercases initialism not at index 0 with underscore prefix", () => {
            const result = generator.generateName("_getHttpResponse", { preserveUnderscores: true });
            expect(result.camelCase.unsafeName).toBe("_getHTTPResponse");
            expect(result.snakeCase.unsafeName).toBe("_get_http_response");
        });

        it("does not affect normal names in smartCasing", () => {
            const result = generator.generateName("normalName", { preserveUnderscores: true });
            expect(result.camelCase.unsafeName).toBe("normalName");
            expect(result.snakeCase.unsafeName).toBe("normal_name");
            expect(result.pascalCase.unsafeName).toBe("NormalName");
        });
    });

    describe("with preserveUnderscores: true and smartCasing + Ruby", () => {
        const generator = constructCasingsGenerator({
            generationLanguage: "ruby",
            keywords: undefined,
            smartCasing: true
        });

        it("preserves leading underscore with Ruby smartCasing", () => {
            const result = generator.generateName("_internal", { preserveUnderscores: true });
            expect(result.camelCase.unsafeName).toBe("_internal");
            expect(result.snakeCase.unsafeName).toBe("_internal");
        });
    });

    describe("with preserveUnderscores: true and smartCasing + undefined language (default)", () => {
        const generator = constructCasingsGenerator({
            generationLanguage: undefined,
            keywords: undefined,
            smartCasing: true
        });

        it("preserves leading underscore with default smartCasing", () => {
            const result = generator.generateName("_internal", { preserveUnderscores: true });
            expect(result.camelCase.unsafeName).toBe("_internal");
            expect(result.snakeCase.unsafeName).toBe("_internal");
            expect(result.pascalCase.unsafeName).toBe("_Internal");
        });
    });

    describe("with preserveUnderscores: true and smartCasing + Python (no initialism capitalization)", () => {
        const generator = constructCasingsGenerator({
            generationLanguage: "python",
            keywords: undefined,
            smartCasing: true
        });

        it("preserves leading underscore without initialism capitalization", () => {
            const result = generator.generateName("_internal", { preserveUnderscores: true });
            expect(result.camelCase.unsafeName).toBe("_internal");
            expect(result.snakeCase.unsafeName).toBe("_internal");
        });

        it("preserves leading underscore for multi-word names", () => {
            const result = generator.generateName("_internal_api", { preserveUnderscores: true });
            expect(result.camelCase.unsafeName).toBe("_internalApi");
            expect(result.snakeCase.unsafeName).toBe("_internal_api");
        });
    });

    describe("backward compatibility - names without underscores unchanged", () => {
        const generatorNoSmart = constructCasingsGenerator({
            generationLanguage: undefined,
            keywords: undefined,
            smartCasing: false
        });

        const generatorSmart = constructCasingsGenerator({
            generationLanguage: "go",
            keywords: undefined,
            smartCasing: true
        });

        const testCases = ["hello", "helloWorld", "hello_world", "HelloWorld", "HELLO_WORLD", "v2", "httpApi"];

        for (const name of testCases) {
            it(`"${name}" is unaffected without smartCasing`, () => {
                const result = generatorNoSmart.generateName(name);
                expect(result.camelCase.unsafeName).toBeTruthy();
                expect(result.snakeCase.unsafeName).toBeTruthy();
                expect(result.pascalCase.unsafeName).toBeTruthy();
            });

            it(`"${name}" is unaffected with smartCasing`, () => {
                const result = generatorSmart.generateName(name);
                expect(result.camelCase.unsafeName).toBeTruthy();
                expect(result.snakeCase.unsafeName).toBeTruthy();
                expect(result.pascalCase.unsafeName).toBeTruthy();
            });
        }
    });

    describe("edge cases", () => {
        const generator = constructCasingsGenerator({
            generationLanguage: undefined,
            keywords: undefined,
            smartCasing: false
        });

        it("handles underscore in middle of name (not leading/trailing)", () => {
            const result = generator.generateName("hello_world", { preserveUnderscores: true });
            expect(result.camelCase.unsafeName).toBe("helloWorld");
            expect(result.snakeCase.unsafeName).toBe("hello_world");
        });

        it("handles name with spaces and leading underscore", () => {
            const result = generator.generateName("_hello world", { preserveUnderscores: true });
            expect(result.camelCase.unsafeName).toBe("_helloWorld");
            expect(result.snakeCase.unsafeName).toBe("_hello_world");
        });

        it("preserves originalName exactly as input", () => {
            const result = generator.generateName("_Internal_API_", { preserveUnderscores: true });
            expect(result.originalName).toBe("_Internal_API_");
        });
    });
});
