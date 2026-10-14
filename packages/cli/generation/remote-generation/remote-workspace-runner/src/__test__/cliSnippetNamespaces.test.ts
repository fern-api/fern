import { dynamic } from "@fern-api/ir-sdk";
import { describe, expect, it } from "vitest";

import { getCliSnippetNamespaces, withCliSnippetNamespaces } from "../publishDocs.js";

const baseConfig: dynamic.GeneratorConfig = {
    apiName: "major",
    organization: "twilio",
    customConfig: { binaryName: "twilio-cli" },
    outputConfig: dynamic.GeneratorOutputConfig.local()
};

describe("getCliSnippetNamespaces", () => {
    it("keys each generators.yml namespace by its camelCased fernFilepath part", () => {
        expect(
            getCliSnippetNamespaces([
                { namespace: "addresses" },
                { namespace: "messaging/bulk-messages" },
                { namespace: "push-notifications" },
                {}
            ])
        ).toEqual({
            addresses: "addresses",
            messagingBulkMessages: "messaging/bulk-messages",
            pushNotifications: "push-notifications"
        });
    });

    it("returns undefined when no spec is namespaced", () => {
        expect(getCliSnippetNamespaces([{}, { namespace: "" }])).toBeUndefined();
    });
});

describe("withCliSnippetNamespaces", () => {
    const namespaces = { messagingBulkMessages: "messaging/bulk-messages" };

    it("adds namespaces to the cli custom config, keeping existing keys", () => {
        expect(
            withCliSnippetNamespaces({ dynamicGeneratorConfig: baseConfig, language: "cli", namespaces })?.customConfig
        ).toEqual({ binaryName: "twilio-cli", namespaces });
    });

    it("leaves other languages unchanged", () => {
        expect(withCliSnippetNamespaces({ dynamicGeneratorConfig: baseConfig, language: "python", namespaces })).toBe(
            baseConfig
        );
    });

    it("leaves the config unchanged without namespaces", () => {
        expect(
            withCliSnippetNamespaces({ dynamicGeneratorConfig: baseConfig, language: "cli", namespaces: undefined })
        ).toBe(baseConfig);
    });
});
