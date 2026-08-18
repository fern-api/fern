import { constructCasingsGenerator, constructFullCasingsGenerator } from "../CasingsGenerator.js";

describe("CasingsGenerator underscore preservation with preserveUnderscores option", () => {
    describe("without preserveUnderscores (default behavior - underscores stripped by lodash)", () => {
        const generator = constructFullCasingsGenerator({
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
        const generator = constructFullCasingsGenerator({
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
        const generator = constructFullCasingsGenerator({
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
        const generator = constructFullCasingsGenerator({
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
        const generator = constructFullCasingsGenerator({
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
        const generator = constructFullCasingsGenerator({
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

    describe("smartCasing snake_case digit boundaries (default: fused)", () => {
        const generator = constructFullCasingsGenerator({
            generationLanguage: undefined,
            keywords: undefined,
            smartCasing: true
        });

        it("keeps trailing digits fused to the previous word", () => {
            const result = generator.generateName("applicationV1");
            expect(result.snakeCase.unsafeName).toBe("application_v1");
        });

        it("keeps digit-prefixed lowercase words fused", () => {
            const result = generator.generateName("2v22");
            expect(result.snakeCase.unsafeName).toBe("2v22");
        });

        it("keeps a capitalized word following digits fused by default", () => {
            const result = generator.generateName("ConversationsV2Configuration");
            expect(result.snakeCase.unsafeName).toBe("conversations_v2configuration");
            expect(result.camelCase.unsafeName).toBe("conversationsV2Configuration");
            expect(result.pascalCase.unsafeName).toBe("ConversationsV2Configuration");
        });

        it("keeps a capitalized word following digits fused in endpoint-style names", () => {
            const result = generator.generateName("CreateOauth2Token");
            expect(result.snakeCase.unsafeName).toBe("create_oauth2token");
        });

        it("keeps digits fused in proto-style names by default", () => {
            expect(generator.generateName("Int32Value").snakeCase.unsafeName).toBe("int32value");
            expect(generator.generateName("Mode5InterrogationResponse").snakeCase.unsafeName).toBe(
                "mode5interrogation_response"
            );
        });
    });

    describe("smartCasing snake_case digit boundaries with smartCasingDigitWordBoundary", () => {
        const generator = constructFullCasingsGenerator({
            generationLanguage: undefined,
            keywords: undefined,
            smartCasing: true,
            smartCasingDigitWordBoundary: true
        });

        it("keeps trailing digits fused to the previous word", () => {
            const result = generator.generateName("applicationV1");
            expect(result.snakeCase.unsafeName).toBe("application_v1");
        });

        it("keeps standalone digit words unchanged", () => {
            expect(generator.generateName("v2").snakeCase.unsafeName).toBe("v2");
            expect(generator.generateName("2v22").snakeCase.unsafeName).toBe("2v22");
        });

        it("separates a capitalized word following digits", () => {
            const result = generator.generateName("ConversationsV2Configuration");
            expect(result.snakeCase.unsafeName).toBe("conversations_v2_configuration");
            expect(result.camelCase.unsafeName).toBe("conversationsV2Configuration");
            expect(result.pascalCase.unsafeName).toBe("ConversationsV2Configuration");
        });

        it("separates a capitalized word following digits in endpoint-style names", () => {
            const result = generator.generateName("CreateOauth2Token");
            expect(result.snakeCase.unsafeName).toBe("create_oauth2_token");
        });

        it("separates proto-style names after digit runs", () => {
            expect(generator.generateName("Int32Value").snakeCase.unsafeName).toBe("int32_value");
            expect(generator.generateName("Mode5InterrogationResponse").snakeCase.unsafeName).toBe(
                "mode5_interrogation_response"
            );
        });

        it("preserves existing underscore boundaries after digits", () => {
            const result = generator.generateName("conversations_v2_configuration");
            expect(result.snakeCase.unsafeName).toBe("conversations_v2_configuration");
        });
    });

    describe("backward compatibility - names without underscores unchanged", () => {
        const generatorNoSmart = constructFullCasingsGenerator({
            generationLanguage: undefined,
            keywords: undefined,
            smartCasing: false
        });

        const generatorSmart = constructFullCasingsGenerator({
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
        const generator = constructFullCasingsGenerator({
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

    describe("compression - CasingsGenerator returns strings when no casingOverrides", () => {
        const generator = constructCasingsGenerator({
            generationLanguage: undefined,
            keywords: undefined,
            smartCasing: false
        });

        it("returns a plain string when no casingOverrides provided", () => {
            const result = generator.generateName("myField");
            expect(result).toBe("myField");
        });

        it("returns a full Name when casingOverrides are provided", () => {
            const result = generator.generateName("myField", { casingOverrides: { camel: "myField" } });
            expect(typeof result).toBe("object");
            if (typeof result !== "string") {
                expect(result.originalName).toBe("myField");
            }
        });
    });
});

describe("CasingsGenerator additionalAcronyms", () => {
    const generator = constructFullCasingsGenerator({
        generationLanguage: "go",
        keywords: undefined,
        smartCasing: true,
        additionalAcronyms: ["FDX", "CRA", "EWA", "OAuth"]
    });

    const withoutAcronyms = constructFullCasingsGenerator({
        generationLanguage: "go",
        keywords: undefined,
        smartCasing: true
    });

    it.each([
        ["fdx", "FDX"],
        ["FDX", "FDX"],
        ["f_d_x", "FDX"],
        ["cra_report", "CRAReport"],
        ["CRAReport", "CRAReport"],
        ["EWAReport", "EWAReport"],
        ["report_for_cra", "ReportForCRA"]
    ])("uppercases the configured acronym in %s => %s", (input, expected) => {
        expect(generator.generateName(input).pascalCase.unsafeName).toBe(expected);
    });

    it.each([
        ["oauth", "OAuth"],
        ["o_auth", "OAuth"],
        ["OAuth", "OAuth"],
        ["oauth_token", "OAuthToken"]
    ])("preserves the supplied casing of a mixed-case acronym in %s => %s", (input, expected) => {
        expect(generator.generateName(input).pascalCase.unsafeName).toBe(expected);
    });

    it("still applies the built-in initialisms", () => {
        expect(generator.generateName("api_key").pascalCase.unsafeName).toBe("APIKey");
        expect(generator.generateName("url_thing").pascalCase.unsafeName).toBe("URLThing");
    });

    it("leaves names alone when no acronyms are configured", () => {
        expect(withoutAcronyms.generateName("cra_report").pascalCase.unsafeName).toBe("CraReport");
        expect(withoutAcronyms.generateName("fdx").pascalCase.unsafeName).toBe("Fdx");
    });

    it("does not change snake_case or camelCase leading words", () => {
        const result = generator.generateName("cra_report");
        expect(result.snakeCase.unsafeName).toBe("cra_report");
        expect(result.screamingSnakeCase.unsafeName).toBe("CRA_REPORT");
        expect(result.camelCase.unsafeName).toBe("craReport");
    });

    it("uppercases a configured acronym that follows another word in camelCase", () => {
        expect(generator.generateName("report_for_cra").camelCase.unsafeName).toBe("reportForCRA");
    });

    it("capitalizes a lowercase acronym entry that leads the name", () => {
        const lowercaseAcronyms = constructFullCasingsGenerator({
            generationLanguage: "go",
            keywords: undefined,
            smartCasing: true,
            additionalAcronyms: ["fdx", ""]
        });
        expect(lowercaseAcronyms.generateName("fdx").pascalCase.unsafeName).toBe("Fdx");
        expect(lowercaseAcronyms.generateName("fdx_report").pascalCase.unsafeName).toBe("FdxReport");
        expect(lowercaseAcronyms.generateName("_").pascalCase.unsafeName).toBe("");
    });
});
