import { AbsoluteFilePath, join } from "@fern-api/path-utils";

import { buildDynamicSnippetsGenerator } from "./utils/buildDynamicSnippetsGenerator.js";
import { buildGeneratorConfig } from "./utils/buildGeneratorConfig.js";

const DYNAMIC_IR_TEST_DEFINITIONS_DIRECTORY = AbsoluteFilePath.of(
    `${__dirname}/../../../../../packages/cli/generation/ir-generator-tests/src/dynamic-snippets/__test__/test-definitions`
);

// Invocation-only snippets are rendered inside code the caller already owns (e.g. a
// documentation code template), so they must not include the client construction
// (`let config = ...; let client = AcmeClient::new(config)...;`), the `#[tokio::main] async fn main()`
// scaffold, or the `use <crate>::prelude::*;` preamble that construction emits.
//
// Rust's `imports` field is always the empty string. The Rust AST (`@fern-api/rust-codegen`) has no
// per-node import mechanism (no `importsToString`/`getImports`/`addImport`); generated snippets
// reference every SDK type by a bare name that resolves through a single blanket glob,
// `use <crate>::prelude::*;`, which re-exports the whole crate. That glob belongs to the client
// construction the caller owns, so a bare invocation surfaces no per-symbol `use`. This mirrors the
// Ruby port (types referenced via the gem namespace), not the C#/Java/PHP `{ code, imports }` helper
// pattern.
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

        expect(response?.snippet).toBe('client.endpoints.http_methods.test_get(&"id".to_string(), None).await');
        // The invocation is a bare expression: no `let config`/`let client = AcmeClient::new(...)`
        // construction, no `fn main` scaffold, and no `use ...;` preamble (all belong to the client
        // the caller owns).
        expect(response?.snippet).not.toContain("let config");
        expect(response?.snippet).not.toContain("::new(");
        expect(response?.snippet).not.toContain("fn main");
        expect(response?.snippet).not.toContain("use ");
        // No trailing statement terminator.
        expect(response?.snippet.endsWith(";")).toBe(false);
        expect(response?.errors).toBeUndefined();
    });

    it("returns no imports for a Rust invocation (types resolve via the prelude glob)", () => {
        const response = generator.generateInvocationSync(request);

        // Always empty for Rust: the AST has no per-symbol import mechanism, and types resolve
        // through the scaffold's `use <crate>::prelude::*;` glob.
        expect(response?.imports).toBe("");
    });

    it("exposes the generated client struct name so docs can render the client construction", () => {
        const response = generator.generateInvocationSync(request);

        expect(response?.clientName).toBe("AcmeClient");
    });

    it("invokes the endpoint on the requested client variable", () => {
        const response = generator.generateInvocationSync(request, { clientVariableName: "mailchimp" });

        expect(response?.snippet).toBe('mailchimp.endpoints.http_methods.test_get(&"id".to_string(), None).await');
    });

    it("returns no imports even when the invocation constructs typed body values", () => {
        // This body constructs typed values (DateTime, NaiveDate, Uuid, HashSet, HashMap, BigInt,
        // base64). In TypeScript/PHP/C#/Java such a call would surface per-symbol imports; in Rust
        // every type resolves through the prelude glob, so `imports` remains empty. This documents
        // that Rust has no import-referencing invocation case.
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
        expect(response?.snippet).not.toContain("use ");
        // References typed values inline (proof the invocation would need imports in an
        // import-tracking language) yet emits none, because Rust resolves them via the prelude glob.
        expect(response?.snippet).toContain("DateTime::parse_from_rfc3339");
    });
});
