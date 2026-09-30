import { FernIr } from "@fern-fern/ir-sdk";
import { describe, expect, it } from "vitest";
import { ClientConfigGenerator } from "../generators/ClientConfigGenerator.js";
import { createSampleGeneratorContext } from "./util/createSampleGeneratorContext.js";

function generateClientConfig(userAgent: FernIr.UserAgent | undefined): string {
    const sdkConfig = {
        platformHeaders: {
            language: "X-Fern-Language",
            sdkName: "X-Fern-SDK-Name",
            sdkVersion: "X-Fern-SDK-Version",
            userAgent
        }
    } as FernIr.SdkConfig;
    return new ClientConfigGenerator(createSampleGeneratorContext({ sdkConfig })).generate().fileContents.toString();
}

describe("ClientConfig user agent", () => {
    it("uses the platform User-Agent value from the IR", () => {
        const clientConfig = generateClientConfig({ header: "User-Agent", value: "plant-sdk/1.2.3" });
        expect(clientConfig).toContain('user_agent: "plant-sdk/1.2.3".to_string()');
        expect(clientConfig).not.toContain("Rust SDK");
    });

    it("falls back to the API name when the IR has no platform User-Agent", () => {
        const clientConfig = generateClientConfig(undefined);
        expect(clientConfig).toContain('user_agent: "TestAPI Rust SDK".to_string()');
    });
});
