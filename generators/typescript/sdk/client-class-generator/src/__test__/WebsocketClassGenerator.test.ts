import { FernIr } from "@fern-fern/ir-sdk";
import { PackageId } from "@fern-typescript/commons";
import { casingsGenerator, createMinimalIR } from "@fern-typescript/test-utils";
import { describe, expect, it } from "vitest";

import { WebsocketClassGenerator } from "../WebsocketClassGenerator.js";

// ─── Helpers ────────────────────────────────────────────────────────────────

function createChannel(opts?: { messages?: FernIr.WebSocketMessage[] }): FernIr.WebSocketChannel {
    return {
        name: casingsGenerator.generateName("ChatChannel"),
        displayName: undefined,
        connectMethodName: undefined,
        baseUrl: undefined,
        path: { head: "/ws", parts: [] },
        auth: false,
        headers: [],
        queryParameters: [],
        pathParameters: [],
        messages: opts?.messages ?? [],
        docs: undefined,
        availability: undefined,
        examples: [],
        v2Examples: undefined
    };
}

function createGenerator(opts?: Partial<WebsocketClassGenerator.Init>): WebsocketClassGenerator {
    return new WebsocketClassGenerator({
        intermediateRepresentation: createMinimalIR(),
        retainOriginalCasing: false,
        omitUndefined: false,
        skipResponseValidation: false,
        ...opts
    });
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe("WebsocketClassGenerator", () => {
    describe("constructor", () => {
        it("constructs with default options", () => {
            const generator = createGenerator();
            expect(generator).toBeDefined();
        });

        it("constructs with retainOriginalCasing=true", () => {
            const generator = createGenerator({ retainOriginalCasing: true });
            expect(generator).toBeDefined();
        });

        it("constructs with omitUndefined=true", () => {
            const generator = createGenerator({ omitUndefined: true });
            expect(generator).toBeDefined();
        });

        it("constructs with skipResponseValidation=true", () => {
            const generator = createGenerator({ skipResponseValidation: true });
            expect(generator).toBeDefined();
        });
    });

    describe("generateWebsocketSocket", () => {
        it("returns a GeneratedWebsocketSocketClass instance", () => {
            const generator = createGenerator();
            const result = generator.generateWebsocketSocket({
                packageId: "pkg_test" as unknown as PackageId,
                channel: createChannel(),
                serviceClassName: "ChatSocket",
                includeSerdeLayer: true
            });
            expect(result).toBeDefined();
        });

        it("passes includeSerdeLayer=true to generated class", () => {
            const generator = createGenerator();
            const result = generator.generateWebsocketSocket({
                packageId: "pkg_test" as unknown as PackageId,
                channel: createChannel(),
                serviceClassName: "ChatSocket",
                includeSerdeLayer: true
            });
            expect(result).toBeDefined();
        });

        it("passes includeSerdeLayer=false to generated class", () => {
            const generator = createGenerator();
            const result = generator.generateWebsocketSocket({
                packageId: "pkg_test" as unknown as PackageId,
                channel: createChannel(),
                serviceClassName: "ChatSocket",
                includeSerdeLayer: false
            });
            expect(result).toBeDefined();
        });

        it("passes custom serviceClassName", () => {
            const generator = createGenerator();
            const result = generator.generateWebsocketSocket({
                packageId: "pkg_test" as unknown as PackageId,
                channel: createChannel(),
                serviceClassName: "CustomWebSocket",
                includeSerdeLayer: true
            });
            expect(result).toBeDefined();
        });

        it("propagates retainOriginalCasing from constructor", () => {
            const generator = createGenerator({ retainOriginalCasing: true });
            const result = generator.generateWebsocketSocket({
                packageId: "pkg_test" as unknown as PackageId,
                channel: createChannel(),
                serviceClassName: "CasedSocket",
                includeSerdeLayer: true
            });
            expect(result).toBeDefined();
        });

        it("propagates omitUndefined from constructor", () => {
            const generator = createGenerator({ omitUndefined: true });
            const result = generator.generateWebsocketSocket({
                packageId: "pkg_test" as unknown as PackageId,
                channel: createChannel(),
                serviceClassName: "OmitSocket",
                includeSerdeLayer: true
            });
            expect(result).toBeDefined();
        });

        it("propagates skipResponseValidation from constructor", () => {
            const generator = createGenerator({ skipResponseValidation: true });
            const result = generator.generateWebsocketSocket({
                packageId: "pkg_test" as unknown as PackageId,
                channel: createChannel(),
                serviceClassName: "SkipValidSocket",
                includeSerdeLayer: true
            });
            expect(result).toBeDefined();
        });
    });
});
