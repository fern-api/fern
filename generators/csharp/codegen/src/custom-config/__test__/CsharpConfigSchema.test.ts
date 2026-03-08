import { CsharpConfigSchema } from "../CsharpConfigSchema.js";

describe("CsharpConfigSchema", () => {
    describe("generate-dependency-injection-extensions", () => {
        it("accepts true", () => {
            const result = CsharpConfigSchema.safeParse({
                "generate-dependency-injection-extensions": true
            });
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data["generate-dependency-injection-extensions"]).toBe(true);
            }
        });

        it("accepts false", () => {
            const result = CsharpConfigSchema.safeParse({
                "generate-dependency-injection-extensions": false
            });
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data["generate-dependency-injection-extensions"]).toBe(false);
            }
        });

        it("defaults to undefined when not provided", () => {
            const result = CsharpConfigSchema.safeParse({});
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data["generate-dependency-injection-extensions"]).toBeUndefined();
            }
        });
    });
});
