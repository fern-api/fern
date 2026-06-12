import { describe, expect, it } from "vitest";

import { buildWireTestSnippetsConfig } from "../sdk-wire-tests/buildWireTestSnippetsConfig.js";

describe("buildWireTestSnippetsConfig", () => {
    it("strips exported-client-class-name so wire-test snippets use the internal client", () => {
        const config = {
            organization: "acme",
            customConfig: {
                "client-class-name": "BaseAcme",
                "exported-client-class-name": "AcmeClient"
            }
        };

        const result = buildWireTestSnippetsConfig(config);

        expect(result.customConfig).toEqual({ "client-class-name": "BaseAcme" });
        // the original config must not be mutated
        expect(config.customConfig).toEqual({
            "client-class-name": "BaseAcme",
            "exported-client-class-name": "AcmeClient"
        });
    });

    it("returns the config unchanged when exported-client-class-name is not set", () => {
        const config = {
            organization: "acme",
            customConfig: { "client-class-name": "BaseAcme" }
        };

        const result = buildWireTestSnippetsConfig(config);

        expect(result.customConfig).toEqual({ "client-class-name": "BaseAcme" });
    });

    it("returns the config unchanged when customConfig is undefined", () => {
        const config = { organization: "acme", customConfig: undefined };

        const result = buildWireTestSnippetsConfig(config);

        expect(result).toBe(config);
    });

    it("returns the config unchanged when customConfig is not an object", () => {
        const config = { organization: "acme", customConfig: "not-an-object" };

        const result = buildWireTestSnippetsConfig(config);

        expect(result).toBe(config);
    });
});
