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

async function generateEcKeyPair(
    namedCurve: "P-256" | "P-384" | "P-521" = "P-256",
): Promise<{ publicKey: string; privateKey: string }> {
    const crypto = await import("crypto");
    return new Promise((resolve, reject) => {
        crypto.generateKeyPair(
            "ec",
            {
                namedCurve,
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

async function generateEd25519KeyPair(): Promise<{ publicKey: string; privateKey: string }> {
    const crypto = await import("crypto");
    return new Promise((resolve, reject) => {
        crypto.generateKeyPair(
            "ed25519",
            {
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

async function sign(payload: string, privateKey: string, algorithm: string | null): Promise<Buffer> {
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

    describe("RSA-SHA384", () => {
        it("verifies a valid signature", async () => {
            const { publicKey, privateKey } = await generateRsaKeyPair();
            const payload = "test-payload";
            const signature = (await sign(payload, privateKey, "RSA-SHA384")).toString("base64");

            const result = await verifyAsymmetricSignature({
                payload,
                signature,
                publicKey,
                algorithm: "RSA_SHA384",
                encoding: "base64",
            });
            expect(result).toBe(true);
        });

        it("rejects a tampered payload", async () => {
            const { publicKey, privateKey } = await generateRsaKeyPair();
            const signature = (await sign("original-payload", privateKey, "RSA-SHA384")).toString("base64");

            const result = await verifyAsymmetricSignature({
                payload: "tampered-payload",
                signature,
                publicKey,
                algorithm: "RSA_SHA384",
                encoding: "base64",
            });
            expect(result).toBe(false);
        });
    });

    describe("RSA-SHA512", () => {
        it("verifies a valid signature", async () => {
            const { publicKey, privateKey } = await generateRsaKeyPair();
            const payload = "test-payload";
            const signature = (await sign(payload, privateKey, "RSA-SHA512")).toString("base64");

            const result = await verifyAsymmetricSignature({
                payload,
                signature,
                publicKey,
                algorithm: "RSA_SHA512",
                encoding: "base64",
            });
            expect(result).toBe(true);
        });

        it("rejects a tampered payload", async () => {
            const { publicKey, privateKey } = await generateRsaKeyPair();
            const signature = (await sign("original-payload", privateKey, "RSA-SHA512")).toString("base64");

            const result = await verifyAsymmetricSignature({
                payload: "tampered-payload",
                signature,
                publicKey,
                algorithm: "RSA_SHA512",
                encoding: "base64",
            });
            expect(result).toBe(false);
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

    describe("ECDSA-SHA384", () => {
        it("verifies a valid signature", async () => {
            const { publicKey, privateKey } = await generateEcKeyPair("P-384");
            const payload = "test-payload";
            const signature = (await sign(payload, privateKey, "SHA384")).toString("hex");

            const result = await verifyAsymmetricSignature({
                payload,
                signature,
                publicKey,
                algorithm: "ECDSA_SHA384",
                encoding: "hex",
            });
            expect(result).toBe(true);
        });

        it("rejects a tampered payload", async () => {
            const { publicKey, privateKey } = await generateEcKeyPair("P-384");
            const signature = (await sign("original-payload", privateKey, "SHA384")).toString("hex");

            const result = await verifyAsymmetricSignature({
                payload: "tampered-payload",
                signature,
                publicKey,
                algorithm: "ECDSA_SHA384",
                encoding: "hex",
            });
            expect(result).toBe(false);
        });
    });

    describe("ECDSA-SHA512", () => {
        it("verifies a valid signature", async () => {
            const { publicKey, privateKey } = await generateEcKeyPair("P-521");
            const payload = "test-payload";
            const signature = (await sign(payload, privateKey, "SHA512")).toString("hex");

            const result = await verifyAsymmetricSignature({
                payload,
                signature,
                publicKey,
                algorithm: "ECDSA_SHA512",
                encoding: "hex",
            });
            expect(result).toBe(true);
        });

        it("rejects a tampered payload", async () => {
            const { publicKey, privateKey } = await generateEcKeyPair("P-521");
            const signature = (await sign("original-payload", privateKey, "SHA512")).toString("hex");

            const result = await verifyAsymmetricSignature({
                payload: "tampered-payload",
                signature,
                publicKey,
                algorithm: "ECDSA_SHA512",
                encoding: "hex",
            });
            expect(result).toBe(false);
        });
    });

    describe("ED25519", () => {
        it("verifies a valid signature", async () => {
            const { publicKey, privateKey } = await generateEd25519KeyPair();
            const payload = "test-payload";
            const signature = (await sign(payload, privateKey, null)).toString("base64");

            const result = await verifyAsymmetricSignature({
                payload,
                signature,
                publicKey,
                algorithm: "ED25519",
                encoding: "base64",
            });
            expect(result).toBe(true);
        });

        it("rejects a tampered payload", async () => {
            const { publicKey, privateKey } = await generateEd25519KeyPair();
            const signature = (await sign("original-payload", privateKey, null)).toString("base64");

            const result = await verifyAsymmetricSignature({
                payload: "tampered-payload",
                signature,
                publicKey,
                algorithm: "ED25519",
                encoding: "base64",
            });
            expect(result).toBe(false);
        });

        it("rejects a wrong key", async () => {
            const keyPair1 = await generateEd25519KeyPair();
            const keyPair2 = await generateEd25519KeyPair();
            const payload = "test-payload";
            const signature = (await sign(payload, keyPair1.privateKey, null)).toString("base64");

            const result = await verifyAsymmetricSignature({
                payload,
                signature,
                publicKey: keyPair2.publicKey,
                algorithm: "ED25519",
                encoding: "base64",
            });
            expect(result).toBe(false);
        });
    });
});
