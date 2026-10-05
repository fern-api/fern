import { describe, expect, it } from "vitest";
import { mapDocsConfigToLedgerConfig } from "../mapDocsConfigToLedgerConfig.js";

describe("mapDocsConfigToLedgerConfig", () => {
    it("passes iframe.allowedParentOrigins through to the ledger config", () => {
        const ledgerConfig = mapDocsConfigToLedgerConfig({
            docsConfig: { iframe: { allowedParentOrigins: ["https://app.example.com"] } } as Parameters<
                typeof mapDocsConfigToLedgerConfig
            >[0]["docsConfig"],
            fileManifest: undefined,
            fileIdToPath: undefined
        });
        expect(ledgerConfig.iframe).toEqual({ allowedParentOrigins: ["https://app.example.com"] });
    });
});
