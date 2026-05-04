import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadAPIWorkspace } from "@fern-api/workspace-loader";
import { OpenAPI } from "openapi-types";

import { Rule, RuleContext } from "../Rule.js";
import { runRulesOnOSSWorkspace } from "../validateOSSWorkspace.js";

describe("preloadOpenAPIDocuments", () => {
    it("should pass the same loadedDocuments map to every rule", async () => {
        const context = createMockTaskContext();
        const result = await loadAPIWorkspace({
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("simple-openapi")
            ),
            context,
            cliVersion: "0.0.0",
            workspaceName: undefined
        });

        if (!result.didSucceed) {
            throw new Error("API workspace failed to load");
        }
        if (!(result.workspace instanceof OSSWorkspace)) {
            throw new Error("Expected an OSS workspace");
        }

        const capturedMaps: Array<Map<string, OpenAPI.Document>> = [];

        const spyRule: Rule = {
            name: "spy-rule",
            run: async ({ loadedDocuments }: RuleContext) => {
                capturedMaps.push(loadedDocuments);
                return [];
            }
        };

        await runRulesOnOSSWorkspace({
            workspace: result.workspace as OSSWorkspace,
            context,
            rules: [spyRule, spyRule, spyRule]
        });

        // All three rule invocations should receive the exact same Map instance
        expect(capturedMaps).toHaveLength(3);
        expect(capturedMaps[0]).toBe(capturedMaps[1]);
        expect(capturedMaps[1]).toBe(capturedMaps[2]);
    }, 30_000);

    it("should pre-load OpenAPI documents into loadedDocuments", async () => {
        const context = createMockTaskContext();
        const result = await loadAPIWorkspace({
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("simple-openapi")
            ),
            context,
            cliVersion: "0.0.0",
            workspaceName: undefined
        });

        if (!result.didSucceed) {
            throw new Error("API workspace failed to load");
        }
        if (!(result.workspace instanceof OSSWorkspace)) {
            throw new Error("Expected an OSS workspace");
        }

        let capturedDocs: Map<string, OpenAPI.Document> | undefined;

        const inspectRule: Rule = {
            name: "inspect-rule",
            run: async ({ loadedDocuments, specs }: RuleContext) => {
                capturedDocs = loadedDocuments;

                // Every OpenAPI spec should have a corresponding preloaded document
                for (const spec of specs) {
                    const doc = loadedDocuments.get(spec.absoluteFilepath);
                    expect(doc).toBeDefined();
                }

                return [];
            }
        };

        await runRulesOnOSSWorkspace({
            workspace: result.workspace as OSSWorkspace,
            context,
            rules: [inspectRule]
        });

        expect(capturedDocs).toBeDefined();
        expect(capturedDocs?.size).toBeGreaterThan(0);

        // Verify the loaded document is a valid OpenAPI document
        for (const doc of capturedDocs?.values() ?? []) {
            expect(doc).toHaveProperty("openapi");
            expect(doc).toHaveProperty("info");
            expect(doc).toHaveProperty("paths");
        }
    }, 30_000);

    it("should produce identical results when running all rules together vs individually", async () => {
        const context = createMockTaskContext();
        const fixtureDir = join(
            AbsoluteFilePath.of(__dirname),
            RelativeFilePath.of(".."),
            RelativeFilePath.of("rules"),
            RelativeFilePath.of("no-duplicate-overrides"),
            RelativeFilePath.of("__test__"),
            RelativeFilePath.of("fixtures"),
            RelativeFilePath.of("simple")
        );

        const loadWorkspace = async () => {
            const ctx = createMockTaskContext();
            const result = await loadAPIWorkspace({
                absolutePathToWorkspace: fixtureDir,
                context: ctx,
                cliVersion: "0.0.0",
                workspaceName: undefined
            });
            if (!result.didSucceed) {
                throw new Error("API workspace failed to load");
            }
            if (!(result.workspace instanceof OSSWorkspace)) {
                throw new Error("Expected an OSS workspace");
            }
            return { workspace: result.workspace as OSSWorkspace, ctx };
        };

        // Import the actual rules
        const { NoDuplicateOverridesRule } = await import("../rules/no-duplicate-overrides/no-duplicate-overrides.js");
        const { NoDuplicateAuthHeaderParametersRule } = await import(
            "../rules/no-duplicate-auth-header-parameters/no-duplicate-auth-header-parameters.js"
        );

        // Run both rules together (shared preloaded documents)
        const { workspace: ws1, ctx: ctx1 } = await loadWorkspace();
        const combinedViolations = await runRulesOnOSSWorkspace({
            workspace: ws1,
            context: ctx1,
            rules: [NoDuplicateOverridesRule, NoDuplicateAuthHeaderParametersRule]
        });

        // Run each rule individually (separate preloaded documents)
        const { workspace: ws2, ctx: ctx2 } = await loadWorkspace();
        const overridesViolations = await runRulesOnOSSWorkspace({
            workspace: ws2,
            context: ctx2,
            rules: [NoDuplicateOverridesRule]
        });

        const { workspace: ws3, ctx: ctx3 } = await loadWorkspace();
        const authViolations = await runRulesOnOSSWorkspace({
            workspace: ws3,
            context: ctx3,
            rules: [NoDuplicateAuthHeaderParametersRule]
        });

        // Combined results should equal the union of individual results
        const individualViolations = [...overridesViolations, ...authViolations];
        expect(combinedViolations.length).toBe(individualViolations.length);

        // Sort by message for stable comparison
        const sortByMessage = (a: { message: string }, b: { message: string }) => a.message.localeCompare(b.message);
        expect(combinedViolations.sort(sortByMessage)).toEqual(individualViolations.sort(sortByMessage));
    }, 30_000);

    it("should apply overlays to preloaded documents", async () => {
        const context = createMockTaskContext();
        const result = await loadAPIWorkspace({
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("with-overlays")
            ),
            context,
            cliVersion: "0.0.0",
            workspaceName: undefined
        });

        if (!result.didSucceed) {
            throw new Error("API workspace failed to load");
        }
        if (!(result.workspace instanceof OSSWorkspace)) {
            throw new Error("Expected an OSS workspace");
        }

        let capturedDocs: Map<string, OpenAPI.Document> | undefined;

        const inspectRule: Rule = {
            name: "inspect-overlay-rule",
            run: async ({ loadedDocuments }: RuleContext) => {
                capturedDocs = loadedDocuments;
                return [];
            }
        };

        await runRulesOnOSSWorkspace({
            workspace: result.workspace as OSSWorkspace,
            context,
            rules: [inspectRule]
        });

        expect(capturedDocs).toBeDefined();
        expect(capturedDocs?.size).toBe(1);

        // Verify the overlay was applied: the overlay adds a description to info and User schema
        for (const doc of capturedDocs?.values() ?? []) {
            // biome-ignore lint/suspicious/noExplicitAny: test assertion on dynamic OpenAPI doc
            const apiDoc = doc as any;
            expect(apiDoc.info.description).toBe("API for managing users");
            expect(apiDoc.components.schemas.User.description).toBe("A user in the system");
        }
    }, 30_000);

    it("should share overlay-applied documents across multiple rules", async () => {
        const context = createMockTaskContext();
        const result = await loadAPIWorkspace({
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("with-overlays")
            ),
            context,
            cliVersion: "0.0.0",
            workspaceName: undefined
        });

        if (!result.didSucceed) {
            throw new Error("API workspace failed to load");
        }
        if (!(result.workspace instanceof OSSWorkspace)) {
            throw new Error("Expected an OSS workspace");
        }

        const capturedDocs: Array<Map<string, OpenAPI.Document>> = [];

        const captureRule: Rule = {
            name: "capture-rule",
            run: async ({ loadedDocuments }: RuleContext) => {
                capturedDocs.push(loadedDocuments);
                return [];
            }
        };

        // Run 3 rules that all need the overlaid document
        await runRulesOnOSSWorkspace({
            workspace: result.workspace as OSSWorkspace,
            context,
            rules: [captureRule, captureRule, captureRule]
        });

        // All 3 rules should get the exact same map (same reference)
        expect(capturedDocs).toHaveLength(3);
        expect(capturedDocs[0]).toBe(capturedDocs[1]);
        expect(capturedDocs[1]).toBe(capturedDocs[2]);

        // And the overlay should be applied in the shared document
        for (const doc of capturedDocs[0]?.values() ?? []) {
            // biome-ignore lint/suspicious/noExplicitAny: test assertion on dynamic OpenAPI doc
            const apiDoc = doc as any;
            expect(apiDoc.info.description).toBe("API for managing users");
        }
    }, 30_000);
});
