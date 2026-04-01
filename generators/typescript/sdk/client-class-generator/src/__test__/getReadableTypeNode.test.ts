import { getTextOfTsNode } from "@fern-typescript/commons";
import { ts } from "ts-morph";
import { describe, expect, it } from "vitest";

import { getReadableTypeNode } from "../getReadableTypeNode.js";

// ─── Helpers ────────────────────────────────────────────────────────────────

// biome-ignore lint/suspicious/noExplicitAny: test mock for FileContext
function createMockContext(): any {
    return {
        externalDependencies: {
            stream: {
                Readable: {
                    _getReferenceToType: () => ts.factory.createTypeReferenceNode("stream.Readable")
                }
            }
        }
    };
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe("getReadableTypeNode", () => {
    it("returns stream.Readable for wrapper streamType", () => {
        const context = createMockContext();
        const result = getReadableTypeNode({
            context,
            streamType: "wrapper"
        });
        expect(getTextOfTsNode(result)).toBe("stream.Readable");
    });

    it("returns ReadableStream for web streamType without type argument", () => {
        const context = createMockContext();
        const result = getReadableTypeNode({
            context,
            streamType: "web"
        });
        expect(getTextOfTsNode(result)).toBe("ReadableStream");
    });

    it("returns ReadableStream<Uint8Array> for web streamType with type argument", () => {
        const context = createMockContext();
        const typeArg = ts.factory.createTypeReferenceNode("Uint8Array");
        const result = getReadableTypeNode({
            typeArgument: typeArg,
            context,
            streamType: "web"
        });
        expect(getTextOfTsNode(result)).toBe("ReadableStream<Uint8Array>");
    });

    it("ignores typeArgument for wrapper streamType", () => {
        const context = createMockContext();
        const typeArg = ts.factory.createTypeReferenceNode("Uint8Array");
        const result = getReadableTypeNode({
            typeArgument: typeArg,
            context,
            streamType: "wrapper"
        });
        // wrapper ignores typeArgument and returns stream.Readable
        expect(getTextOfTsNode(result)).toBe("stream.Readable");
    });

    it("returns ReadableStream without type params when typeArgument is undefined for web", () => {
        const context = createMockContext();
        const result = getReadableTypeNode({
            typeArgument: undefined,
            context,
            streamType: "web"
        });
        expect(getTextOfTsNode(result)).toBe("ReadableStream");
    });
});
