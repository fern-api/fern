import { timingSafeEqual } from "../../../src/core/webhooks/timingSafeEqual";

describe("timingSafeEqual", () => {
    it("returns true for equal strings", async () => {
        expect(await timingSafeEqual("hello", "hello")).toBe(true);
    });

    it("returns true for empty strings", async () => {
        expect(await timingSafeEqual("", "")).toBe(true);
    });

    it("returns false for different strings of same length", async () => {
        expect(await timingSafeEqual("hello", "world")).toBe(false);
    });

    it("returns false for strings of different length", async () => {
        expect(await timingSafeEqual("short", "longer-string")).toBe(false);
    });

    it("returns false when first string is longer", async () => {
        expect(await timingSafeEqual("longer-string", "short")).toBe(false);
    });

    it("returns false for single character difference", async () => {
        expect(await timingSafeEqual("abcdef", "abcdeg")).toBe(false);
    });

    it("handles hex-encoded signatures", async () => {
        const sig = "5b12467d7c448555779e70d76204105c67d27d1c991f3080c19732f9ac1988ef";
        expect(await timingSafeEqual(sig, sig)).toBe(true);
        expect(await timingSafeEqual(sig, sig.replace("5b", "6b"))).toBe(false);
    });

    it("handles base64-encoded signatures", async () => {
        const sig = "WxJGfXxEhVV3nnDXYgQQXGfSfRyZHzCAwZcy+awZiO8=";
        expect(await timingSafeEqual(sig, sig)).toBe(true);
        expect(await timingSafeEqual(sig, sig.replace("Wx", "Xx"))).toBe(false);
    });
});
