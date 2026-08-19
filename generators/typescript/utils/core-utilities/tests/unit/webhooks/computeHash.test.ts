import { computeHash } from "../../../src/core/webhooks/computeHash";

describe("computeHash", () => {
    it("computes SHA-256 hex digest of the raw body", async () => {
        const result = await computeHash({
            payload: "hello",
            algorithm: "sha256",
            encoding: "hex",
        });
        expect(result).toBe("2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824");
    });

    it("computes SHA-1 hex digest of the raw body", async () => {
        const result = await computeHash({
            payload: "hello",
            algorithm: "sha1",
            encoding: "hex",
        });
        expect(result).toBe("aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d");
    });

    it("matches the Twilio bodySHA256 scheme (sha256/hex of the JSON body)", async () => {
        const body = JSON.stringify({ messageSid: "SM123", status: "delivered" });
        const result = await computeHash({
            payload: body,
            algorithm: "sha256",
            encoding: "hex",
        });
        expect(result).toBe("8fde9e5e9275489edf302e1501dd8218dc56af6125dfb404c8e40751e5fea277");
    });

    it("supports base64 encoding", async () => {
        const body = JSON.stringify({ messageSid: "SM123", status: "delivered" });
        const result = await computeHash({
            payload: body,
            algorithm: "sha256",
            encoding: "base64",
        });
        expect(result).toBe("j96eXpJ1SJ7fMC4VAd2CGNxWr2El37QEyOQHUeX+onc=");
    });

    it("computes SHA-512 hex digest (128 hex chars)", async () => {
        const result = await computeHash({
            payload: "hello",
            algorithm: "sha512",
            encoding: "hex",
        });
        expect(typeof result).toBe("string");
        expect(result.length).toBe(128);
    });

    it("is unkeyed: the digest changes when the raw body is tampered with", async () => {
        const original = await computeHash({ payload: "original-body", algorithm: "sha256", encoding: "hex" });
        const tampered = await computeHash({ payload: "tampered-body", algorithm: "sha256", encoding: "hex" });
        expect(original).not.toBe(tampered);
    });
});
