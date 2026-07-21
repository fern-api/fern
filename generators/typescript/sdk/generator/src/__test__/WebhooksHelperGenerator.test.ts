import { FernIr } from "@fern-fern/ir-sdk";
import { Project, ts } from "ts-morph";
import { describe, expect, it } from "vitest";

import { WebhooksHelperGenerator } from "../webhooks/WebhooksHelperGenerator.js";

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────

function createMockFileContext() {
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
                },
                computeHash: {
                    _invoke: (argsExpr: ts.Expression) =>
                        ts.factory.createCallExpression(
                            ts.factory.createPropertyAccessExpression(
                                ts.factory.createIdentifier("webhookCrypto"),
                                "computeHash"
                            ),
                            undefined,
                            [argsExpr]
                        )
                },
                getWebhookQueryParameter: {
                    _invoke: (url: ts.Expression, name: ts.Expression) =>
                        ts.factory.createCallExpression(
                            ts.factory.createPropertyAccessExpression(
                                ts.factory.createIdentifier("webhookCrypto"),
                                "getWebhookQueryParameter"
                            ),
                            undefined,
                            [url, name]
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
                bodyHashBinding: undefined,
                algorithm: "SHA256",
                encoding: "HEX",
                signatureHeaderName: createWireValue("X-Signature"),
                signaturePrefix: undefined,
                timestamp: undefined,
                payloadFormat: {
                    components: ["BODY"],
                    delimiter: ".",
                    bodySort: undefined
                }
            });
            const generator = new WebhooksHelperGenerator(verification);
            const context = createMockFileContext();
            generator.writeToFile(context);
            expect(context.sourceFile.getFullText()).toMatchSnapshot();
        });

        it("writes HMAC SHA512 class with base64 encoding", () => {
            const verification: FernIr.WebhookSignatureVerification = FernIr.WebhookSignatureVerification.hmac({
                bodyHashBinding: undefined,
                algorithm: "SHA512",
                encoding: "BASE64",
                signatureHeaderName: createWireValue("X-Webhook-Signature"),
                signaturePrefix: undefined,
                timestamp: undefined,
                payloadFormat: {
                    components: ["BODY"],
                    delimiter: ".",
                    bodySort: undefined
                }
            });
            const generator = new WebhooksHelperGenerator(verification);
            const context = createMockFileContext();
            generator.writeToFile(context);
            expect(context.sourceFile.getFullText()).toMatchSnapshot();
        });

        it("writes HMAC class with signature prefix", () => {
            const verification: FernIr.WebhookSignatureVerification = FernIr.WebhookSignatureVerification.hmac({
                bodyHashBinding: undefined,
                algorithm: "SHA256",
                encoding: "HEX",
                signatureHeaderName: createWireValue("X-Signature"),
                signaturePrefix: "sha256=",
                timestamp: undefined,
                payloadFormat: {
                    components: ["BODY"],
                    delimiter: ".",
                    bodySort: undefined
                }
            });
            const generator = new WebhooksHelperGenerator(verification);
            const context = createMockFileContext();
            generator.writeToFile(context);
            const text = context.sourceFile.getFullText();
            expect(text).toContain("SIGNATURE_PREFIX");
            expect(text).toContain("sha256=");
            expect(text).toMatchSnapshot();
        });

        it("writes HMAC class with UNIX_SECONDS timestamp validation", () => {
            const verification: FernIr.WebhookSignatureVerification = FernIr.WebhookSignatureVerification.hmac({
                bodyHashBinding: undefined,
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
                    delimiter: ".",
                    bodySort: undefined
                }
            });
            const generator = new WebhooksHelperGenerator(verification);
            const context = createMockFileContext();
            generator.writeToFile(context);
            const text = context.sourceFile.getFullText();
            expect(text).toContain("TIMESTAMP_TOLERANCE_SECONDS");
            expect(text).toContain("timestampValue * 1000");
            expect(text).toMatchSnapshot();
        });

        it("writes HMAC class with UNIX_MILLIS timestamp format", () => {
            const verification: FernIr.WebhookSignatureVerification = FernIr.WebhookSignatureVerification.hmac({
                bodyHashBinding: undefined,
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
                    delimiter: ".",
                    bodySort: undefined
                }
            });
            const generator = new WebhooksHelperGenerator(verification);
            const context = createMockFileContext();
            generator.writeToFile(context);
            const text = context.sourceFile.getFullText();
            expect(text).toContain("const timestampMs = timestampValue;");
            expect(text).toMatchSnapshot();
        });

        it("writes HMAC class with ISO8601 timestamp format", () => {
            const verification: FernIr.WebhookSignatureVerification = FernIr.WebhookSignatureVerification.hmac({
                bodyHashBinding: undefined,
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
                    delimiter: ".",
                    bodySort: undefined
                }
            });
            const generator = new WebhooksHelperGenerator(verification);
            const context = createMockFileContext();
            generator.writeToFile(context);
            const text = context.sourceFile.getFullText();
            expect(text).toContain("new Date(timestampHeader).getTime()");
            expect(text).toMatchSnapshot();
        });

        it("writes HMAC class with multi-component payload format", () => {
            const verification: FernIr.WebhookSignatureVerification = FernIr.WebhookSignatureVerification.hmac({
                bodyHashBinding: undefined,
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
                    delimiter: ".",
                    bodySort: undefined
                }
            });
            const generator = new WebhooksHelperGenerator(verification);
            const context = createMockFileContext();
            generator.writeToFile(context);
            const text = context.sourceFile.getFullText();
            expect(text).toContain("messageId");
            expect(text).toContain('[messageId, timestampHeader, requestBody].join(".")');
            expect(text).toMatchSnapshot();
        });

        it("writes HMAC class with NOTIFICATION_URL payload component", () => {
            const verification: FernIr.WebhookSignatureVerification = FernIr.WebhookSignatureVerification.hmac({
                bodyHashBinding: undefined,
                algorithm: "SHA256",
                encoding: "HEX",
                signatureHeaderName: createWireValue("X-Signature"),
                signaturePrefix: undefined,
                timestamp: undefined,
                payloadFormat: {
                    components: ["NOTIFICATION_URL", "BODY"],
                    delimiter: "|",
                    bodySort: undefined
                }
            });
            const generator = new WebhooksHelperGenerator(verification);
            const context = createMockFileContext();
            generator.writeToFile(context);
            const text = context.sourceFile.getFullText();
            expect(text).toContain("notificationUrl");
            expect(text).toContain('[notificationUrl, requestBody].join("|")');
            expect(text).toMatchSnapshot();
        });

        it("writes HMAC SHA1 algorithm variant", () => {
            const verification: FernIr.WebhookSignatureVerification = FernIr.WebhookSignatureVerification.hmac({
                bodyHashBinding: undefined,
                algorithm: "SHA1",
                encoding: "HEX",
                signatureHeaderName: createWireValue("X-Signature"),
                signaturePrefix: undefined,
                timestamp: undefined,
                payloadFormat: {
                    components: ["BODY"],
                    delimiter: ".",
                    bodySort: undefined
                }
            });
            const generator = new WebhooksHelperGenerator(verification);
            const context = createMockFileContext();
            generator.writeToFile(context);
            const text = context.sourceFile.getFullText();
            expect(text).toContain('"sha1"');
            expect(text).toMatchSnapshot();
        });

        it("writes HMAC SHA384 algorithm variant", () => {
            const verification: FernIr.WebhookSignatureVerification = FernIr.WebhookSignatureVerification.hmac({
                bodyHashBinding: undefined,
                algorithm: "SHA384",
                encoding: "BASE64",
                signatureHeaderName: createWireValue("X-Signature"),
                signaturePrefix: undefined,
                timestamp: undefined,
                payloadFormat: {
                    components: ["BODY"],
                    delimiter: ".",
                    bodySort: undefined
                }
            });
            const generator = new WebhooksHelperGenerator(verification);
            const context = createMockFileContext();
            generator.writeToFile(context);
            const text = context.sourceFile.getFullText();
            expect(text).toContain('"sha384"');
            expect(text).toContain('"base64"');
        });

        it("uses custom class name", () => {
            const verification: FernIr.WebhookSignatureVerification = FernIr.WebhookSignatureVerification.hmac({
                bodyHashBinding: undefined,
                algorithm: "SHA256",
                encoding: "HEX",
                signatureHeaderName: createWireValue("X-Signature"),
                signaturePrefix: undefined,
                timestamp: undefined,
                payloadFormat: {
                    components: ["BODY"],
                    delimiter: ".",
                    bodySort: undefined
                }
            });
            const generator = new WebhooksHelperGenerator(verification, "MyWebhookVerifier");
            const context = createMockFileContext();
            generator.writeToFile(context);
            const text = context.sourceFile.getFullText();
            expect(text).toContain("class MyWebhookVerifier");
        });

        it("writes HMAC class with ALPHABETICAL bodySort and BODY-only payload", () => {
            const verification: FernIr.WebhookSignatureVerification = FernIr.WebhookSignatureVerification.hmac({
                bodyHashBinding: undefined,
                algorithm: "SHA1",
                encoding: "BASE64",
                signatureHeaderName: createWireValue("X-Webhook-Signature"),
                signaturePrefix: undefined,
                timestamp: undefined,
                payloadFormat: {
                    components: ["BODY"],
                    delimiter: "",
                    bodySort: "ALPHABETICAL"
                }
            });
            const generator = new WebhooksHelperGenerator(verification);
            const context = createMockFileContext();
            generator.writeToFile(context);
            const text = context.sourceFile.getFullText();
            expect(text).toContain("string | Record<string, string | string[]>");
            expect(text).toContain('typeof requestBody === "string"');
            expect(text).toContain("Object.keys(requestBody)");
            expect(text).toContain("Array.from(new Set(values))");
            expect(text).toContain("const payload = bodyString;");
            expect(text).toMatchSnapshot();
        });

        it("writes HMAC class with ALPHABETICAL bodySort and NOTIFICATION_URL + BODY payload", () => {
            const verification: FernIr.WebhookSignatureVerification = FernIr.WebhookSignatureVerification.hmac({
                bodyHashBinding: undefined,
                algorithm: "SHA1",
                encoding: "BASE64",
                signatureHeaderName: createWireValue("X-Webhook-Signature"),
                signaturePrefix: undefined,
                timestamp: undefined,
                payloadFormat: {
                    components: ["NOTIFICATION_URL", "BODY"],
                    delimiter: "",
                    bodySort: "ALPHABETICAL"
                }
            });
            const generator = new WebhooksHelperGenerator(verification);
            const context = createMockFileContext();
            generator.writeToFile(context);
            const text = context.sourceFile.getFullText();
            expect(text).toContain("string | Record<string, string | string[]>");
            expect(text).toContain("notificationUrl: string");
            expect(text).toContain('typeof requestBody === "string"');
            expect(text).toContain("Object.keys(requestBody)");
            expect(text).toContain("Array.from(new Set(values))");
            expect(text).toContain('[notificationUrl, bodyString].join("")');
            expect(text).toMatchSnapshot();
        });

        it("generates JSDoc with bodySort documentation", () => {
            const verification: FernIr.WebhookSignatureVerification = FernIr.WebhookSignatureVerification.hmac({
                bodyHashBinding: undefined,
                algorithm: "SHA1",
                encoding: "BASE64",
                signatureHeaderName: createWireValue("X-Webhook-Signature"),
                signaturePrefix: undefined,
                timestamp: undefined,
                payloadFormat: {
                    components: ["NOTIFICATION_URL", "BODY"],
                    delimiter: "",
                    bodySort: "ALPHABETICAL"
                }
            });
            const generator = new WebhooksHelperGenerator(verification);
            const context = createMockFileContext();
            generator.writeToFile(context);
            const text = context.sourceFile.getFullText();
            expect(text).toContain("Record<string, string | string[]> of POST body parameters");
            expect(text).toContain("keys are sorted and each key's values are deduped and sorted");
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
                keySource: FernIr.AsymmetricKeySource.static({}),
                payloadFormat: undefined
            });
            const generator = new WebhooksHelperGenerator(verification);
            const context = createMockFileContext();
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
                }),
                payloadFormat: undefined
            });
            const generator = new WebhooksHelperGenerator(verification);
            const context = createMockFileContext();
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
                }),
                payloadFormat: undefined
            });
            const generator = new WebhooksHelperGenerator(verification);
            const context = createMockFileContext();
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
                keySource: FernIr.AsymmetricKeySource.static({}),
                payloadFormat: undefined
            });
            const generator = new WebhooksHelperGenerator(verification);
            const context = createMockFileContext();
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
                keySource: FernIr.AsymmetricKeySource.static({}),
                payloadFormat: undefined
            });
            const generator = new WebhooksHelperGenerator(verification);
            const context = createMockFileContext();
            generator.writeToFile(context);
            const text = context.sourceFile.getFullText();
            expect(text).toContain('"ED25519"');
            expect(text).toContain('"hex"');
        });

        it("writes asymmetric class with multi-component payload format including TIMESTAMP", () => {
            const verification: FernIr.WebhookSignatureVerification = FernIr.WebhookSignatureVerification.asymmetric({
                algorithm: "RSA_SHA256",
                encoding: "BASE64",
                signatureHeaderName: createWireValue("X-Signature"),
                signaturePrefix: undefined,
                timestamp: {
                    headerName: createWireValue("X-Timestamp"),
                    format: "UNIX_SECONDS",
                    tolerance: 300
                },
                keySource: FernIr.AsymmetricKeySource.static({}),
                payloadFormat: {
                    components: ["MESSAGE_ID", "TIMESTAMP", "BODY"],
                    delimiter: ".",
                    bodySort: undefined
                }
            });
            const generator = new WebhooksHelperGenerator(verification);
            const context = createMockFileContext();
            generator.writeToFile(context);
            const text = context.sourceFile.getFullText();
            expect(text).toContain("messageId");
            expect(text).toContain('[messageId, timestampHeader, requestBody].join(".")');
            expect(text).toContain("TIMESTAMP_TOLERANCE_SECONDS");
            expect(text).not.toContain("const payload = requestBody;");
            expect(text).toMatchSnapshot();
        });

        it("writes asymmetric class with BODY-only payload format", () => {
            const verification: FernIr.WebhookSignatureVerification = FernIr.WebhookSignatureVerification.asymmetric({
                algorithm: "RSA_SHA256",
                encoding: "BASE64",
                signatureHeaderName: createWireValue("X-Signature"),
                signaturePrefix: undefined,
                timestamp: undefined,
                keySource: FernIr.AsymmetricKeySource.static({}),
                payloadFormat: {
                    components: ["BODY"],
                    delimiter: ".",
                    bodySort: undefined
                }
            });
            const generator = new WebhooksHelperGenerator(verification);
            const context = createMockFileContext();
            generator.writeToFile(context);
            const text = context.sourceFile.getFullText();
            expect(text).toContain("const payload = requestBody;");
            expect(text).toMatchSnapshot();
        });

        it("writes asymmetric class with NOTIFICATION_URL payload component", () => {
            const verification: FernIr.WebhookSignatureVerification = FernIr.WebhookSignatureVerification.asymmetric({
                algorithm: "ECDSA_SHA256",
                encoding: "BASE64",
                signatureHeaderName: createWireValue("X-Signature"),
                signaturePrefix: undefined,
                timestamp: undefined,
                keySource: FernIr.AsymmetricKeySource.jwks({
                    url: "https://example.com/.well-known/jwks.json",
                    keyIdHeader: undefined
                }),
                payloadFormat: {
                    components: ["NOTIFICATION_URL", "BODY"],
                    delimiter: "|",
                    bodySort: undefined
                }
            });
            const generator = new WebhooksHelperGenerator(verification);
            const context = createMockFileContext();
            generator.writeToFile(context);
            const text = context.sourceFile.getFullText();
            expect(text).toContain("notificationUrl");
            expect(text).toContain('[notificationUrl, requestBody].join("|")');
            expect(text).toMatchSnapshot();
        });

        it("writes asymmetric class with ALPHABETICAL bodySort", () => {
            const verification: FernIr.WebhookSignatureVerification = FernIr.WebhookSignatureVerification.asymmetric({
                algorithm: "RSA_SHA256",
                encoding: "BASE64",
                signatureHeaderName: createWireValue("X-Signature"),
                signaturePrefix: undefined,
                timestamp: undefined,
                keySource: FernIr.AsymmetricKeySource.static({}),
                payloadFormat: {
                    components: ["BODY"],
                    delimiter: "",
                    bodySort: "ALPHABETICAL"
                }
            });
            const generator = new WebhooksHelperGenerator(verification);
            const context = createMockFileContext();
            generator.writeToFile(context);
            const text = context.sourceFile.getFullText();
            expect(text).toContain("string | Record<string, string | string[]>");
            expect(text).toContain('typeof requestBody === "string"');
            expect(text).toContain("Object.keys(requestBody)");
            expect(text).toContain("Array.from(new Set(values))");
            expect(text).toMatchSnapshot();
        });
    });

    // ────────────────────────────────────────────────────────────────────────
    // JSDoc generation
    // ────────────────────────────────────────────────────────────────────────

    describe("JSDoc", () => {
        it("generates HMAC JSDoc with signature header name", () => {
            const verification: FernIr.WebhookSignatureVerification = FernIr.WebhookSignatureVerification.hmac({
                bodyHashBinding: undefined,
                algorithm: "SHA256",
                encoding: "HEX",
                signatureHeaderName: createWireValue("X-My-Signature"),
                signaturePrefix: undefined,
                timestamp: undefined,
                payloadFormat: {
                    components: ["BODY"],
                    delimiter: ".",
                    bodySort: undefined
                }
            });
            const generator = new WebhooksHelperGenerator(verification);
            const context = createMockFileContext();
            generator.writeToFile(context);
            const text = context.sourceFile.getFullText();
            expect(text).toContain("Verify an HMAC webhook signature");
            expect(text).toContain("X-My-Signature");
        });

        it("generates HMAC JSDoc with timestamp header name", () => {
            const verification: FernIr.WebhookSignatureVerification = FernIr.WebhookSignatureVerification.hmac({
                bodyHashBinding: undefined,
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
                    delimiter: ".",
                    bodySort: undefined
                }
            });
            const generator = new WebhooksHelperGenerator(verification);
            const context = createMockFileContext();
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
                }),
                payloadFormat: undefined
            });
            const generator = new WebhooksHelperGenerator(verification);
            const context = createMockFileContext();
            generator.writeToFile(context);
            const text = context.sourceFile.getFullText();
            expect(text).toContain("Verify an asymmetric webhook signature");
            expect(text).toContain("https://keys.example.com/jwks");
            expect(text).toContain("X-Key-Id");
        });
    });

    // ────────────────────────────────────────────────────────────────────────
    // Body-hash binding (Twilio JSON bodySHA256)
    // ────────────────────────────────────────────────────────────────────────

    describe("body-hash binding", () => {
        function twilioStyleVerification(): FernIr.WebhookSignatureVerification {
            return FernIr.WebhookSignatureVerification.hmac({
                bodyHashBinding: {
                    algorithm: "SHA256",
                    encoding: "HEX",
                    location: FernIr.WebhookBodyHashLocation.queryParameter({ name: "bodySHA256" })
                },
                algorithm: "SHA1",
                encoding: "BASE64",
                signatureHeaderName: createWireValue("X-Twilio-Signature"),
                signaturePrefix: undefined,
                timestamp: undefined,
                payloadFormat: {
                    components: ["NOTIFICATION_URL"],
                    delimiter: "",
                    bodySort: undefined
                }
            });
        }

        it("computes a body hash and compares it to the transmitted query parameter before HMAC", () => {
            const generator = new WebhooksHelperGenerator(twilioStyleVerification());
            const context = createMockFileContext();
            generator.writeToFile(context);
            const text = context.sourceFile.getFullText();

            // hashes the raw body (unkeyed) with the binding's own algorithm/encoding
            expect(text).toContain("expectedBodyHash");
            expect(text).toContain("webhookCrypto.computeHash");
            // extracts the transmitted hash from the notification URL verbatim
            expect(text).toContain("transmittedBodyHash");
            expect(text).toContain('webhookCrypto.getWebhookQueryParameter(notificationUrl, "bodySHA256")');
            // branches at runtime on the presence of the body-hash query parameter
            expect(text).toContain("if (transmittedBodyHash != null)");
            // JSON path signs the notification URL only
            expect(text).toContain("payload = notificationUrl;");
            // fails closed on a body-hash mismatch, before HMAC
            expect(text).toContain("return false;");
            // outer HMAC (SHA1/base64 over the URL) is still emitted
            expect(text).toContain("webhookCrypto.computeHmacSignature");
            expect(text).toMatchSnapshot();
        });

        it("uses the body-hash algorithm/encoding independently of the outer HMAC's", () => {
            const generator = new WebhooksHelperGenerator(twilioStyleVerification());
            const context = createMockFileContext();
            generator.writeToFile(context);
            const text = context.sourceFile.getFullText();
            // body hash is sha256/hex; outer HMAC is sha1/base64
            expect(text).toContain('"sha256"');
            expect(text).toContain('"hex"');
            expect(text).toContain('"sha1"');
            expect(text).toContain('"base64"');
        });

        it("does not emit body-hash logic when no binding is configured", () => {
            const verification: FernIr.WebhookSignatureVerification = FernIr.WebhookSignatureVerification.hmac({
                bodyHashBinding: undefined,
                algorithm: "SHA256",
                encoding: "HEX",
                signatureHeaderName: createWireValue("X-Signature"),
                signaturePrefix: undefined,
                timestamp: undefined,
                payloadFormat: {
                    components: ["BODY"],
                    delimiter: ".",
                    bodySort: undefined
                }
            });
            const generator = new WebhooksHelperGenerator(verification);
            const context = createMockFileContext();
            generator.writeToFile(context);
            const text = context.sourceFile.getFullText();
            expect(text).not.toContain("transmittedBodyHash");
            expect(text).not.toContain("computeHash");
        });
    });

    // ────────────────────────────────────────────────────────────────────────
    // Multi-value form parameters (dedup + independent value sort)
    // ────────────────────────────────────────────────────────────────────────

    describe("multi-value form parameters", () => {
        it("emits sorted(unique(keys)) with per-key sorted(unique(values)) assembly", () => {
            const verification: FernIr.WebhookSignatureVerification = FernIr.WebhookSignatureVerification.hmac({
                bodyHashBinding: undefined,
                algorithm: "SHA1",
                encoding: "BASE64",
                signatureHeaderName: createWireValue("X-Webhook-Signature"),
                signaturePrefix: undefined,
                timestamp: undefined,
                payloadFormat: {
                    components: ["NOTIFICATION_URL", "BODY"],
                    delimiter: "",
                    bodySort: "ALPHABETICAL"
                }
            });
            const generator = new WebhooksHelperGenerator(verification);
            const context = createMockFileContext();
            generator.writeToFile(context);
            const text = context.sourceFile.getFullText();
            // request body accepts repeated params
            expect(text).toContain("string | Record<string, string | string[]>");
            // keys are sorted; each value coerced to an array, deduped, sorted, then key+value
            expect(text).toContain("Object.keys(requestBody)");
            expect(text).toContain("const value = requestBody[key];");
            expect(text).toContain("const values = Array.isArray(value) ? value : [value];");
            expect(text).toContain("Array.from(new Set(values))");
            expect(text).toContain(".map((v) => key + v)");
            expect(text).toContain('[notificationUrl, bodyString].join("")');
            expect(text).toMatchSnapshot();
        });

        it("still passes a raw string body through unchanged", () => {
            const verification: FernIr.WebhookSignatureVerification = FernIr.WebhookSignatureVerification.hmac({
                bodyHashBinding: undefined,
                algorithm: "SHA1",
                encoding: "BASE64",
                signatureHeaderName: createWireValue("X-Webhook-Signature"),
                signaturePrefix: undefined,
                timestamp: undefined,
                payloadFormat: {
                    components: ["BODY"],
                    delimiter: "",
                    bodySort: "ALPHABETICAL"
                }
            });
            const generator = new WebhooksHelperGenerator(verification);
            const context = createMockFileContext();
            generator.writeToFile(context);
            const text = context.sourceFile.getFullText();
            expect(text).toContain('typeof requestBody === "string"');
            expect(text).toContain("? requestBody");
        });
    });

    // ────────────────────────────────────────────────────────────────────────
    // Runtime body-hash branch (classic form vs JSON request)
    // ────────────────────────────────────────────────────────────────────────

    describe("runtime body-hash branch", () => {
        function twilioDualPathVerification(): FernIr.WebhookSignatureVerification {
            return FernIr.WebhookSignatureVerification.hmac({
                bodyHashBinding: {
                    algorithm: "SHA256",
                    encoding: "HEX",
                    location: FernIr.WebhookBodyHashLocation.queryParameter({ name: "bodySHA256" })
                },
                algorithm: "SHA1",
                encoding: "BASE64",
                signatureHeaderName: createWireValue("X-Twilio-Signature"),
                signaturePrefix: undefined,
                timestamp: undefined,
                payloadFormat: {
                    components: ["NOTIFICATION_URL", "BODY"],
                    delimiter: "",
                    bodySort: "ALPHABETICAL"
                }
            });
        }

        it("branches on the body-hash query parameter: JSON signs the URL only, form signs URL + params", () => {
            const generator = new WebhooksHelperGenerator(twilioDualPathVerification());
            const context = createMockFileContext();
            generator.writeToFile(context);
            const text = context.sourceFile.getFullText();

            // runtime branch on presence of the transmitted hash
            expect(text).toContain('webhookCrypto.getWebhookQueryParameter(notificationUrl, "bodySHA256")');
            expect(text).toContain("if (transmittedBodyHash != null)");
            expect(text).toContain("let payload: string;");
            // JSON path: hash the raw body (narrowed to string) and sign the URL only
            expect(text).toContain("requestBody as string");
            expect(text).toContain("payload = notificationUrl;");
            // form path: URL + sorted/deduped params
            expect(text).toContain("Array.from(new Set(values))");
            expect(text).toContain('payload = [notificationUrl, bodyString].join("")');
            expect(text).toMatchSnapshot();
        });
    });

    // ────────────────────────────────────────────────────────────────────────
    // No-throw: a verification helper returns false rather than raising
    // ────────────────────────────────────────────────────────────────────────

    describe("no-throw behavior", () => {
        it("returns false (never throws) on missing inputs or an invalid timestamp header", () => {
            const verification: FernIr.WebhookSignatureVerification = FernIr.WebhookSignatureVerification.hmac({
                bodyHashBinding: undefined,
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
                    delimiter: ".",
                    bodySort: undefined
                }
            });
            const generator = new WebhooksHelperGenerator(verification);
            const context = createMockFileContext();
            generator.writeToFile(context);
            const text = context.sourceFile.getFullText();
            // the HMAC verification path never throws
            expect(text).not.toContain("throw new Error");
            // null-arg guard and timestamp guards fail closed
            expect(text).toContain("if (requestBody == null || signatureHeader == null || signatureKey == null)");
            expect(text).toContain("return false;");
        });

        it("does not throw in the asymmetric null-arg guard", () => {
            const verification: FernIr.WebhookSignatureVerification = FernIr.WebhookSignatureVerification.asymmetric({
                algorithm: "RSA_SHA256",
                encoding: "BASE64",
                signatureHeaderName: createWireValue("X-Signature"),
                signaturePrefix: undefined,
                timestamp: undefined,
                keySource: FernIr.AsymmetricKeySource.static({}),
                payloadFormat: undefined
            });
            const generator = new WebhooksHelperGenerator(verification);
            const context = createMockFileContext();
            generator.writeToFile(context);
            const text = context.sourceFile.getFullText();
            expect(text).not.toContain("throw new Error");
            expect(text).toContain("return false;");
        });
    });
});
