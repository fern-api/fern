import { SdkAddInputSchema } from "@fern-api/config";
import { CliError } from "@fern-api/task-context";
import { describe, expect, it } from "vitest";
import { validateJsonInput } from "../validateJsonInput.js";

describe("validateJsonInput", () => {
    it("returns parsed data on success", () => {
        const value = {
            name: "typescript",
            target: { output: "./sdks/typescript" }
        };
        const result = validateJsonInput({ value, schema: SdkAddInputSchema, schemaName: "sdk-add-input" });
        expect(result.name).toBe("typescript");
        expect(result.target.output).toBe("./sdks/typescript");
    });

    it("throws CliError listing each zod issue with a path and message on failure", () => {
        try {
            validateJsonInput({
                value: { name: 42, target: { output: 123 } },
                schema: SdkAddInputSchema,
                schemaName: "sdk-add-input"
            });
            throw new Error("expected to throw");
        } catch (err) {
            expect(err).toMatchObject({
                code: CliError.Code.ValidationError
            });
            const message = (err as CliError).message ?? "";
            expect(message).toContain("sdk-add-input");
            expect(message).toContain("name");
            expect(message).toContain("target.output");
        }
    });

    it("rejects completely wrong shapes", () => {
        expect(() =>
            validateJsonInput({ value: "not-an-object", schema: SdkAddInputSchema, schemaName: "sdk-add-input" })
        ).toThrow();
    });
});
