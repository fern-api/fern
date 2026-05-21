import { access, mkdir, mkdtemp, readFile, rm, writeFile } from "fs/promises";
import os from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { runPipeline } from "../runPipeline.js";

/**
 * Locks in the ordering invariants between copySdk, patchCargoToml,
 * and copySpecs without standing up Docker. Tests use a minimal
 * synthetic SDK template (just the files patchCargoToml needs to
 * anchor against) so we don't depend on the real `sdk/` tree's
 * stability for this assertion.
 */
describe("runPipeline", () => {
    let tmpDir: string;
    let sdkTemplateDir: string;
    let specsDir: string;
    let outputDir: string;

    beforeEach(async () => {
        tmpDir = await mkdtemp(path.join(os.tmpdir(), "runPipeline-"));
        sdkTemplateDir = path.join(tmpDir, "sdk");
        specsDir = path.join(tmpDir, "specs");
        outputDir = path.join(tmpDir, "out");
        await mkdir(sdkTemplateDir, { recursive: true });
        await mkdir(specsDir, { recursive: true });
    });

    afterEach(async () => {
        await rm(tmpDir, { recursive: true, force: true });
    });

    /** Lay down a stand-in SDK template with just the Cargo.toml the patcher needs. */
    async function stageSdkTemplate(): Promise<void> {
        await writeFile(
            path.join(sdkTemplateDir, "Cargo.toml"),
            [
                "[package]",
                'name = "fern-cli-sdk"',
                'version = "0.0.0"',
                "",
                "[[bin]]",
                'name = "openapi-fixture"',
                'path = "cli/openapi-fixture/main.rs"',
                ""
            ].join("\n")
        );
        // A few siblings so we can verify copySdk landed the whole tree.
        await writeFile(path.join(sdkTemplateDir, "LICENSE"), "Apache-2.0");
        await mkdir(path.join(sdkTemplateDir, "src"), { recursive: true });
        await writeFile(path.join(sdkTemplateDir, "src", "lib.rs"), "// SDK lib");
    }

    /** Lay down a single-OpenAPI manifest with the given spec content. */
    async function stageSpecs(specs: Array<{ filename: string; body: object }>): Promise<void> {
        for (const { filename, body } of specs) {
            await writeFile(path.join(specsDir, filename), JSON.stringify(body));
        }
        await writeFile(
            path.join(specsDir, "specs-manifest.json"),
            JSON.stringify({
                specs: specs.map(({ filename }) => ({
                    type: "openapi",
                    specPath: path.join(specsDir, filename)
                }))
            })
        );
    }

    it("returns skipped when no OpenAPI specs are mounted; never touches the output dir", async () => {
        await stageSdkTemplate();
        // No specsDir manifest at all.

        const outcome = await runPipeline({ outputDir, customConfig: {}, sdkTemplateDir, specsDir });

        expect(outcome).toEqual({ status: "skipped", reason: "no-openapi-specs" });
        await expect(access(outputDir)).rejects.toThrow();
    });

    it("runs copySdk → patchCargoToml → copySpecs in order; outputs are mutually consistent", async () => {
        await stageSdkTemplate();
        await stageSpecs([{ filename: "openapi0.json", body: { openapi: "3.0.0", info: { title: "My API" } } }]);

        const outcome = await runPipeline({ outputDir, customConfig: {}, sdkTemplateDir, specsDir });

        expect(outcome).toEqual({ status: "generated", binaryName: "my-api" });

        // copySdk landed the template.
        expect(await readFile(path.join(outputDir, "LICENSE"), "utf-8")).toBe("Apache-2.0");
        expect(await readFile(path.join(outputDir, "src", "lib.rs"), "utf-8")).toBe("// SDK lib");

        // patchCargoToml rewrote the [[bin]] block to reference the
        // derived binary name. If the patcher ran BEFORE copySdk, the
        // Cargo.toml wouldn't exist yet and patchCargoToml would throw.
        const cargo = await readFile(path.join(outputDir, "Cargo.toml"), "utf-8");
        expect(cargo).toContain('name = "my-api"');
        expect(cargo).toContain('path = "cli/my-api/main.rs"');

        // copySpecs created `cli/<binaryName>/` with the spec + main.rs.
        // If copySpecs ran BEFORE patchCargoToml, the [[bin]] path
        // wouldn't match this directory and the resulting workspace
        // would fail to build. Asserting both files exist + the [[bin]]
        // path agrees with the directory locks both orderings in.
        const main = await readFile(path.join(outputDir, "cli", "my-api", "main.rs"), "utf-8");
        expect(main).toContain('CliApp::new("my-api")');
        await expect(access(path.join(outputDir, "cli", "my-api", "openapi0.json"))).resolves.toBeUndefined();
    });

    it("customConfig.binaryName overrides the spec's info.title", async () => {
        await stageSdkTemplate();
        await stageSpecs([
            { filename: "openapi0.json", body: { openapi: "3.0.0", info: { title: "Should Not Win" } } }
        ]);

        const outcome = await runPipeline({
            outputDir,
            customConfig: { binaryName: "Override CLI" },
            sdkTemplateDir,
            specsDir
        });

        expect(outcome).toEqual({ status: "generated", binaryName: "override-cli" });
        await expect(access(path.join(outputDir, "cli", "override-cli", "main.rs"))).resolves.toBeUndefined();
    });

    it("multi-spec without customConfig.binaryName surfaces a clear error before any disk write", async () => {
        await stageSdkTemplate();
        await stageSpecs([
            { filename: "openapi0.json", body: { openapi: "3.0.0", info: { title: "A" } } },
            { filename: "openapi1.json", body: { openapi: "3.0.0", info: { title: "B" } } }
        ]);

        await expect(runPipeline({ outputDir, customConfig: {}, sdkTemplateDir, specsDir })).rejects.toThrow(
            /Multi-spec workspaces must set `customConfig.binaryName`/
        );

        // The error came BEFORE any output got created.
        await expect(access(outputDir)).rejects.toThrow();
    });
});
