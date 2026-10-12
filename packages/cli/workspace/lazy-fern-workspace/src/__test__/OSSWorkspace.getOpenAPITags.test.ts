import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import type { OpenAPISpec } from "@fern-api/api-workspace-commons";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { afterEach, describe, expect, it } from "vitest";

import { OSSWorkspace } from "../OSSWorkspace.js";
import { createMockTaskContext } from "./helpers/createMockTaskContext.js";

const context = createMockTaskContext();

function spec(file: string, overrides?: string): OpenAPISpec {
    return {
        type: "openapi",
        absoluteFilepath: AbsoluteFilePath.of(file),
        absoluteFilepathToOverrides: overrides != null ? AbsoluteFilePath.of(overrides) : undefined,
        absoluteFilepathToOverlays: undefined,
        source: { type: "openapi", file: AbsoluteFilePath.of(file) }
    };
}

function openapi(title: string, tags: string[]): string {
    return [
        "openapi: 3.0.0",
        "info:",
        `  title: ${title}`,
        "  version: 1.0.0",
        "tags:",
        ...tags,
        "paths:",
        "  /ping:",
        "    get:",
        `      operationId: ping${title}`,
        "      responses:",
        "        '200':",
        "          description: Success",
        ""
    ].join("\n");
}

describe("OSSWorkspace.getOpenAPITags", () => {
    const directories: string[] = [];

    afterEach(async () => {
        await Promise.all(directories.splice(0).map((directory) => rm(directory, { recursive: true })));
    });

    it("matches the tags of the parsed OpenAPI IR", async () => {
        const directory = await mkdtemp(path.join(tmpdir(), "fern-openapi-tags-"));
        directories.push(directory);
        const first = path.join(directory, "first.yml");
        const firstOverrides = path.join(directory, "first-overrides.yml");
        const second = path.join(directory, "second.yml");
        await writeFile(
            first,
            openapi("First", [
                "  - name: Plants",
                "    description: Plant operations",
                "  - name: shared",
                "    description: From the first spec",
                "  - name: no-description"
            ])
        );
        await writeFile(
            firstOverrides,
            [
                "tags:",
                "  - name: Plants",
                "    description: Plant operations",
                "  - name: overridden",
                "    description: Added by an override",
                ""
            ].join("\n")
        );
        await writeFile(second, openapi("Second", ["  - name: shared", "    description: From the second spec"]));
        const specs = [spec(first, firstOverrides), spec(second)];
        const workspace = new OSSWorkspace({
            absoluteFilePath: AbsoluteFilePath.of(directory),
            allSpecs: specs,
            specs,
            generatorsConfiguration: undefined,
            workspaceName: undefined,
            cliVersion: "0.0.0"
        });

        const tags = await workspace.getOpenAPITags({ context });

        expect(tags).toEqual((await workspace.getOpenAPIIr({ context, loadAiExamples: true })).tags.tagsById);
        expect(tags).toEqual({
            Plants: { id: "Plants", description: "Plant operations" },
            "no-description": { id: "no-description", description: undefined },
            overridden: { id: "overridden", description: "Added by an override" },
            shared: { id: "shared", description: "From the second spec" }
        });
    });
});
