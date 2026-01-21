import { describe, expect, it } from "vitest";
import { check, CheckResult } from "../commands/validate/check";

describe("check", () => {
    it("returns error when fern directory does not exist", async () => {
        const result = await check({ directory: "/nonexistent/path" });

        expect(result.success).toBe(false);
        expect(result.errorCount).toBe(1);
        expect(result.apiResults).toHaveLength(0);
    });

    it("returns structured result with correct shape", async () => {
        // This test verifies the structure of the result
        const result = await check({ directory: "/nonexistent/path" });

        expect(result).toHaveProperty("success");
        expect(result).toHaveProperty("apiResults");
        expect(result).toHaveProperty("errorCount");
        expect(result).toHaveProperty("warningCount");
        expect(typeof result.success).toBe("boolean");
        expect(Array.isArray(result.apiResults)).toBe(true);
        expect(typeof result.errorCount).toBe("number");
        expect(typeof result.warningCount).toBe("number");
    });

    it("satisfies CheckResult type contract", async () => {
        const result: CheckResult = await check({ directory: "/nonexistent/path" });

        // Type-level check that the result conforms to CheckResult interface
        const _success: boolean = result.success;
        const _errorCount: number = result.errorCount;
        const _warningCount: number = result.warningCount;
        const _apiResults: Array<{ apiName: string; violations: unknown[]; elapsedMillis: number }> = result.apiResults;

        expect(_success).toBeDefined();
        expect(_errorCount).toBeDefined();
        expect(_warningCount).toBeDefined();
        expect(_apiResults).toBeDefined();
    });
});
