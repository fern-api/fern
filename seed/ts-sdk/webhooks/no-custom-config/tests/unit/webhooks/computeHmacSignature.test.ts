import { computeHmacSignature } from "../../../src/core/webhooks/computeHmacSignature";

describe("computeHmacSignature", () => {
    it("computes SHA-256 HMAC with hex encoding", async () => {
        const result = await computeHmacSignature({
            payload: "test-payload",
            secret: "test-secret",
            algorithm: "sha256",
            encoding: "hex",
        });
        expect(result).toBe("5b12467d7c448555779e70d76204105c67d27d1c991f3080c19732f9ac1988ef");
    });

    it("computes SHA-256 HMAC with base64 encoding", async () => {
        const result = await computeHmacSignature({
            payload: "test-payload",
            secret: "test-secret",
            algorithm: "sha256",
            encoding: "base64",
        });
        expect(result).toBe("WxJGfXxEhVV3nnDXYgQQXGfSfRyZHzCAwZcy+awZiO8=");
    });

    it("computes SHA-1 HMAC with hex encoding", async () => {
        const result = await computeHmacSignature({
            payload: "hello",
            secret: "secret",
            algorithm: "sha1",
            encoding: "hex",
        });
        expect(result).toBe("5112055c05f944f85755efc5cd8970e194e9f45b");
    });

    it("computes SHA-512 HMAC with hex encoding", async () => {
        const result = await computeHmacSignature({
            payload: "hello",
            secret: "secret",
            algorithm: "sha512",
            encoding: "hex",
        });
        expect(typeof result).toBe("string");
        expect(result.length).toBe(128); // SHA-512 hex is 128 chars
    });

    it("produces different signatures for different payloads", async () => {
        const sig1 = await computeHmacSignature({
            payload: "payload-a",
            secret: "secret",
            algorithm: "sha256",
            encoding: "hex",
        });
        const sig2 = await computeHmacSignature({
            payload: "payload-b",
            secret: "secret",
            algorithm: "sha256",
            encoding: "hex",
        });
        expect(sig1).not.toBe(sig2);
    });

    it("produces different signatures for different secrets", async () => {
        const sig1 = await computeHmacSignature({
            payload: "payload",
            secret: "secret-a",
            algorithm: "sha256",
            encoding: "hex",
        });
        const sig2 = await computeHmacSignature({
            payload: "payload",
            secret: "secret-b",
            algorithm: "sha256",
            encoding: "hex",
        });
        expect(sig1).not.toBe(sig2);
    });
});
