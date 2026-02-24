import { verifyAsymmetricSignature } from "../../../src/core/webhooks/verifyAsymmetricSignature";

async function generateRsaKeyPair(): Promise<{ publicKey: string; privateKey: string }> {
    const crypto = await import("crypto");
    return new Promise((resolve, reject) => {
        crypto.generateKeyPair(
            "rsa",
            {
                modulusLength: 2048,
                publicKeyEncoding: { type: "spki", format: "pem" },
                privateKeyEncoding: { type: "pkcs8", format: "pem" },
            },
            (error, publicKey, privateKey) => {
                if (error) {
                    reject(error);
                } else {
                    resolve({ publicKey, privateKey });
                }
            },
        );
    });
}

async function generateEcKeyPair(): Promise<{ publicKey: string; privateKey: string }> {
    const crypto = await import("crypto");
    return new Promise((resolve, reject) => {
        crypto.generateKeyPair(
            "ec",
            {
                namedCurve: "P-256",
                publicKeyEncoding: { type: "spki", format: "pem" },
                privateKeyEncoding: { type: "pkcs8", format: "pem" },
            },
            (error, publicKey, privateKey) => {
                if (error) {
                    reject(error);
                } else {
                    resolve({ publicKey, privateKey });
                }
            },
        );
    });
}

async function sign(payload: string, privateKey: string, algorithm: string): Promise<Buffer> {
    const crypto = await import("crypto");
    return crypto.sign(algorithm, Buffer.from(payload), privateKey);
}

describe("verifyAsymmetricSignature", () => {
    describe("RSA-SHA256", () => {
        it("verifies a valid signature", async () => {
            const { publicKey, privateKey } = await generateRsaKeyPair();
            const payload = "test-payload";
            const signature = (await sign(payload, privateKey, "RSA-SHA256")).toString("base64");

            const result = await verifyAsymmetricSignature({
                payload,
                signature,
                publicKey,
                algorithm: "RSA_SHA256",
                encoding: "base64",
            });
            expect(result).toBe(true);
        });

        it("rejects a tampered payload", async () => {
            const { publicKey, privateKey } = await generateRsaKeyPair();
            const signature = (await sign("original-payload", privateKey, "RSA-SHA256")).toString("base64");

            const result = await verifyAsymmetricSignature({
                payload: "tampered-payload",
                signature,
                publicKey,
                algorithm: "RSA_SHA256",
                encoding: "base64",
            });
            expect(result).toBe(false);
        });

        it("rejects a wrong key", async () => {
            const keyPair1 = await generateRsaKeyPair();
            const keyPair2 = await generateRsaKeyPair();
            const payload = "test-payload";
            const signature = (await sign(payload, keyPair1.privateKey, "RSA-SHA256")).toString("base64");

            const result = await verifyAsymmetricSignature({
                payload,
                signature,
                publicKey: keyPair2.publicKey,
                algorithm: "RSA_SHA256",
                encoding: "base64",
            });
            expect(result).toBe(false);
        });

        it("works with hex encoding", async () => {
            const { publicKey, privateKey } = await generateRsaKeyPair();
            const payload = "test-payload";
            const signature = (await sign(payload, privateKey, "RSA-SHA256")).toString("hex");

            const result = await verifyAsymmetricSignature({
                payload,
                signature,
                publicKey,
                algorithm: "RSA_SHA256",
                encoding: "hex",
            });
            expect(result).toBe(true);
        });
    });

    describe("ECDSA-SHA256", () => {
        it("verifies a valid signature", async () => {
            const { publicKey, privateKey } = await generateEcKeyPair();
            const payload = "test-payload";
            const signature = (await sign(payload, privateKey, "SHA256")).toString("hex");

            const result = await verifyAsymmetricSignature({
                payload,
                signature,
                publicKey,
                algorithm: "ECDSA_SHA256",
                encoding: "hex",
            });
            expect(result).toBe(true);
        });

        it("rejects a tampered payload", async () => {
            const { publicKey, privateKey } = await generateEcKeyPair();
            const signature = (await sign("original-payload", privateKey, "SHA256")).toString("hex");

            const result = await verifyAsymmetricSignature({
                payload: "tampered-payload",
                signature,
                publicKey,
                algorithm: "ECDSA_SHA256",
                encoding: "hex",
            });
            expect(result).toBe(false);
        });
    });
});
