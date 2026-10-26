import { docsYml } from "@fern-api/configuration";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { describe, expect, it } from "vitest";

import { parseDocsConfiguration } from "../parseDocsConfiguration.js";

async function parseApiSectionSnippets(
    snippets: Record<string, unknown>
): Promise<docsYml.DocsNavigationItem.SnippetsConfiguration | undefined> {
    const rawDocsConfiguration = docsYml.RawSchemas.Serializer.DocsConfiguration.parseOrThrow({
        instances: [],
        navigation: [{ api: "API reference", "api-name": "payments", snippets }]
    });
    const parsed = await parseDocsConfiguration({
        rawDocsConfiguration,
        absolutePathToFernFolder: AbsoluteFilePath.of("/repo/fern"),
        absoluteFilepathToDocsConfig: AbsoluteFilePath.of("/repo/fern/docs.yml"),
        context: createMockTaskContext()
    });
    if (parsed.navigation.type !== "untabbed" || parsed.navigation.items[0]?.type !== "apiSection") {
        throw new Error("Expected an API section");
    }
    return parsed.navigation.items[0].snippetsConfiguration;
}

describe("parseDocsConfiguration — api section snippets", () => {
    it("keeps the cli snippet package", async () => {
        const snippets = await parseApiSectionSnippets({ cli: "twilio-cli", python: "twilio_core" });
        expect(snippets?.cli).toBe("twilio-cli");
        expect(snippets?.python).toBe("twilio_core");
    });

    it("keeps a versioned cli snippet configuration", async () => {
        const snippets = await parseApiSectionSnippets({ cli: { package: "twilio-cli", version: "1.2.3" } });
        expect(snippets?.cli).toEqual({ package: "twilio-cli", version: "1.2.3" });
    });
});
