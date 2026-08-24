import * as FernIr from "@fern-api/ir-sdk";

import { mergeIntermediateRepresentation } from "../mergeIntermediateRepresentation.js";
import { casingsGenerator, makeMinimalIr } from "./utils/makeMinimalIr.js";

function makeHeader(wireValue: string): FernIr.HttpHeader {
    return {
        name: {
            wireValue,
            name: casingsGenerator.generateName(wireValue)
        },
        valueType: FernIr.TypeReference.primitive({
            v1: "STRING",
            v2: FernIr.PrimitiveTypeV2.string({ default: undefined, validation: undefined })
        }),
        env: undefined,
        availability: undefined,
        docs: undefined,
        clientDefault: undefined,
        defaultValue: undefined,
        v2Examples: undefined
    };
}

describe("mergeIntermediateRepresentation", () => {
    describe("header deduplication", () => {
        it("deduplicates global headers with the same wire value", () => {
            const ir1 = makeMinimalIr({ headers: [makeHeader("custom_api_key")] });
            const ir2 = makeMinimalIr({ headers: [makeHeader("custom_api_key")] });

            const merged = mergeIntermediateRepresentation(ir1, ir2, casingsGenerator);

            expect(merged.headers).toHaveLength(1);
            expect(merged.headers[0]?.name).toHaveProperty("wireValue", "custom_api_key");
        });

        it("deduplicates global headers case-insensitively", () => {
            const ir1 = makeMinimalIr({ headers: [makeHeader("X-Api-Key")] });
            const ir2 = makeMinimalIr({ headers: [makeHeader("x-api-key")] });

            const merged = mergeIntermediateRepresentation(ir1, ir2, casingsGenerator);

            expect(merged.headers).toHaveLength(1);
            expect(merged.headers[0]?.name).toHaveProperty("wireValue", "X-Api-Key");
        });

        it("keeps headers with different wire values", () => {
            const ir1 = makeMinimalIr({ headers: [makeHeader("X-Api-Key")] });
            const ir2 = makeMinimalIr({ headers: [makeHeader("X-Request-Id")] });

            const merged = mergeIntermediateRepresentation(ir1, ir2, casingsGenerator);

            expect(merged.headers).toHaveLength(2);
        });

        it("deduplicates across multiple specs with the same header", () => {
            const ir1 = makeMinimalIr({ headers: [makeHeader("custom_api_key")] });
            const ir2 = makeMinimalIr({ headers: [makeHeader("custom_api_key")] });
            const ir3 = makeMinimalIr({ headers: [makeHeader("custom_api_key")] });
            const ir4 = makeMinimalIr({ headers: [makeHeader("custom_api_key")] });

            let merged = mergeIntermediateRepresentation(ir1, ir2, casingsGenerator);
            merged = mergeIntermediateRepresentation(merged, ir3, casingsGenerator);
            merged = mergeIntermediateRepresentation(merged, ir4, casingsGenerator);

            expect(merged.headers).toHaveLength(1);
        });

        it("deduplicates idempotency headers by wire value", () => {
            const ir1 = makeMinimalIr({ idempotencyHeaders: [makeHeader("Idempotency-Key")] });
            const ir2 = makeMinimalIr({ idempotencyHeaders: [makeHeader("Idempotency-Key")] });

            const merged = mergeIntermediateRepresentation(ir1, ir2, casingsGenerator);

            expect(merged.idempotencyHeaders).toHaveLength(1);
            expect(merged.idempotencyHeaders[0]?.name).toHaveProperty("wireValue", "Idempotency-Key");
        });

        it("handles empty headers gracefully", () => {
            const ir1 = makeMinimalIr({ headers: [] });
            const ir2 = makeMinimalIr({ headers: [] });

            const merged = mergeIntermediateRepresentation(ir1, ir2, casingsGenerator);

            expect(merged.headers).toHaveLength(0);
        });

        it("handles one IR with headers and one without", () => {
            const ir1 = makeMinimalIr({ headers: [makeHeader("X-Api-Key")] });
            const ir2 = makeMinimalIr({ headers: [] });

            const merged = mergeIntermediateRepresentation(ir1, ir2, casingsGenerator);

            expect(merged.headers).toHaveLength(1);
        });
    });
});
