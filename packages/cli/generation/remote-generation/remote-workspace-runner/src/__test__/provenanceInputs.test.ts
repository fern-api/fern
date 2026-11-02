import { generatorsYml } from "@fern-api/configuration";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { createHash } from "crypto";
import { mkdir, mkdtemp, writeFile } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import { describe, expect, it } from "vitest";

import { computeGenerationProvenanceInputs, stableStringify } from "../provenanceInputs.js";

const sha256 = (contents: string) => createHash("sha256").update(contents).digest("hex");

async function createFernDirectory(files: Record<string, string>): Promise<string> {
    const root = await mkdtemp(path.join(tmpdir(), "provenance-"));
    for (const [relativePath, contents] of Object.entries(files)) {
        // Paths are relative to fern/, so "../openapi.yaml" lands next to it, as in a real project.
        const absolutePath = path.join(root, "fern", relativePath);
        await mkdir(path.dirname(absolutePath), { recursive: true });
        await writeFile(absolutePath, contents);
    }
    return path.join(root, "fern");
}

function invocation(
    raw: Record<string, unknown>,
    apiOverride?: generatorsYml.GeneratorInvocation["apiOverride"]
): generatorsYml.GeneratorInvocation {
    return {
        name: "fernapi/fern-go-sdk",
        version: "1.64.2",
        config: {},
        raw,
        apiOverride
    } as unknown as generatorsYml.GeneratorInvocation;
}

function configuration(fernDirectory: string, api: generatorsYml.APIDefinition): generatorsYml.GeneratorsConfiguration {
    return {
        absolutePathToConfiguration: AbsoluteFilePath.of(path.join(fernDirectory, "generators.yml")),
        api
    } as unknown as generatorsYml.GeneratorsConfiguration;
}

function location(
    schemaPath: string,
    extras: Partial<generatorsYml.APIDefinitionLocation> = {}
): generatorsYml.APIDefinitionLocation {
    return {
        schema: { type: "oss", path: schemaPath },
        origin: undefined,
        overrides: undefined,
        overlays: undefined,
        audiences: undefined,
        settings: undefined,
        ...extras
    };
}

describe("computeGenerationProvenanceInputs", () => {
    it("hashes every referenced spec file, overlay and generators.yml", async () => {
        const fernDirectory = await createFernDirectory({
            "generators.yml": "api: ...",
            "../openapi.yaml": "openapi: 3.0.0",
            "openapi-overlay.yml": "overlay: 1.0.0",
            "overrides.yml": "paths: {}"
        });
        const api: generatorsYml.APIDefinition = {
            type: "singleNamespace",
            definitions: [
                location("../openapi.yaml", {
                    overlays: "openapi-overlay.yml",
                    overrides: ["overrides.yml", "https://example.com/remote.yml"]
                })
            ]
        };

        const result = await computeGenerationProvenanceInputs({
            generatorsConfiguration: configuration(fernDirectory, api),
            generatorInvocation: invocation({ name: "fernapi/fern-go-sdk", version: "1.64.2" })
        });

        expect(result.specs).toEqual([
            { path: "../openapi.yaml", sha256: sha256("openapi: 3.0.0") },
            { path: "openapi-overlay.yml", sha256: sha256("overlay: 1.0.0") },
            { path: "overrides.yml", sha256: sha256("paths: {}") }
        ]);
        expect(result.generatorsYml).toEqual({ path: "generators.yml", sha256: sha256("api: ...") });
        expect(result.generatorName).toBe("fernapi/fern-go-sdk");
        expect(result.generatorVersion).toBe("1.64.2");
    });

    it("uses the generator's api override instead of the root api", async () => {
        const fernDirectory = await createFernDirectory({
            "generators.yml": "api: ...",
            "root.yaml": "root",
            "override.yaml": "override",
            "override-overlay.yml": "overlay"
        });
        const result = await computeGenerationProvenanceInputs({
            generatorsConfiguration: configuration(fernDirectory, {
                type: "singleNamespace",
                definitions: [location("root.yaml")]
            }),
            generatorInvocation: invocation(
                { name: "g", version: "1" },
                { specs: [{ openapi: "override.yaml", overlays: "override-overlay.yml" }] }
            )
        });
        expect(result.specs).toEqual([
            { path: "override-overlay.yml", sha256: sha256("overlay") },
            { path: "override.yaml", sha256: sha256("override") }
        ]);
    });

    it("produces the same config digest regardless of key order", async () => {
        const a = await computeGenerationProvenanceInputs({
            generatorsConfiguration: undefined,
            generatorInvocation: invocation({ name: "g", version: "1", config: { b: 1, a: [{ y: 1, x: 2 }] } })
        });
        const b = await computeGenerationProvenanceInputs({
            generatorsConfiguration: undefined,
            generatorInvocation: invocation({ config: { a: [{ x: 2, y: 1 }], b: 1 }, version: "1", name: "g" })
        });
        expect(a.generatorConfigSha256).toBe(b.generatorConfigSha256);
        expect(a.generatorConfigSha256).toBe(sha256('{"config":{"a":[{"x":2,"y":1}],"b":1},"name":"g","version":"1"}'));
        expect(a.specs).toEqual([]);
        expect(a.generatorsYml).toBeUndefined();
    });

    it("stableStringify drops undefined values", () => {
        expect(stableStringify({ b: undefined, a: 1 })).toBe('{"a":1}');
    });
});
