import { describe, expect, it } from "vitest";
import { validateCustomConfig } from "../customConfig.js";

describe("validateCustomConfig", () => {
    it("returns defaults (customCommands: true) for null/undefined", () => {
        expect(validateCustomConfig(null)).toEqual({ customCommands: true });
        expect(validateCustomConfig(undefined)).toEqual({ customCommands: true });
    });

    it("returns the empty result for an empty object (customCommands resolved at pipeline level)", () => {
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

    it("accepts a boolean customCommands", () => {
        expect(validateCustomConfig({ customCommands: false })).toEqual({ customCommands: false });
    });

    it("throws on non-boolean customCommands", () => {
        expect(() => validateCustomConfig({ customCommands: "yes" })).toThrow(/expected a boolean, got string/);
    });

    it("accepts a string rootGroup", () => {
        expect(validateCustomConfig({ rootGroup: "api" })).toEqual({ rootGroup: "api" });
    });

    it("ignores undefined rootGroup explicitly set", () => {
        expect(validateCustomConfig({ rootGroup: undefined })).toEqual({});
    });

    it("throws on non-string rootGroup (number)", () => {
        expect(() => validateCustomConfig({ rootGroup: 42 })).toThrow(/expected a string, got number/);
    });

    it("throws on non-string rootGroup (boolean)", () => {
        expect(() => validateCustomConfig({ rootGroup: true })).toThrow(/expected a string, got boolean/);
    });

    it("accepts rootGroup with hyphens, underscores, and digits", () => {
        expect(validateCustomConfig({ rootGroup: "my-api_v2" })).toEqual({ rootGroup: "my-api_v2" });
    });

    it("throws on rootGroup with uppercase letters", () => {
        expect(() => validateCustomConfig({ rootGroup: "Api" })).toThrow(/contains invalid characters/);
    });

    it("throws on rootGroup starting with a digit", () => {
        expect(() => validateCustomConfig({ rootGroup: "2api" })).toThrow(/contains invalid characters/);
    });

    it("throws on rootGroup containing quotes (injection attempt)", () => {
        expect(() => validateCustomConfig({ rootGroup: 'api")); panic!("' })).toThrow(/contains invalid characters/);
    });

    it("throws on empty rootGroup", () => {
        expect(() => validateCustomConfig({ rootGroup: "" })).toThrow(/contains invalid characters/);
    });

    it("accepts a valid userAgentSuffixFlag", () => {
        expect(validateCustomConfig({ userAgentSuffixFlag: "via" })).toEqual({ userAgentSuffixFlag: "via" });
    });

    it("accepts a kebab userAgentSuffixFlag with digits", () => {
        expect(validateCustomConfig({ userAgentSuffixFlag: "user-agent-suffix" })).toEqual({
            userAgentSuffixFlag: "user-agent-suffix"
        });
        expect(validateCustomConfig({ userAgentSuffixFlag: "app-info2" })).toEqual({
            userAgentSuffixFlag: "app-info2"
        });
    });

    it("ignores undefined userAgentSuffixFlag explicitly set (default applied downstream)", () => {
        expect(validateCustomConfig({ userAgentSuffixFlag: undefined })).toEqual({});
    });

    it("throws on non-string userAgentSuffixFlag", () => {
        expect(() => validateCustomConfig({ userAgentSuffixFlag: 42 })).toThrow(/expected a string, got number/);
    });

    it("throws on userAgentSuffixFlag with a leading --", () => {
        expect(() => validateCustomConfig({ userAgentSuffixFlag: "--via" })).toThrow(/is not a valid flag name/);
    });

    it("throws on userAgentSuffixFlag with uppercase letters", () => {
        expect(() => validateCustomConfig({ userAgentSuffixFlag: "Via" })).toThrow(/is not a valid flag name/);
    });

    it("throws on userAgentSuffixFlag starting with a digit", () => {
        expect(() => validateCustomConfig({ userAgentSuffixFlag: "1x" })).toThrow(/is not a valid flag name/);
    });

    it("throws on userAgentSuffixFlag with underscores", () => {
        expect(() => validateCustomConfig({ userAgentSuffixFlag: "user_agent" })).toThrow(/is not a valid flag name/);
    });

    it("throws on empty userAgentSuffixFlag", () => {
        expect(() => validateCustomConfig({ userAgentSuffixFlag: "" })).toThrow(/is not a valid flag name/);
    });
});
