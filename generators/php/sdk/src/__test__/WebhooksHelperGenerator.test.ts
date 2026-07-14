import { FernIr } from "@fern-fern/ir-sdk";
import { describe, expect, it } from "vitest";

import { SdkGeneratorContext } from "../SdkGeneratorContext.js";
import { WebhooksHelperGenerator } from "../webhooks/WebhooksHelperGenerator.js";

describe("WebhooksHelperGenerator", () => {
    it("includes a timestamp parameter when the payload uses a timestamp without validation config", () => {
        const context = {
            ir: {
                webhookGroups: {
                    webhooks: [
                        {
                            name: "event",
                            signatureVerification: {
                                type: "hmac",
                                signatureHeaderName: "x-webhook-signature",
                                algorithm: "SHA256",
                                encoding: "HEX",
                                signaturePrefix: undefined,
                                payloadFormat: {
                                    components: ["TIMESTAMP", "BODY"],
                                    delimiter: ".",
                                    bodySort: undefined
                                },
                                timestamp: undefined
                            }
                        }
                    ]
                }
            } as unknown as FernIr.IntermediateRepresentation,
            customConfig: {},
            getRootNamespace: () => "Seed",
            getCoreNamespace: () => "Seed\\Core"
        } as unknown as SdkGeneratorContext;

        const [file] = new WebhooksHelperGenerator(context).generate();
        const contents = file?.fileContents.toString();

        expect(contents).toContain("string|null $timestampHeader");
        expect(contents).toContain('$payload = implode(".", [$timestampHeader, $requestBody]);');
        expect(contents).not.toContain("Missing timestamp header");
    });
});
