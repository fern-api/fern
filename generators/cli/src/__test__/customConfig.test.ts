import { describe, expect, it } from "vitest";
import { validateCustomConfig } from "../customConfig.js";

describe("validateCustomConfig", () => {
    it("returns the empty default for null/undefined", () => {
        expect(validateCustomConfig(null)).toEqual({});
        expect(validateCustomConfig(undefined)).toEqual({});
    });

    it("returns the empty default for an empty object", () => {
        expect(validateCustomConfig({})).toEqual({});
    });

    it("accepts a string binaryName", () => {
        expect(validateCustomConfig({ binaryName: "acme-cli" })).toEqual({ binaryName: "acme-cli" });
    });

    it("ignores undefined binaryName explicitly set", () => {
        expect(validateCustomConfig({ binaryName: undefined })).toEqual({});
    });

    it("ignores unknown keys (forward-compatible)", () => {
        expect(validateCustomConfig({ binaryName: "x", futureField: 42 })).toEqual({ binaryName: "x" });
    });

    it("throws on non-string binaryName (number)", () => {
        expect(() => validateCustomConfig({ binaryName: 42 })).toThrow(/expected a string, got number/);
    });

    it("throws on non-string binaryName (object)", () => {
        expect(() => validateCustomConfig({ binaryName: {} })).toThrow(/expected a string, got object/);
    });

    it("throws on non-object input (string)", () => {
        expect(() => validateCustomConfig("acme")).toThrow(/expected an object, got string/);
    });

    it("throws on non-object input (array)", () => {
        expect(() => validateCustomConfig(["acme"])).toThrow(/expected an object, got array/);
    });
});
