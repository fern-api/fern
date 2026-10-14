import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import YAML from "yaml";

import { migrateDocsConfiguration } from "../migrateDocsConfiguration.js";
import type { ResolvedMigrationSourceSpec } from "../projectMigrationSource.js";

// The migrator only computes edits; apply them here so the assertions can inspect the resulting files.
async function migrate(args: Parameters<typeof migrateDocsConfiguration>[0]): Promise<number> {
    const { edits, updatedSections } = await migrateDocsConfiguration(args);
    for (const edit of edits) {
        await writeFile(edit.path, edit.contents);
    }
    return updatedSections;
}

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

        const updated = await migrate({
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

        await expect(migrate(args)).resolves.toBe(1);
        const firstMigration = await readFile(docsPath, "utf8");
        await expect(migrate(args)).resolves.toBe(0);
        expect(await readFile(docsPath, "utf8")).toBe(firstMigration);
    });

    it("writes independent specs arrays for multiple associated API sections", async () => {
        await writeFile(docsPath, "instances: []\nnavigation:\n  - api: First reference\n  - api: Second reference\n");

        await expect(
            migrate({
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
            migrate({
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

    it("preserves docs-relevant import settings and drops SDK-only settings", async () => {
        await writeFile(docsPath, "instances: []\nnavigation:\n  - api: API reference\n");
        const sourceSpec = createSourceSpec(temporaryDirectory);
        sourceSpec.apiImportSettings = { titleAsSchemaName: true };
        sourceSpec.docsImportSettings = {
            typeDatesAsStrings: true,
            useBytesForBinaryResponse: true,
            respectParameterContent: true,
            respectOperationIdWordBoundaries: true,
            inferForwardCompatible: true,
            preserveOneOfInAllOf: true,
            anyOfSiblingPropertiesAsObject: true,
            errorResponses: {
                schema: join(temporaryDirectory, "specs", "problem.yml"),
                name: "ProblemDetails",
                applyTo: "untyped",
                ensure: [{ statusCode: 422, methods: ["post"] }]
            }
        };

        await expect(
            migrate({
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
                    specs: [
                        {
                            path: "../specs/openapi.yml",
                            settings: {
                                "type-dates-as-strings": true,
                                "use-bytes-for-binary-response": true,
                                "respect-parameter-content": true,
                                "respect-operation-id-word-boundaries": true,
                                "infer-forward-compatible": true,
                                "preserve-one-of-in-all-of": true,
                                "any-of-sibling-properties-as-object": true,
                                "error-responses": {
                                    schema: "../specs/problem.yml",
                                    name: "ProblemDetails",
                                    "apply-to": "untyped",
                                    ensure: [{ "status-code": 422, methods: ["post"] }]
                                }
                            }
                        }
                    ]
                }
            ]
        });
    });

    it("rejects legacy-parser migrations when additional import settings affect docs", async () => {
        const original = [
            "instances: []",
            "experimental:",
            "  openapi-parser-v3: false",
            "navigation:",
            "  - api: API reference",
            ""
        ].join("\n");
        await writeFile(docsPath, original);
        const sourceSpec = createSourceSpec(temporaryDirectory);
        sourceSpec.hasLegacyOnlyDocsImportSettings = true;

        await expect(
            migrate({
                docsPath,
                workspaceName: undefined,
                isOnlyApiWorkspace: true,
                sourceSpecs: [sourceSpec]
            })
        ).rejects.toThrow("legacy docs parser consumes additional API import settings");
        expect(await readFile(docsPath, "utf8")).toBe(original);
    });

    it("uses the first overlay when docs.yml cannot represent additional overlays", async () => {
        await writeFile(docsPath, "instances: []\nnavigation:\n  - api: API reference\n");
        const sourceSpec = createSourceSpec(temporaryDirectory);
        sourceSpec.absoluteOverlayPaths.push(
            AbsoluteFilePath.of(join(temporaryDirectory, "specs", "second-overlay.yml"))
        );

        await expect(
            migrate({
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
            migrate({
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
            migrate({
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

        const sourceSpec = createSourceSpec(temporaryDirectory);
        sourceSpec.docsImportSettings = {
            errorResponses: { schema: join(temporaryDirectory, "specs", "problem.yml") }
        };

        await expect(
            migrate({
                docsPath,
                workspaceName: "payments",
                isOnlyApiWorkspace: true,
                sourceSpecs: [sourceSpec]
            })
        ).resolves.toBe(1);

        expect(await readFile(docsPath, "utf8")).toBe(rootDocs);
        expect(YAML.parse(await readFile(versionPath, "utf8"))).toMatchObject({
            navigation: [
                {
                    api: "API reference",
                    specs: [
                        {
                            type: "openapi",
                            path: "../../specs/openapi.yml",
                            settings: { "error-responses": { schema: "../../specs/problem.yml" } }
                        }
                    ]
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

        const sourceSpec = createSourceSpec(temporaryDirectory);
        sourceSpec.docsImportSettings = {
            errorResponses: { schema: join(temporaryDirectory, "specs", "problem.yml") }
        };

        await expect(
            migrate({
                docsPath,
                workspaceName: "payments",
                isOnlyApiWorkspace: true,
                sourceSpecs: [sourceSpec]
            })
        ).resolves.toBe(1);

        expect(await readFile(docsPath, "utf8")).toBe(rootDocs);
        expect(YAML.parse(await readFile(productPath, "utf8"))).toMatchObject({
            navigation: [
                {
                    api: "API reference",
                    specs: [
                        {
                            type: "openapi",
                            path: "../../specs/openapi.yml",
                            settings: { "error-responses": { schema: "../../specs/problem.yml" } }
                        }
                    ]
                }
            ]
        });
    });

    it("creates one API reference section per spec when the API has several", async () => {
        await writeFile(
            docsPath,
            [
                "navigation:",
                "  - section: APIs",
                "    contents:",
                "      - api: API reference",
                "        slug: api",
                "        display-errors: true",
                "      - page: Intro",
                "        path: ./intro.mdx",
                ""
            ].join("\n")
        );
        const pets = { ...createSourceSpec(temporaryDirectory), namespace: "pets" };
        const orders = { ...createSourceSpec(temporaryDirectory), namespace: "orders" };
        const unnamed = { ...createSourceSpec(temporaryDirectory), namespace: undefined };

        const updated = await migrate({
            docsPath,
            workspaceName: undefined,
            isOnlyApiWorkspace: true,
            sourceSpecs: [pets, orders, unnamed]
        });

        const migrated = YAML.parse(await readFile(docsPath, "utf8")) as {
            navigation: Array<{ contents: Array<Record<string, unknown>> }>;
        };
        const contents = migrated.navigation[0]?.contents ?? [];
        expect(updated).toBe(3);
        expect(contents).toHaveLength(4);
        expect(contents.slice(0, 3).map((item) => [item.api, item.slug, item["display-errors"]])).toEqual([
            ["API reference - pets", "api-pets", true],
            ["API reference - orders", "api-orders", true],
            ["API reference - openapi", "api-openapi", true]
        ]);
        for (const item of contents.slice(0, 3)) {
            expect(item.specs).toHaveLength(1);
        }
        expect(contents[3]).toEqual({ page: "Intro", path: "./intro.mdx" });
    });

    it("keeps split section titles distinct when specs share a file name", async () => {
        await writeFile(docsPath, ["navigation:", "  - api: API reference", ""].join("\n"));
        const first = {
            ...createSourceSpec(temporaryDirectory),
            absolutePath: AbsoluteFilePath.of(join(temporaryDirectory, "a", "openapi.yml")),
            namespace: undefined
        };
        const second = {
            ...createSourceSpec(temporaryDirectory),
            absolutePath: AbsoluteFilePath.of(join(temporaryDirectory, "b", "openapi.yml")),
            namespace: undefined
        };

        await migrate({ docsPath, workspaceName: undefined, isOnlyApiWorkspace: true, sourceSpecs: [first, second] });

        const migrated = YAML.parse(await readFile(docsPath, "utf8")) as { navigation: Array<{ api: string }> };
        expect(migrated.navigation.map((item) => item.api)).toEqual([
            "API reference - openapi",
            "API reference - openapi-2"
        ]);
    });

    it("keeps split section titles unique when a namespace looks like a generated suffix", async () => {
        const unnamed = (directory: string) => ({
            ...createSourceSpec(temporaryDirectory),
            absolutePath: AbsoluteFilePath.of(join(temporaryDirectory, directory, "openapi.yml")),
            namespace: undefined
        });
        const lookalike = { ...createSourceSpec(temporaryDirectory), namespace: "openapi-2" };

        for (const sourceSpecs of [
            [unnamed("a"), unnamed("b"), lookalike],
            [lookalike, unnamed("a"), unnamed("b")]
        ]) {
            await writeFile(docsPath, ["navigation:", "  - api: API reference", ""].join("\n"));
            await migrate({ docsPath, workspaceName: undefined, isOnlyApiWorkspace: true, sourceSpecs });
            const migrated = YAML.parse(await readFile(docsPath, "utf8")) as { navigation: Array<{ api: string }> };
            const titles = migrated.navigation.map((item) => item.api);
            expect(titles).toHaveLength(3);
            expect(new Set(titles).size).toBe(3);
        }
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
