import { describe, expect, it } from "vitest";

import { OpenRpcSpecSchema } from "../OpenRpcSpecSchema.js";

describe("OpenRpcSpecSchema", () => {
    describe("overrides", () => {
        it("should accept single override string", () => {
            const input = {
                openrpc: "./api.json",
                overrides: "./overrides.yml"
            };
            const result = OpenRpcSpecSchema.safeParse(input);
            expect(result.success).toBe(true);
        });

        it("should accept array of override strings", () => {
            const input = {
                openrpc: "./api.json",
                overrides: ["./overrides1.yml", "./overrides2.yml"]
            };
            const result = OpenRpcSpecSchema.safeParse(input);
            expect(result.success).toBe(true);
        });

        it("should accept undefined overrides", () => {
            const input = {
                openrpc: "./api.json"
            };
            const result = OpenRpcSpecSchema.safeParse(input);
            expect(result.success).toBe(true);
        });
    });
});
