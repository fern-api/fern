import { docsYml } from "@fern-api/configuration";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import fs from "fs";
import os from "os";
import path from "path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { parseDocsConfiguration } from "../parseDocsConfiguration.js";

let fernDir: AbsoluteFilePath;

beforeAll(() => {
    fernDir = AbsoluteFilePath.of(fs.mkdtempSync(path.join(os.tmpdir(), "root-changelog-")));
    fs.mkdirSync(path.join(fernDir, "products"));
    fs.mkdirSync(path.join(fernDir, "changelog"));
    fs.mkdirSync(path.join(fernDir, "pages"));
    for (const product of ["ferns", "cacti"]) {
        fs.writeFileSync(
            path.join(fernDir, "products", `${product}.yml`),
            `navigation:\n  - page: Intro\n    path: ../pages/${product}.mdx\n`
        );
        fs.writeFileSync(path.join(fernDir, "pages", `${product}.mdx`), `# ${product}\n`);
    }
    fs.writeFileSync(path.join(fernDir, "changelog", "2026-06-01.mdx"), "First entry\n");
    fs.writeFileSync(path.join(fernDir, "changelog", "2026-06-02.mdx"), "Second entry\n");
});

afterAll(() => {
    fs.rmSync(fernDir, { recursive: true, force: true });
});

async function parseRawDocsYml(rawDocsYml: unknown): Promise<docsYml.ParsedDocsConfiguration> {
    const rawDocsConfiguration = docsYml.RawSchemas.Serializer.DocsConfiguration.parseOrThrow(rawDocsYml);
    return await parseDocsConfiguration({
        rawDocsConfiguration,
        absolutePathToFernFolder: fernDir,
        absoluteFilepathToDocsConfig: join(fernDir, RelativeFilePath.of("docs.yml")),
        context: createMockTaskContext()
    });
}

const PRODUCTS = [
    { "display-name": "Ferns", path: "products/ferns.yml", slug: "ferns" },
    { "display-name": "Cacti", path: "products/cacti.yml", slug: "cacti" }
];

describe("top-level changelog", () => {
    it("parses a root changelog alongside products without adding a product", async () => {
        const parsed = await parseRawDocsYml({
            instances: [],
            products: PRODUCTS,
            changelog: { changelog: "changelog", title: "Release Notes" }
        });
        if (parsed.navigation.type !== "productgroup") {
            throw new Error("Expected productgroup navigation");
        }

        expect(parsed.navigation.products.map((product) => product.product)).toEqual(["Ferns", "Cacti"]);
        expect(parsed.navigation.changelog).toEqual({
            type: "changelog",
            changelog: [
                join(fernDir, RelativeFilePath.of("changelog/2026-06-01.mdx")),
                join(fernDir, RelativeFilePath.of("changelog/2026-06-02.mdx"))
            ],
            hidden: false,
            icon: undefined,
            title: "Release Notes",
            slug: undefined,
            viewers: undefined,
            orphaned: undefined,
            featureFlags: undefined
        });
        expect(parsed.pages).toHaveProperty(["changelog/2026-06-01.mdx"]);
        expect(parsed.pages).toHaveProperty(["changelog/2026-06-02.mdx"]);
    });

    it("leaves changelog undefined when not configured", async () => {
        const parsed = await parseRawDocsYml({ instances: [], products: PRODUCTS });
        if (parsed.navigation.type !== "productgroup") {
            throw new Error("Expected productgroup navigation");
        }
        expect(parsed.navigation.changelog).toBeUndefined();
    });

    it("rejects a root changelog without products", async () => {
        await expect(
            parseRawDocsYml({
                instances: [],
                navigation: [{ page: "Intro", path: "pages/intro.mdx" }],
                changelog: { changelog: "changelog" }
            })
        ).rejects.toThrow("only supported alongside `products`");
    });
});
