import { encodePathParam, join } from "../../../src/core/url/index";

describe("encodePathParam", () => {
    it("should encode reserved characters", () => {
        expect(encodePathParam("a/b?c#d")).toBe("a%2Fb%3Fc%23d");
    });

    it("should encode primitives", () => {
        expect(encodePathParam("plant_1")).toBe("plant_1");
        expect(encodePathParam(42)).toBe("42");
        expect(encodePathParam(true)).toBe("true");
        expect(encodePathParam(null)).toBe("null");
        expect(encodePathParam(undefined)).toBe("undefined");
    });

    it("should allow values that contain dots", () => {
        expect(encodePathParam("...")).toBe("...");
        expect(encodePathParam("v1.2")).toBe("v1.2");
        expect(encodePathParam("../plants")).toBe("..%2Fplants");
        expect(encodePathParam("%2e%2e")).toBe("%252e%252e");
    });

    it("should reject dot-segment values", () => {
        expect(() => encodePathParam(".")).toThrow();
        expect(() => encodePathParam("..")).toThrow();
    });

    it("should keep encoded values within their path segment", () => {
        const path = `plants/${encodePathParam("../plants")}/leaves/${encodePathParam("L1")}`;
        expect(join("https://api.example.com", path)).toBe("https://api.example.com/plants/..%2Fplants/leaves/L1");
    });
});
