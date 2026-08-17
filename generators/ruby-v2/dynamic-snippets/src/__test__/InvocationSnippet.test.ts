import { AbsoluteFilePath, join } from "@fern-api/path-utils";

import { buildDynamicSnippetsGenerator } from "./utils/buildDynamicSnippetsGenerator.js";
import { buildGeneratorConfig } from "./utils/buildGeneratorConfig.js";

const DYNAMIC_IR_TEST_DEFINITIONS_DIRECTORY = AbsoluteFilePath.of(
    `${__dirname}/../../../../../packages/cli/generation/ir-generator-tests/src/dynamic-snippets/__test__/test-definitions`
);

// Invocation-only snippets are rendered inside code the caller already owns (e.g. a
// documentation code template), so they must not include the client construction
// (`client = Acme::Client.new(...)`) or the `require "acme"` preamble that construction emits.
//
// Ruby's `imports` field is always the empty string: a generated Ruby SDK references every type
// through the gem's module namespace (e.g. `Acme::Types::Foo`), so a bare invocation never emits
// a per-symbol `require`. Unlike TypeScript/PHP/C#/Java, Ruby has no import-referencing invocation
// case to surface — this is the expected and correct result, the Ruby analogue of Go always
// emitting `context`, inverted.
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

    it("generates the invocation without client construction or require preamble", () => {
        const response = generator.generateInvocationSync(request);

        expect(response?.snippet).toBe('client.endpoints.http_methods.test_get(id: "id")');
        // The invocation is a bare expression: no `client = Acme::Client.new(...)` construction and
        // no `require "..."` preamble (both belong to the client the caller owns).
        expect(response?.snippet).not.toContain(".new(");
        expect(response?.snippet).not.toContain("require ");
        expect(response?.errors).toBeUndefined();
    });

    it("returns no imports for a Ruby invocation (types are referenced via the gem namespace)", () => {
        const response = generator.generateInvocationSync(request);

        // Always empty for Ruby: there is no per-symbol require to surface for a bare call.
        expect(response?.imports).toBe("");
    });

    it("exposes the generated client class name so docs can render the client construction", () => {
        const response = generator.generateInvocationSync(request);

        expect(response?.clientName).toBe("Client");
    });

    it("exposes the root-client require so callers can prepend it to a bare invocation", () => {
        const response = generator.generateInvocationSync(request);

        // Ruby references the root client class through the gem's top-level require. This is the Ruby
        // analogue of the root-client import surfaced by TypeScript/PHP/C#/Java. Organization "acme"
        // → module `Acme` → `require "acme"`.
        expect(response?.clientImport).toBe('require "acme"');
        // The bare invocation snippet itself still omits the require preamble.
        expect(response?.snippet).not.toContain("require ");
    });

    it("invokes the endpoint on the requested client variable", () => {
        const response = generator.generateInvocationSync(request, { clientVariableName: "mailchimp" });

        expect(response?.snippet).toBe('mailchimp.endpoints.http_methods.test_get(id: "id")');
    });

    it("returns no imports even when the invocation constructs typed body values", () => {
        // This body constructs typed values (datetime, uuid, nested lists/maps). In
        // TypeScript/PHP/C#/Java such a call would surface per-symbol imports; in Ruby every type is
        // referenced through the gem namespace, so `imports` remains empty. This documents that Ruby
        // has no import-referencing invocation case.
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
        expect(response?.snippet).not.toContain("require ");
    });
});
