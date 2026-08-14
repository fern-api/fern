import { AbsoluteFilePath, join } from "@fern-api/path-utils";

import { buildDynamicSnippetsGenerator } from "./utils/buildDynamicSnippetsGenerator.js";
import { buildGeneratorConfig } from "./utils/buildGeneratorConfig.js";

const DYNAMIC_IR_TEST_DEFINITIONS_DIRECTORY = AbsoluteFilePath.of(
    `${__dirname}/../../../../../packages/cli/generation/ir-generator-tests/src/dynamic-snippets/__test__/test-definitions`
);

// Invocation-only snippets are rendered inside code the caller already owns (e.g. a
// documentation code template), so they must not include the client construction
// (`let client = AcmeClient(...)`), the `private func main() async throws { ... }` scaffold, or the
// `import Foundation` / `import <Module>` preamble that construction emits.
//
// Swift's `imports` field is always the empty string. The Swift AST (`@fern-api/swift-codegen`) has
// no per-node import mechanism (its `Writer` is a plain buffer with no `getImports`/`addImport`);
// generated snippets reference every SDK type by a bare name that resolves through the two
// module-level imports emitted once by the scaffold (`import Foundation`, `import <Module>`). Those
// belong to the client construction the caller owns, so a bare invocation surfaces no per-symbol
// `import`. This mirrors the Ruby/Rust ports (types referenced via the module/gem namespace), not
// the C#/Java/PHP `{ code, imports }` helper pattern.
describe("invocation-only snippets", () => {
    const generator = buildDynamicSnippetsGenerator({
        irFilepath: AbsoluteFilePath.of(join(DYNAMIC_IR_TEST_DEFINITIONS_DIRECTORY, "exhaustive.json")),
        config: buildGeneratorConfig()
    });

    const request = {
        endpoint: {
            method: "GET" as const,
            path: "/http-methods/{id}"
        },
        baseURL: undefined,
        environment: undefined,
        auth: {
            type: "bearer" as const,
            token: "<YOUR_API_KEY>"
        },
        pathParameters: {
            id: "id"
        },
        queryParameters: undefined,
        headers: undefined,
        requestBody: undefined
    };

    it("generates the invocation without client construction or scaffold", () => {
        const response = generator.generateInvocationSync(request);

        expect(response?.snippet).toBe('try await client.endpoints.httpMethods.testGet(id: "id")');
        // The invocation is a bare expression: no `let client = AcmeClient(...)` construction, no
        // `func main` scaffold, and no `import ...` preamble (all belong to the client the caller
        // owns).
        expect(response?.snippet).not.toContain("let client");
        expect(response?.snippet).not.toContain("Client(");
        expect(response?.snippet).not.toContain("func main");
        expect(response?.snippet).not.toContain("import ");
        // Swift has no statement terminator; ensure none leaks.
        expect(response?.snippet.endsWith(";")).toBe(false);
        expect(response?.errors).toBeUndefined();
    });

    it("returns no imports for a Swift invocation (types resolve via module-level imports)", () => {
        const response = generator.generateInvocationSync(request);

        // Always empty for Swift: the AST has no per-symbol import mechanism, and types resolve
        // through the scaffold's `import Foundation` / `import <Module>` statements.
        expect(response?.imports).toBe("");
    });

    it("exposes the generated client class name so docs can render the client construction", () => {
        const response = generator.generateInvocationSync(request);

        expect(response?.clientName).toBe("AcmeClient");
    });

    it("invokes the endpoint on the requested client variable", () => {
        const response = generator.generateInvocationSync(request, { clientVariableName: "mailchimp" });

        expect(response?.snippet).toBe('try await mailchimp.endpoints.httpMethods.testGet(id: "id")');
    });

    it("returns no imports even when the invocation constructs typed body values", () => {
        // This body constructs typed values (Date, UUID, Data, dictionaries). In
        // TypeScript/PHP/C#/Java such a call would surface per-symbol imports; in Swift every type
        // resolves through the module-level imports, so `imports` remains empty. This documents that
        // Swift has no import-referencing invocation case.
        const response = generator.generateInvocationSync({
            endpoint: {
                method: "POST" as const,
                path: "/object/get-and-return-with-optional-field"
            },
            baseURL: undefined,
            environment: undefined,
            auth: {
                type: "bearer" as const,
                token: "<YOUR_API_KEY>"
            },
            pathParameters: undefined,
            queryParameters: undefined,
            headers: undefined,
            requestBody: {
                string: "string",
                integer: 1,
                long: 1000000,
                double: 1.1,
                bool: true,
                datetime: "2024-01-15T09:30:00Z",
                date: "2023-01-15",
                uuid: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
                base64: "SGVsbG8gd29ybGQh",
                list: ["list", "list"],
                set: ["set"],
                map: { 1: "map" },
                bigint: "1000000"
            }
        });

        expect(response).not.toBeUndefined();
        expect(response?.imports).toBe("");
        expect(response?.snippet).not.toContain("import ");
    });
});
