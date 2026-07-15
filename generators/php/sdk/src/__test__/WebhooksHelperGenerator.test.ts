import { FernIr } from "@fern-fern/ir-sdk";
import { describe, expect, it } from "vitest";

import { WebhooksHelperGenerator } from "../webhooks/WebhooksHelperGenerator.js";

describe("WebhooksHelperGenerator", () => {
    it("includes a timestamp parameter when the payload uses a timestamp without validation config", () => {
        const context = {
            ir: {
                webhookGroups: {
                    webhooks: [
                        {
                            name: "event",
                            signatureVerification: FernIr.WebhookSignatureVerification.hmac({
                                signatureHeaderName: "x-webhook-signature",
                                algorithm: "SHA256",
                                encoding: "HEX",
                                signaturePrefix: undefined,
                                payloadFormat: {
                                    components: ["TIMESTAMP", "BODY"],
                                    delimiter: ".",
                                    bodySort: undefined
                                },
                                timestamp: undefined,
                                bodyHashBinding: undefined
                            })
                        }
                    ]
                }
            },
            customConfig: {},
            case: {
                pascalSafe: () => "Event"
            },
            getRootNamespace: () => "Seed",
            getCoreNamespace: () => "Seed\\Core"
        } satisfies ConstructorParameters<typeof WebhooksHelperGenerator>[0];

        const [file] = new WebhooksHelperGenerator(context).generate();
        const contents = file?.fileContents.toString();

        expect(contents).toContain("string|null $timestampHeader");
        expect(contents).toContain('$payload = implode(".", [$timestampHeader, $requestBody]);');
        expect(contents).not.toContain("Missing timestamp header");
    });

    it("emits a body-hash verification block before the HMAC check when bodyHashBinding is set", () => {
        const context = {
            ir: {
                webhookGroups: {
                    webhooks: [
                        {
                            name: "smsStatus",
                            signatureVerification: FernIr.WebhookSignatureVerification.hmac({
                                signatureHeaderName: "x-twilio-signature",
                                algorithm: "SHA1",
                                encoding: "BASE64",
                                signaturePrefix: undefined,
                                payloadFormat: {
                                    components: ["NOTIFICATION_URL"],
                                    delimiter: "",
                                    bodySort: undefined
                                },
                                timestamp: undefined,
                                bodyHashBinding: {
                                    algorithm: "SHA256",
                                    encoding: "HEX",
                                    location: FernIr.WebhookBodyHashLocation.queryParameter({ name: "bodySHA256" })
                                }
                            })
                        }
                    ]
                }
            },
            customConfig: {},
            case: {
                pascalSafe: () => "SmsStatus"
            },
            getRootNamespace: () => "Seed",
            getCoreNamespace: () => "Seed\\Core"
        } satisfies ConstructorParameters<typeof WebhooksHelperGenerator>[0];

        const [file] = new WebhooksHelperGenerator(context).generate();
        const contents = file?.fileContents.toString() ?? "";

        expect(contents).toContain('$expectedBodyHash = WebhookSignature::computeHash($requestBody, "sha256", "hex");');
        expect(contents).toContain(
            '$transmittedBodyHash = WebhookSignature::getWebhookQueryParameter($notificationUrl, "bodySHA256");'
        );
        expect(contents).toContain(
            "if ($transmittedBodyHash === null || !WebhookSignature::timingSafeEqual($transmittedBodyHash, $expectedBodyHash)) {"
        );
        // Body-hash check must fail closed BEFORE the HMAC comparison.
        const bodyHashIdx = contents.indexOf("$expectedBodyHash");
        const hmacIdx = contents.indexOf("::computeHmacSignature(");
        expect(bodyHashIdx).toBeGreaterThan(-1);
        expect(hmacIdx).toBeGreaterThan(bodyHashIdx);
    });

    it("does not emit a body-hash block when bodyHashBinding is absent", () => {
        const context = {
            ir: {
                webhookGroups: {
                    webhooks: [
                        {
                            name: "event",
                            signatureVerification: FernIr.WebhookSignatureVerification.hmac({
                                signatureHeaderName: "x-webhook-signature",
                                algorithm: "SHA256",
                                encoding: "HEX",
                                signaturePrefix: undefined,
                                payloadFormat: {
                                    components: ["BODY"],
                                    delimiter: "",
                                    bodySort: undefined
                                },
                                timestamp: undefined,
                                bodyHashBinding: undefined
                            })
                        }
                    ]
                }
            },
            customConfig: {},
            case: {
                pascalSafe: () => "Event"
            },
            getRootNamespace: () => "Seed",
            getCoreNamespace: () => "Seed\\Core"
        } satisfies ConstructorParameters<typeof WebhooksHelperGenerator>[0];

        const [file] = new WebhooksHelperGenerator(context).generate();
        const contents = file?.fileContents.toString() ?? "";

        expect(contents).not.toContain("computeHash");
        expect(contents).not.toContain("getWebhookQueryParameter");
    });
});
