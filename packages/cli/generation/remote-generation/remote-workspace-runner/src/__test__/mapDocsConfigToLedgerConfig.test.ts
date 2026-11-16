import type { DocsV1Write } from "@fern-api/fdr-sdk";
import { describe, expect, it } from "vitest";

import { mapDeclaredRoles, mapDocsConfigToLedgerConfig } from "../mapDocsConfigToLedgerConfig";

function mapAgents(agents: Record<string, unknown>) {
    return mapDocsConfigToLedgerConfig({
        docsConfig: { agents } as unknown as DocsV1Write.DocsConfig,
        fileManifest: undefined,
        fileIdToPath: undefined
    }).agents as Record<string, unknown> | undefined;
}

describe("mapDocsConfigToLedgerConfig agents", () => {
    it("forwards robotsTxtOnInstanceUrl (experimental.robots-txt-on-instance-url)", () => {
        expect(mapAgents({ robotsTxt: "file-id", robotsTxtOnInstanceUrl: true })).toEqual({
            pageDirective: undefined,
            pageDescriptionSource: undefined,
            siteDescription: undefined,
            robotsTxtOnInstanceUrl: true
        });
    });

    it("omits robotsTxtOnInstanceUrl when unset", () => {
        expect(mapAgents({ siteDescription: "desc" })).not.toHaveProperty("robotsTxtOnInstanceUrl");
    });
});

describe("mapDocsConfigToLedgerConfig remotePaths", () => {
    it("forwards docs.yml remote-paths", () => {
        const remotePaths = [{ path: "/ui", destination: "https://portal.fernwood.example/ui" }];
        const ledger = mapDocsConfigToLedgerConfig({
            docsConfig: { remotePaths } as unknown as DocsV1Write.DocsConfig,
            fileManifest: undefined,
            fileIdToPath: undefined
        });
        expect(ledger.remotePaths).toEqual(remotePaths);
    });
});

describe("mapDeclaredRoles", () => {
    it("forwards docs.yml's declared roles", () => {
        expect(mapDeclaredRoles(["internal", "partner"])).toEqual(["internal", "partner"]);
    });

    it("omits roles when docs.yml declares none", () => {
        expect(mapDeclaredRoles(undefined)).toBeUndefined();
        expect(mapDeclaredRoles([])).toBeUndefined();
    });
});
