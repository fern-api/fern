import { base64Decode, base64Encode } from "../../core/base64";

describe("base64", () => {
    describe("base64Encode", () => {
        it("should encode ASCII strings", () => {
            expect(base64Encode("hello")).toBe("aGVsbG8=");
            expect(base64Encode("")).toBe("");
        });

        it("should encode UTF-8 strings", () => {
            expect(base64Encode("café")).toBe("Y2Fmw6k=");
            expect(base64Encode("🎉")).toBe("8J+OiQ==");
        });

        it("should handle basic auth credentials", () => {
            expect(base64Encode("username:password")).toBe("dXNlcm5hbWU6cGFzc3dvcmQ=");
        });
    });

    describe("base64Decode", () => {
        it("should decode ASCII strings", () => {
            expect(base64Decode("aGVsbG8=")).toBe("hello");
            expect(base64Decode("")).toBe("");
        });

        it("should decode UTF-8 strings", () => {
            expect(base64Decode("Y2Fmw6k=")).toBe("café");
            expect(base64Decode("8J+OiQ==")).toBe("🎉");
        });

        it("should handle basic auth credentials", () => {
            expect(base64Decode("dXNlcm5hbWU6cGFzc3dvcmQ=")).toBe("username:password");
        });
    });

    describe("round-trip encoding", () => {
        const testStrings = [
            "hello world",
            "test@example.com",
            "café",
            "username:password",
            "user@domain.com:super$ecret123!",
        ];

        testStrings.forEach((testString) => {
            it(`should round-trip encode/decode: "${testString}"`, () => {
                const encoded = base64Encode(testString);
                const decoded = base64Decode(encoded);
                expect(decoded).toBe(testString);
            });
        });
    });
});
