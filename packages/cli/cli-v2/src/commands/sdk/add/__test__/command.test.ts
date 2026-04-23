import { SdkAddInputSchema } from "@fern-api/config";
import { describe, expect, it } from "vitest";

describe("SdkAddInputSchema", () => {
    it("accepts a target-name + SdkTargetSchema pair", () => {
        const result = SdkAddInputSchema.safeParse({
            name: "typescript",
            target: { output: "./sdks/typescript" }
        });
        expect(result.success).toBe(true);
    });

    it("accepts a target with a version and group", () => {
        const result = SdkAddInputSchema.safeParse({
            name: "python",
            target: {
                output: "./sdks/python",
                version: "1.2.3",
                group: ["production"]
            }
        });
        expect(result.success).toBe(true);
    });

    it("rejects a payload missing 'name'", () => {
        const result = SdkAddInputSchema.safeParse({
            target: { output: "./sdks/typescript" }
        });
        expect(result.success).toBe(false);
    });

    it("rejects a payload missing 'target'", () => {
        const result = SdkAddInputSchema.safeParse({ name: "typescript" });
        expect(result.success).toBe(false);
    });

    it("rejects a non-object root value", () => {
        const result = SdkAddInputSchema.safeParse("not-an-object");
        expect(result.success).toBe(false);
    });
});
