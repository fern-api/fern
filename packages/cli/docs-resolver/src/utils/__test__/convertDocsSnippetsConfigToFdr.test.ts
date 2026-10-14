import { describe, expect, it } from "vitest";

import { convertDocsSnippetsConfigToFdr } from "../convertDocsSnippetsConfigToFdr.js";

describe("convertDocsSnippetsConfigToFdr", () => {
    it("maps the cli snippet language to cliSdk (object form)", () => {
        const result = convertDocsSnippetsConfigToFdr({ cli: { package: "@acme/cli", version: "1.2.3" } });
        expect(result.cliSdk).toEqual({ package: "@acme/cli", version: "1.2.3" });
    });

    it("maps the cli snippet language to cliSdk (string form, no version)", () => {
        const result = convertDocsSnippetsConfigToFdr({ cli: "@acme/cli" });
        expect(result.cliSdk).toEqual({ package: "@acme/cli", version: undefined });
    });

    it("leaves cliSdk undefined when no cli config is present", () => {
        const result = convertDocsSnippetsConfigToFdr({ python: "fern-acme" });
        expect(result.cliSdk).toBeUndefined();
        expect(result.pythonSdk).toEqual({ package: "fern-acme", version: undefined });
    });
});
