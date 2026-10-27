import { parseSdkConfigV1 } from "@postman/sdk-config/sdk-config/v1";
import { describe, expect, it } from "vitest";

import { assertNoHostedProtobufSources, isProtobufSource } from "../sdkConfigProtobufSources.js";

function config(specs: Array<Record<string, unknown>>): ReturnType<typeof parseSdkConfigV1> {
    return parseSdkConfigV1({
        schemaVersion: "sdk-config/v1",
        sdkName: "acme",
        source: { specs },
        targets: [{ language: "typescript", output: { delivery: "files" } }]
    });
}

describe("isProtobufSource", () => {
    it("tells protobuf sources from path and URL sources", () => {
        const { specs } = config([
            { id: "users", proto: { root: "./proto" } },
            { id: "orders", type: "openapi", path: "./openapi.yml" },
            { id: "billing", type: "openapi", url: "https://example.com/openapi.yml" }
        ]).source;
        expect(specs.map(isProtobufSource)).toEqual([true, false, false]);
    });
});

describe("assertNoHostedProtobufSources", () => {
    it("allows a config without protobuf sources", () => {
        expect(() =>
            assertNoHostedProtobufSources(config([{ id: "orders", type: "openapi", path: "./openapi.yml" }]))
        ).not.toThrow();
    });

    it("rejects protobuf sources, naming each one", () => {
        expect(() =>
            assertNoHostedProtobufSources(
                config([
                    { id: "users", proto: { root: "./proto", fromOpenApi: true } },
                    { id: "orders", type: "openapi", path: "./openapi.yml" },
                    { id: "billing", proto: { root: "./billing" } }
                ])
            )
        ).toThrow(
            "SDK Config protobuf sources 'users', 'billing' are not supported for hosted generation yet. Run with --local to generate from them."
        );
    });
});
