import { describe, expect, it } from "vitest";
import { baseGoCustomConfigSchema } from "../BaseGoCustomConfigSchema.js";

describe("Go v2 timeouts config", () => {
    it("should accept a full timeouts block", () => {
        const result = baseGoCustomConfigSchema.safeParse({ timeouts: { connect: 5, read: 30, write: 30 } });
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.timeouts).toEqual({ connect: 5, read: 30, write: 30 });
        }
    });

    it("should accept a partial timeouts block", () => {
        const result = baseGoCustomConfigSchema.safeParse({ timeouts: { read: 10 } });
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.timeouts).toEqual({ read: 10 });
        }
    });

    it("should accept fractional seconds", () => {
        const result = baseGoCustomConfigSchema.safeParse({ timeouts: { connect: 2.5 } });
        expect(result.success).toBe(true);
    });

    it("should accept config without timeouts (optional)", () => {
        const result = baseGoCustomConfigSchema.safeParse({});
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.timeouts).toBeUndefined();
        }
    });

    it("should reject negative timeout values", () => {
        const result = baseGoCustomConfigSchema.safeParse({ timeouts: { connect: -1 } });
        expect(result.success).toBe(false);
    });

    it("should reject unknown timeout phases", () => {
        const result = baseGoCustomConfigSchema.safeParse({ timeouts: { idle: 5 } });
        expect(result.success).toBe(false);
    });
});
