import { FernIr } from "@fern-fern/ir-sdk";
import { describe, expect, it } from "vitest";
import { ClientConfigGenerator } from "../generators/ClientConfigGenerator.js";
import { createSampleGeneratorContext } from "./util/createSampleGeneratorContext.js";

function generateClientConfig({
    userAgent,
    userAgentFromPlatformHeaders
}: {
    userAgent: FernIr.UserAgent | undefined;
    userAgentFromPlatformHeaders?: boolean;
}): string {
    const sdkConfig = {
        platformHeaders: {
            language: "X-Fern-Language",
            sdkName: "X-Fern-SDK-Name",
            sdkVersion: "X-Fern-SDK-Version",
            userAgent
        }
    } as FernIr.SdkConfig;
    const context = createSampleGeneratorContext({ sdkConfig, customConfig: { userAgentFromPlatformHeaders } });
    return new ClientConfigGenerator(context).generate().fileContents.toString();
}

const platformUserAgent: FernIr.UserAgent = { header: "User-Agent", value: "plant-sdk/1.2.3" };

describe("ClientConfig user agent", () => {
    it("uses the API name by default, even when the IR has a platform User-Agent", () => {
        const clientConfig = generateClientConfig({ userAgent: platformUserAgent });
        expect(clientConfig).toContain('user_agent: "TestAPI Rust SDK".to_string()');
    });

    it("uses the IR platform User-Agent when userAgentFromPlatformHeaders is enabled", () => {
        const clientConfig = generateClientConfig({ userAgent: platformUserAgent, userAgentFromPlatformHeaders: true });
        expect(clientConfig).toContain('user_agent: "plant-sdk/1.2.3".to_string()');
        expect(clientConfig).not.toContain("Rust SDK");
    });

    it("falls back to the API name when enabled but the IR has no platform User-Agent", () => {
        const clientConfig = generateClientConfig({ userAgent: undefined, userAgentFromPlatformHeaders: true });
        expect(clientConfig).toContain('user_agent: "TestAPI Rust SDK".to_string()');
    });
});
