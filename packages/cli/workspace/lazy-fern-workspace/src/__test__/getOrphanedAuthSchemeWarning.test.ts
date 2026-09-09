import { generatorsYml } from "@fern-api/configuration";
import { describe, expect, it } from "vitest";
import { getOrphanedAuthSchemeWarning } from "../OSSWorkspace.js";

function api(partial: Partial<generatorsYml.SingleNamespaceAPIDefinition>): generatorsYml.APIDefinition {
    return {
        type: "singleNamespace",
        definitions: [],
        ...partial
    };
}

describe("getOrphanedAuthSchemeWarning", () => {
    it("warns when auth-schemes is declared without api.auth", () => {
        // The trap: valid YAML, clean `fern check`, generation succeeds, and
        // the entire auth-schemes block — env: overrides included — is
        // discarded before the importer reads it.
        const warning = getOrphanedAuthSchemeWarning(
            api({
                "auth-schemes": {
                    BearerAuth: { scheme: "bearer", token: { name: "apiKey", env: "ACME_API_KEY" } }
                }
            })
        );
        expect(warning).toBeDefined();
        // Names what is being dropped, so the user can match it to their file.
        expect(warning).toContain("BearerAuth");
        // States the consequence, not just the condition.
        expect(warning).toContain("ignored");
        expect(warning).toContain("env:");
        // Gives the fix inline — the whole point is that the user cannot see
        // the problem from the output alone.
        expect(warning).toContain("auth: BearerAuth");
    });

    it("stays silent when api.auth selects a scheme", () => {
        expect(
            getOrphanedAuthSchemeWarning(
                api({
                    auth: "BearerAuth",
                    "auth-schemes": { BearerAuth: { scheme: "bearer" } }
                })
            )
        ).toBeUndefined();
    });

    it("stays silent for the any: form, which is also a selection", () => {
        expect(
            getOrphanedAuthSchemeWarning(
                api({
                    auth: { any: ["BearerAuth", "TokenAuth"] },
                    "auth-schemes": { BearerAuth: { scheme: "bearer" }, TokenAuth: { scheme: "bearer" } }
                })
            )
        ).toBeUndefined();
    });

    it("stays silent when there are no auth-schemes to drop", () => {
        expect(getOrphanedAuthSchemeWarning(api({}))).toBeUndefined();
        expect(getOrphanedAuthSchemeWarning(api({ "auth-schemes": {} }))).toBeUndefined();
        expect(getOrphanedAuthSchemeWarning(undefined)).toBeUndefined();
    });

    it("suggests the any: form when several schemes are orphaned", () => {
        const warning = getOrphanedAuthSchemeWarning(
            api({
                "auth-schemes": { BearerAuth: { scheme: "bearer" }, TokenAuth: { scheme: "bearer" } }
            })
        );
        expect(warning).toContain("BearerAuth, TokenAuth");
        expect(warning).toContain("auth.any");
    });
});
