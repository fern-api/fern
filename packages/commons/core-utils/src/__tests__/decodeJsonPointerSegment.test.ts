import { decodeJsonPointerSegment } from "../decodeJsonPointerSegment.js";

describe("decodeJsonPointerSegment", () => {
    it("decodes ~1 and ~0", () => {
        expect(decodeJsonPointerSegment("a~1b")).toBe("a/b");
        expect(decodeJsonPointerSegment("a~0b")).toBe("a~b");
    });

    it("decodes ~1 before ~0, as RFC 6901 requires", () => {
        expect(decodeJsonPointerSegment("~01")).toBe("~1");
    });

    it("leaves other text alone", () => {
        expect(decodeJsonPointerSegment("plain")).toBe("plain");
    });
});
