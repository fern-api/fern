import { describe, expect, it } from "vitest";

import { StatusCodeDiscriminatedEndpointErrorSchema } from "../StatusCodeDiscriminatedEndpointErrorSchema.js";

describe("StatusCodeDiscriminatedEndpointErrorSchema", () => {
    describe("writeToFile()", () => {
        it("is a no-op that does not throw", () => {
            // biome-ignore lint/suspicious/noExplicitAny: test mock for FileContext
            expect(() => StatusCodeDiscriminatedEndpointErrorSchema.writeToFile({} as any)).not.toThrow();
        });

        it("returns undefined (void)", () => {
            // biome-ignore lint/suspicious/noExplicitAny: test mock for FileContext
            const result = StatusCodeDiscriminatedEndpointErrorSchema.writeToFile({} as any);
            expect(result).toBeUndefined();
        });
    });

    describe("getReferenceToRawShape()", () => {
        it("throws error about status-code discriminated errors", () => {
            expect(() =>
                // biome-ignore lint/suspicious/noExplicitAny: test mock for FileContext
                StatusCodeDiscriminatedEndpointErrorSchema.getReferenceToRawShape({} as any)
            ).toThrow("No endpoint error schema was generated because errors are status-code discriminated.");
        });
    });

    describe("getReferenceToZurgSchema()", () => {
        it("throws error about status-code discriminated errors", () => {
            expect(() =>
                // biome-ignore lint/suspicious/noExplicitAny: test mock for FileContext
                StatusCodeDiscriminatedEndpointErrorSchema.getReferenceToZurgSchema({} as any)
            ).toThrow("No endpoint error schema was generated because errors are status-code discriminated.");
        });
    });
});
