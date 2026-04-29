import { describe, expect, it } from "vitest";
import { DEFAULT_PARSE_OPENAPI_SETTINGS } from "../options.js";
import { isAdditionalPropertiesAny } from "../schema/convertAdditionalProperties.js";

describe("isAdditionalPropertiesAny", () => {
    const options = DEFAULT_PARSE_OPENAPI_SETTINGS;

    it("should handle boolean true", () => {
        expect(isAdditionalPropertiesAny(true, options)).toBe(true);
    });

    it("should handle boolean false", () => {
        expect(isAdditionalPropertiesAny(false, options)).toBe(false);
    });

    it('should handle string "true" without crashing', () => {
        // OpenAPI specs may have additionalProperties: "true" (string instead of boolean)
        // This should not throw "Cannot use 'in' operator to search for 'type' in true"
        expect(isAdditionalPropertiesAny("true" as unknown as boolean, options)).toBe(true);
    });

    it('should handle string "false" without crashing', () => {
        expect(isAdditionalPropertiesAny("false" as unknown as boolean, options)).toBe(true);
    });

    it("should handle null without crashing", () => {
        // null is treated as undefined (returns the default)
        expect(isAdditionalPropertiesAny(null as unknown as boolean, options)).toBe(false);
    });

    it("should handle number without crashing", () => {
        expect(isAdditionalPropertiesAny(1 as unknown as boolean, options)).toBe(true);
    });

    it("should return false for schema with type", () => {
        expect(isAdditionalPropertiesAny({ type: "string" }, options)).toBe(false);
    });

    it("should return true for empty object schema", () => {
        expect(isAdditionalPropertiesAny({}, options)).toBe(true);
    });
});
