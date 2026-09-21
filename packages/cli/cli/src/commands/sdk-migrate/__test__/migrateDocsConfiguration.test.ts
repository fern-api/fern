import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import YAML from "yaml";

import { migrateDocsConfiguration } from "../migrateDocsConfiguration.js";
import type { ResolvedMigrationSourceSpec } from "../projectMigrationSource.js";

describe("migrateDocsConfiguration", () => {
    let temporaryDirectory: string;
    let docsPath: AbsoluteFilePath;

    beforeEach(async () => {
        temporaryDirectory = await mkdtemp(join(tmpdir(), "fern-docs-migrate-"));
        await mkdir(join(temporaryDirectory, "fern"));
        docsPath = AbsoluteFilePath.of(join(temporaryDirectory, "fern", "docs.yml"));
    });

    afterEach(async () => {
        await rm(temporaryDirectory, { force: true, recursive: true });
    });

    it("adds direct specs to associated API sections without changing legacy references", async () => {
        await writeFile(
            docsPath,
            [
                "# Keep this comment",
                "instances: []",
                "navigation:",
                "  - section: APIs",
                "    contents:",
                "      - api: Payments",
                "        api-name: payments",
                "      - api: Users",
                "        api-name: users",
                ""
            ].join("\n")
        );

        const updated = await migrateDocsConfiguration({
            docsPath,
            workspaceName: "payments",
            isOnlyApiWorkspace: false,
            sourceSpecs: [createSourceSpec(temporaryDirectory)]
        });

        const migratedText = await readFile(docsPath, "utf8");
        const migrated = YAML.parse(migratedText) as {
            navigation: Array<{ contents: Array<Record<string, unknown>> }>;
        };
        const [payments, users] = migrated.navigation[0]?.contents ?? [];

        expect(updated).toBe(1);
        expect(migratedText).toContain("# Keep this comment");
        expect(payments).toMatchObject({
            api: "Payments",
            "api-name": "payments",
            specs: [
                {
                    type: "openapi",
                    path: "../specs/openapi.yml",
                    namespace: "payments",
                    overlays: "../specs/overlay.yml",
                    overrides: ["../specs/override.yml"]
                }
            ]
        });
        expect(users).toEqual({ api: "Users", "api-name": "users" });
    });

    it("updates an unnamed API section for a single API and is idempotent", async () => {
        await writeFile(docsPath, "instances: []\nnavigation:\n  - api: API reference\n");
        const args = {
            docsPath,
            workspaceName: "payments",
            isOnlyApiWorkspace: true,
            sourceSpecs: [createSourceSpec(temporaryDirectory)]
        };

        await expect(migrateDocsConfiguration(args)).resolves.toBe(1);
        const firstMigration = await readFile(docsPath, "utf8");
        await expect(migrateDocsConfiguration(args)).resolves.toBe(0);
        expect(await readFile(docsPath, "utf8")).toBe(firstMigration);
    });

    it("writes independent specs arrays for multiple associated API sections", async () => {
        await writeFile(docsPath, "instances: []\nnavigation:\n  - api: First reference\n  - api: Second reference\n");

        await expect(
            migrateDocsConfiguration({
                docsPath,
                workspaceName: undefined,
                isOnlyApiWorkspace: true,
                sourceSpecs: [createSourceSpec(temporaryDirectory)]
            })
        ).resolves.toBe(2);

        const migratedText = await readFile(docsPath, "utf8");
        expect(migratedText).not.toMatch(/[&*][A-Za-z0-9_-]+/);
        expect(YAML.parse(migratedText)).toMatchObject({
            navigation: [
                { api: "First reference", specs: [{ path: "../specs/openapi.yml" }] },
                { api: "Second reference", specs: [{ path: "../specs/openapi.yml" }] }
            ]
        });
    });

    it("does not treat feature-flag payloads as API reference sections", async () => {
        await writeFile(
            docsPath,
            [
                "instances: []",
                "navigation:",
                "  - api: API reference",
                "    feature-flag:",
                "      flag: api-variant",
                "      match:",
                "        api: internal",
                ""
            ].join("\n")
        );

        await expect(
            migrateDocsConfiguration({
                docsPath,
                workspaceName: undefined,
                isOnlyApiWorkspace: true,
                sourceSpecs: [createSourceSpec(temporaryDirectory)]
            })
        ).resolves.toBe(1);

        expect(YAML.parse(await readFile(docsPath, "utf8"))).toMatchObject({
            navigation: [
                {
                    api: "API reference",
                    specs: [{ path: "../specs/openapi.yml" }],
                    "feature-flag": { match: { api: "internal" } }
                }
            ]
        });
    });

    it("rejects custom API import settings that docs.yml cannot preserve", async () => {
        const original = "instances: []\nnavigation:\n  - api: API reference\n";
        await writeFile(docsPath, original);
        const sourceSpec = createSourceSpec(temporaryDirectory);
        sourceSpec.apiImportSettings = { titleAsSchemaName: true };
        sourceSpec.hasCustomApiSettings = true;

        await expect(
            migrateDocsConfiguration({
                docsPath,
                workspaceName: undefined,
                isOnlyApiWorkspace: true,
                sourceSpecs: [sourceSpec]
            })
        ).rejects.toThrow("cannot preserve custom API import settings");
        expect(await readFile(docsPath, "utf8")).toBe(original);
    });

    it("uses the first overlay when docs.yml cannot represent additional overlays", async () => {
        await writeFile(docsPath, "instances: []\nnavigation:\n  - api: API reference\n");
        const sourceSpec = createSourceSpec(temporaryDirectory);
        sourceSpec.absoluteOverlayPaths.push(
            AbsoluteFilePath.of(join(temporaryDirectory, "specs", "second-overlay.yml"))
        );

        await expect(
            migrateDocsConfiguration({
                docsPath,
                workspaceName: undefined,
                isOnlyApiWorkspace: true,
                sourceSpecs: [sourceSpec]
            })
        ).resolves.toBe(1);
        expect(YAML.parse(await readFile(docsPath, "utf8"))).toMatchObject({
            navigation: [
                {
                    api: "API reference",
                    specs: [{ overlays: "../specs/overlay.yml" }]
                }
            ]
        });
    });

    it("preserves GraphQL source types in direct docs specs", async () => {
        await writeFile(docsPath, "instances: []\nnavigation:\n  - api: GraphQL API reference\n");
        const sourceSpec = createSourceSpec(temporaryDirectory);
        sourceSpec.type = "graphql";
        sourceSpec.absolutePath = AbsoluteFilePath.of(join(temporaryDirectory, "specs", "schema.graphql"));
        sourceSpec.absoluteOverlayPaths = [];
        sourceSpec.absoluteOverridePaths = [];

        await expect(
            migrateDocsConfiguration({
                docsPath,
                workspaceName: undefined,
                isOnlyApiWorkspace: true,
                sourceSpecs: [sourceSpec]
            })
        ).resolves.toBe(1);

        expect(YAML.parse(await readFile(docsPath, "utf8"))).toMatchObject({
            navigation: [
                {
                    api: "GraphQL API reference",
                    specs: [{ type: "graphql", path: "../specs/schema.graphql", namespace: "payments" }]
                }
            ]
        });
    });

    it("leaves docs.yml untouched when it has no associated API section", async () => {
        const original = "instances: []\nnavigation:\n  - api: Users\n    api-name: users\n";
        await writeFile(docsPath, original);

        await expect(
            migrateDocsConfiguration({
                docsPath,
                workspaceName: "payments",
                isOnlyApiWorkspace: false,
                sourceSpecs: [createSourceSpec(temporaryDirectory)]
            })
        ).resolves.toBe(0);
        expect(await readFile(docsPath, "utf8")).toBe(original);
    });

    it("updates API sections in referenced working-tree version files", async () => {
        await mkdir(join(temporaryDirectory, "fern", "versions"));
        const versionPath = join(temporaryDirectory, "fern", "versions", "v1.yml");
        const rootDocs = "instances: []\nversions:\n  - display-name: v1\n    path: ./versions/v1.yml\n";
        await writeFile(docsPath, rootDocs);
        await writeFile(versionPath, "navigation:\n  - api: API reference\n");

        await expect(
            migrateDocsConfiguration({
                docsPath,
                workspaceName: "payments",
                isOnlyApiWorkspace: true,
                sourceSpecs: [createSourceSpec(temporaryDirectory)]
            })
        ).resolves.toBe(1);

        expect(await readFile(docsPath, "utf8")).toBe(rootDocs);
        expect(YAML.parse(await readFile(versionPath, "utf8"))).toMatchObject({
            navigation: [
                {
                    api: "API reference",
                    specs: [{ type: "openapi", path: "../../specs/openapi.yml" }]
                }
            ]
        });
    });

    it("updates API sections in referenced product files", async () => {
        await mkdir(join(temporaryDirectory, "fern", "products"));
        const productPath = join(temporaryDirectory, "fern", "products", "payments.yml");
        const rootDocs = "instances: []\nproducts:\n  - display-name: Payments\n    path: ./products/payments.yml\n";
        await writeFile(docsPath, rootDocs);
        await writeFile(productPath, "navigation:\n  - api: API reference\n");

        await expect(
            migrateDocsConfiguration({
                docsPath,
                workspaceName: "payments",
                isOnlyApiWorkspace: true,
                sourceSpecs: [createSourceSpec(temporaryDirectory)]
            })
        ).resolves.toBe(1);

        expect(await readFile(docsPath, "utf8")).toBe(rootDocs);
        expect(YAML.parse(await readFile(productPath, "utf8"))).toMatchObject({
            navigation: [
                {
                    api: "API reference",
                    specs: [{ type: "openapi", path: "../../specs/openapi.yml" }]
                }
            ]
        });
    });
});

function createSourceSpec(temporaryDirectory: string): ResolvedMigrationSourceSpec {
    return {
        absolutePath: AbsoluteFilePath.of(join(temporaryDirectory, "specs", "openapi.yml")),
        absoluteOverlayPaths: [AbsoluteFilePath.of(join(temporaryDirectory, "specs", "overlay.yml"))],
        absoluteOverridePaths: [AbsoluteFilePath.of(join(temporaryDirectory, "specs", "override.yml"))],
        apiImportSettings: undefined,
        idHint: "payments",
        namespace: "payments",
        type: "openapi"
    };
}
