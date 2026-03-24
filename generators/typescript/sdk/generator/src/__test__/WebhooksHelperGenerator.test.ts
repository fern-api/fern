import { FernIr } from "@fern-fern/ir-sdk";
import { Project, ts } from "ts-morph";
import { describe, expect, it } from "vitest";

import { WebhooksHelperGenerator } from "../webhooks/WebhooksHelperGenerator.js";

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────

function createMockSdkContext() {
    const project = new Project({ useInMemoryFileSystem: true });
    const sourceFile = project.createSourceFile("test.ts", "");
    return {
        sourceFile,
        coreUtilities: {
            webhookCrypto: {
                computeHmacSignature: {
                    _invoke: (argsExpr: ts.Expression) =>
                        ts.factory.createCallExpression(
                            ts.factory.createPropertyAccessExpression(
                                ts.factory.createIdentifier("webhookCrypto"),
                                "computeHmacSignature"
                            ),
                            undefined,
                            [argsExpr]
                        )
                },
                timingSafeEqual: {
                    _invoke: (a: ts.Expression, b: ts.Expression) =>
                        ts.factory.createCallExpression(
                            ts.factory.createPropertyAccessExpression(
                                ts.factory.createIdentifier("webhookCrypto"),
                                "timingSafeEqual"
                            ),
                            undefined,
                            [a, b]
                        )
                },
                verifyAsymmetricSignature: {
                    _invoke: (argsExpr: ts.Expression) =>
                        ts.factory.createCallExpression(
                            ts.factory.createPropertyAccessExpression(
                                ts.factory.createIdentifier("webhookCrypto"),
                                "verifyAsymmetricSignature"
                            ),
                            undefined,
                            [argsExpr]
                        )
                },
                fetchJwks: {
                    _invoke: (argsExpr: ts.Expression) =>
                        ts.factory.createCallExpression(
                            ts.factory.createPropertyAccessExpression(
                                ts.factory.createIdentifier("webhookCrypto"),
                                "fetchJwks"
                            ),
                            undefined,
                            [argsExpr]
                        )
                }
            }
        }
        // biome-ignore lint/suspicious/noExplicitAny: test mock
    } as any;
}

function createWireValue(name: string): FernIr.NameAndWireValue {
    return {
        wireValue: name,
        name: {
            originalName: name,
            camelCase: { unsafeName: name, safeName: name },
            snakeCase: { unsafeName: name, safeName: name },
            screamingSnakeCase: { unsafeName: name, safeName: name },
            pascalCase: { unsafeName: name, safeName: name }
        }
    };
}

// ────────────────────────────────────────────────────────────────────────────
// HMAC verification
// ────────────────────────────────────────────────────────────────────────────

describe("WebhooksHelperGenerator", () => {
    describe("HMAC verification", () => {
        it("writes basic HMAC SHA256 class with hex encoding", () => {
            const verification: FernIr.WebhookSignatureVerification = FernIr.WebhookSignatureVerification.hmac({
                algorithm: "SHA256",
                encoding: "HEX",
                signatureHeaderName: createWireValue("X-Signature"),
                signaturePrefix: undefined,
                timestamp: undefined,
                payloadFormat: {
                    components: ["BODY"],
                    delimiter: "."
                }
            });
            const generator = new WebhooksHelperGenerator(verification);
            const context = createMockSdkContext();
            generator.writeToFile(context);
            expect(context.sourceFile.getFullText()).toMatchSnapshot();
        });

        it("writes HMAC SHA512 class with base64 encoding", () => {
            const verification: FernIr.WebhookSignatureVerification = FernIr.WebhookSignatureVerification.hmac({
                algorithm: "SHA512",
                encoding: "BASE64",
                signatureHeaderName: createWireValue("X-Webhook-Signature"),
                signaturePrefix: undefined,
                timestamp: undefined,
                payloadFormat: {
                    components: ["BODY"],
                    delimiter: "."
                }
            });
            const generator = new WebhooksHelperGenerator(verification);
            const context = createMockSdkContext();
            generator.writeToFile(context);
            expect(context.sourceFile.getFullText()).toMatchSnapshot();
        });

        it("writes HMAC class with signature prefix", () => {
            const verification: FernIr.WebhookSignatureVerification = FernIr.WebhookSignatureVerification.hmac({
                algorithm: "SHA256",
                encoding: "HEX",
                signatureHeaderName: createWireValue("X-Signature"),
                signaturePrefix: "sha256=",
                timestamp: undefined,
                payloadFormat: {
                    components: ["BODY"],
                    delimiter: "."
                }
            });
            const generator = new WebhooksHelperGenerator(verification);
            const context = createMockSdkContext();
            generator.writeToFile(context);
            const text = context.sourceFile.getFullText();
            expect(text).toContain("SIGNATURE_PREFIX");
            expect(text).toContain("sha256=");
            expect(text).toMatchSnapshot();
        });

        it("writes HMAC class with UNIX_SECONDS timestamp validation", () => {
            const verification: FernIr.WebhookSignatureVerification = FernIr.WebhookSignatureVerification.hmac({
                algorithm: "SHA256",
                encoding: "HEX",
                signatureHeaderName: createWireValue("X-Signature"),
                signaturePrefix: undefined,
                timestamp: {
                    headerName: createWireValue("X-Timestamp"),
                    format: "UNIX_SECONDS",
                    tolerance: 300
                },
                payloadFormat: {
                    components: ["BODY"],
                    delimiter: "."
                }
            });
            const generator = new WebhooksHelperGenerator(verification);
            const context = createMockSdkContext();
            generator.writeToFile(context);
            const text = context.sourceFile.getFullText();
            expect(text).toContain("TIMESTAMP_TOLERANCE_SECONDS");
            expect(text).toContain("timestampValue * 1000");
            expect(text).toContain("unix seconds");
            expect(text).toMatchSnapshot();
        });

        it("writes HMAC class with UNIX_MILLIS timestamp format", () => {
            const verification: FernIr.WebhookSignatureVerification = FernIr.WebhookSignatureVerification.hmac({
                algorithm: "SHA256",
                encoding: "HEX",
                signatureHeaderName: createWireValue("X-Signature"),
                signaturePrefix: undefined,
                timestamp: {
                    headerName: createWireValue("X-Timestamp"),
                    format: "UNIX_MILLIS",
                    tolerance: 600
                },
                payloadFormat: {
                    components: ["BODY"],
                    delimiter: "."
                }
            });
            const generator = new WebhooksHelperGenerator(verification);
            const context = createMockSdkContext();
            generator.writeToFile(context);
            const text = context.sourceFile.getFullText();
            expect(text).toContain("unix milliseconds");
            expect(text).toContain("const timestampMs = timestampValue;");
            expect(text).toMatchSnapshot();
        });

        it("writes HMAC class with ISO8601 timestamp format", () => {
            const verification: FernIr.WebhookSignatureVerification = FernIr.WebhookSignatureVerification.hmac({
                algorithm: "SHA256",
                encoding: "HEX",
                signatureHeaderName: createWireValue("X-Signature"),
                signaturePrefix: undefined,
                timestamp: {
                    headerName: createWireValue("X-Timestamp"),
                    format: "ISO8601",
                    tolerance: undefined
                },
                payloadFormat: {
                    components: ["BODY"],
                    delimiter: "."
                }
            });
            const generator = new WebhooksHelperGenerator(verification);
            const context = createMockSdkContext();
            generator.writeToFile(context);
            const text = context.sourceFile.getFullText();
            expect(text).toContain("ISO 8601");
            expect(text).toContain("new Date(timestampHeader).getTime()");
            expect(text).toMatchSnapshot();
        });

        it("writes HMAC class with multi-component payload format", () => {
            const verification: FernIr.WebhookSignatureVerification = FernIr.WebhookSignatureVerification.hmac({
                algorithm: "SHA256",
                encoding: "HEX",
                signatureHeaderName: createWireValue("X-Signature"),
                signaturePrefix: undefined,
                timestamp: {
                    headerName: createWireValue("X-Timestamp"),
                    format: "UNIX_SECONDS",
                    tolerance: 300
                },
                payloadFormat: {
                    components: ["MESSAGE_ID", "TIMESTAMP", "BODY"],
                    delimiter: "."
                }
            });
            const generator = new WebhooksHelperGenerator(verification);
            const context = createMockSdkContext();
            generator.writeToFile(context);
            const text = context.sourceFile.getFullText();
            expect(text).toContain("messageId");
            expect(text).toContain('[messageId, timestampHeader, requestBody].join(".")');
            expect(text).toMatchSnapshot();
        });

        it("writes HMAC class with NOTIFICATION_URL payload component", () => {
            const verification: FernIr.WebhookSignatureVerification = FernIr.WebhookSignatureVerification.hmac({
                algorithm: "SHA256",
                encoding: "HEX",
                signatureHeaderName: createWireValue("X-Signature"),
                signaturePrefix: undefined,
                timestamp: undefined,
                payloadFormat: {
                    components: ["NOTIFICATION_URL", "BODY"],
                    delimiter: "|"
                }
            });
            const generator = new WebhooksHelperGenerator(verification);
            const context = createMockSdkContext();
            generator.writeToFile(context);
            const text = context.sourceFile.getFullText();
            expect(text).toContain("notificationUrl");
            expect(text).toContain('[notificationUrl, requestBody].join("|")');
            expect(text).toMatchSnapshot();
        });

        it("writes HMAC SHA1 algorithm variant", () => {
            const verification: FernIr.WebhookSignatureVerification = FernIr.WebhookSignatureVerification.hmac({
                algorithm: "SHA1",
                encoding: "HEX",
                signatureHeaderName: createWireValue("X-Signature"),
                signaturePrefix: undefined,
                timestamp: undefined,
                payloadFormat: {
                    components: ["BODY"],
                    delimiter: "."
                }
            });
            const generator = new WebhooksHelperGenerator(verification);
            const context = createMockSdkContext();
            generator.writeToFile(context);
            const text = context.sourceFile.getFullText();
            expect(text).toContain('"sha1"');
            expect(text).toMatchSnapshot();
        });

        it("writes HMAC SHA384 algorithm variant", () => {
            const verification: FernIr.WebhookSignatureVerification = FernIr.WebhookSignatureVerification.hmac({
                algorithm: "SHA384",
                encoding: "BASE64",
                signatureHeaderName: createWireValue("X-Signature"),
                signaturePrefix: undefined,
                timestamp: undefined,
                payloadFormat: {
                    components: ["BODY"],
                    delimiter: "."
                }
            });
            const generator = new WebhooksHelperGenerator(verification);
            const context = createMockSdkContext();
            generator.writeToFile(context);
            const text = context.sourceFile.getFullText();
            expect(text).toContain('"sha384"');
            expect(text).toContain('"base64"');
        });

        it("uses custom class name", () => {
            const verification: FernIr.WebhookSignatureVerification = FernIr.WebhookSignatureVerification.hmac({
                algorithm: "SHA256",
                encoding: "HEX",
                signatureHeaderName: createWireValue("X-Signature"),
                signaturePrefix: undefined,
                timestamp: undefined,
                payloadFormat: {
                    components: ["BODY"],
                    delimiter: "."
                }
            });
            const generator = new WebhooksHelperGenerator(verification, "MyWebhookVerifier");
            const context = createMockSdkContext();
            generator.writeToFile(context);
            const text = context.sourceFile.getFullText();
            expect(text).toContain("class MyWebhookVerifier");
        });
    });

    // ────────────────────────────────────────────────────────────────────────
    // Asymmetric verification
    // ────────────────────────────────────────────────────────────────────────

    describe("asymmetric verification", () => {
        it("writes asymmetric RSA_SHA256 class with static key", () => {
            const verification: FernIr.WebhookSignatureVerification = FernIr.WebhookSignatureVerification.asymmetric({
                algorithm: "RSA_SHA256",
                encoding: "BASE64",
                signatureHeaderName: createWireValue("X-Signature"),
                signaturePrefix: undefined,
                timestamp: undefined,
                keySource: FernIr.AsymmetricKeySource.static({})
            });
            const generator = new WebhooksHelperGenerator(verification);
            const context = createMockSdkContext();
            generator.writeToFile(context);
            const text = context.sourceFile.getFullText();
            expect(text).toContain("publicKey");
            expect(text).toContain("verifyAsymmetricSignature");
            expect(text).toContain('"RSA_SHA256"');
            expect(text).toMatchSnapshot();
        });

        it("writes asymmetric class with JWKS key source", () => {
            const verification: FernIr.WebhookSignatureVerification = FernIr.WebhookSignatureVerification.asymmetric({
                algorithm: "RSA_SHA256",
                encoding: "BASE64",
                signatureHeaderName: createWireValue("X-Signature"),
                signaturePrefix: undefined,
                timestamp: undefined,
                keySource: FernIr.AsymmetricKeySource.jwks({
                    url: "https://example.com/.well-known/jwks.json",
                    keyIdHeader: undefined
                })
            });
            const generator = new WebhooksHelperGenerator(verification);
            const context = createMockSdkContext();
            generator.writeToFile(context);
            const text = context.sourceFile.getFullText();
            expect(text).toContain("fetchJwks");
            expect(text).toContain("resolvedKey");
            expect(text).toContain("https://example.com/.well-known/jwks.json");
            expect(text).toMatchSnapshot();
        });

        it("writes asymmetric class with JWKS key source and keyIdHeader", () => {
            const verification: FernIr.WebhookSignatureVerification = FernIr.WebhookSignatureVerification.asymmetric({
                algorithm: "RSA_SHA256",
                encoding: "BASE64",
                signatureHeaderName: createWireValue("X-Signature"),
                signaturePrefix: undefined,
                timestamp: undefined,
                keySource: FernIr.AsymmetricKeySource.jwks({
                    url: "https://example.com/.well-known/jwks.json",
                    keyIdHeader: createWireValue("X-Key-Id")
                })
            });
            const generator = new WebhooksHelperGenerator(verification);
            const context = createMockSdkContext();
            generator.writeToFile(context);
            const text = context.sourceFile.getFullText();
            expect(text).toContain("keyIdHeader");
            expect(text).toMatchSnapshot();
        });

        it("writes asymmetric class with timestamp validation", () => {
            const verification: FernIr.WebhookSignatureVerification = FernIr.WebhookSignatureVerification.asymmetric({
                algorithm: "ECDSA_SHA256",
                encoding: "BASE64",
                signatureHeaderName: createWireValue("X-Signature"),
                signaturePrefix: "v1=",
                timestamp: {
                    headerName: createWireValue("X-Timestamp"),
                    format: "UNIX_SECONDS",
                    tolerance: 300
                },
                keySource: FernIr.AsymmetricKeySource.static({})
            });
            const generator = new WebhooksHelperGenerator(verification);
            const context = createMockSdkContext();
            generator.writeToFile(context);
            const text = context.sourceFile.getFullText();
            expect(text).toContain("TIMESTAMP_TOLERANCE_SECONDS");
            expect(text).toContain("SIGNATURE_PREFIX");
            expect(text).toContain('"ECDSA_SHA256"');
            expect(text).toMatchSnapshot();
        });

        it("writes ED25519 algorithm variant", () => {
            const verification: FernIr.WebhookSignatureVerification = FernIr.WebhookSignatureVerification.asymmetric({
                algorithm: "ED25519",
                encoding: "HEX",
                signatureHeaderName: createWireValue("X-Signature"),
                signaturePrefix: undefined,
                timestamp: undefined,
                keySource: FernIr.AsymmetricKeySource.static({})
            });
            const generator = new WebhooksHelperGenerator(verification);
            const context = createMockSdkContext();
            generator.writeToFile(context);
            const text = context.sourceFile.getFullText();
            expect(text).toContain('"ED25519"');
            expect(text).toContain('"hex"');
        });
    });

    // ────────────────────────────────────────────────────────────────────────
    // JSDoc generation
    // ────────────────────────────────────────────────────────────────────────

    describe("JSDoc", () => {
        it("generates HMAC JSDoc with signature header name", () => {
            const verification: FernIr.WebhookSignatureVerification = FernIr.WebhookSignatureVerification.hmac({
                algorithm: "SHA256",
                encoding: "HEX",
                signatureHeaderName: createWireValue("X-My-Signature"),
                signaturePrefix: undefined,
                timestamp: undefined,
                payloadFormat: {
                    components: ["BODY"],
                    delimiter: "."
                }
            });
            const generator = new WebhooksHelperGenerator(verification);
            const context = createMockSdkContext();
            generator.writeToFile(context);
            const text = context.sourceFile.getFullText();
            expect(text).toContain("Verify an HMAC webhook signature");
            expect(text).toContain("X-My-Signature");
        });

        it("generates HMAC JSDoc with timestamp header name", () => {
            const verification: FernIr.WebhookSignatureVerification = FernIr.WebhookSignatureVerification.hmac({
                algorithm: "SHA256",
                encoding: "HEX",
                signatureHeaderName: createWireValue("X-Signature"),
                signaturePrefix: undefined,
                timestamp: {
                    headerName: createWireValue("X-Webhook-Timestamp"),
                    format: "UNIX_SECONDS",
                    tolerance: 300
                },
                payloadFormat: {
                    components: ["BODY"],
                    delimiter: "."
                }
            });
            const generator = new WebhooksHelperGenerator(verification);
            const context = createMockSdkContext();
            generator.writeToFile(context);
            const text = context.sourceFile.getFullText();
            expect(text).toContain("X-Webhook-Timestamp");
        });

        it("generates asymmetric JSDoc with JWKS info", () => {
            const verification: FernIr.WebhookSignatureVerification = FernIr.WebhookSignatureVerification.asymmetric({
                algorithm: "RSA_SHA256",
                encoding: "BASE64",
                signatureHeaderName: createWireValue("X-Signature"),
                signaturePrefix: undefined,
                timestamp: undefined,
                keySource: FernIr.AsymmetricKeySource.jwks({
                    url: "https://keys.example.com/jwks",
                    keyIdHeader: createWireValue("X-Key-Id")
                })
            });
            const generator = new WebhooksHelperGenerator(verification);
            const context = createMockSdkContext();
            generator.writeToFile(context);
            const text = context.sourceFile.getFullText();
            expect(text).toContain("Verify an asymmetric webhook signature");
            expect(text).toContain("https://keys.example.com/jwks");
            expect(text).toContain("X-Key-Id");
        });
    });
});
