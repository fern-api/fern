import { describe, expect, it } from "vitest";

import { SnippetsConfiguration } from "../DocsYmlSchemas.js";

describe("DocsYmlSchemas.SnippetsConfiguration", () => {
    it("keeps the cli snippet package", () => {
        expect(SnippetsConfiguration.parse({ cli: "twilio-cli" })).toEqual({ cli: "twilio-cli" });
    });

    it("keeps a versioned cli snippet configuration", () => {
        const cli = { package: "twilio-cli", version: "1.2.3" };
        expect(SnippetsConfiguration.parse({ cli })).toEqual({ cli });
    });
});
