import { hasErrnoCode, isEnoentError } from "../isEnoentError.js";

describe("isEnoentError", () => {
    it("returns true for a Node error with code ENOENT", () => {
        const error: NodeJS.ErrnoException = new Error("not found");
        error.code = "ENOENT";
        expect(isEnoentError(error)).toBe(true);
    });

    it("returns true for a plain object with code ENOENT", () => {
        expect(isEnoentError({ code: "ENOENT" })).toBe(true);
    });

    it("returns false for other error codes", () => {
        expect(isEnoentError({ code: "EACCES" })).toBe(false);
    });

    it("returns false for errors without a code", () => {
        expect(isEnoentError(new Error("boom"))).toBe(false);
    });

    it("returns false for non-objects", () => {
        expect(isEnoentError(undefined)).toBe(false);
        expect(isEnoentError(null)).toBe(false);
        expect(isEnoentError("ENOENT")).toBe(false);
    });
});

describe("hasErrnoCode", () => {
    it("matches the given code", () => {
        expect(hasErrnoCode({ code: "EEXIST" }, "EEXIST")).toBe(true);
        expect(hasErrnoCode({ code: "EEXIST" }, "ENOENT")).toBe(false);
    });
});
