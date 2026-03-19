import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { randomUUID } from "crypto";
import { mkdir, readFile, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { FernYmlEditor } from "../config/fern-yml/FernYmlEditor.js";

describe("FernYmlEditor", () => {
    let testDir: string;

    beforeEach(async () => {
        testDir = join(tmpdir(), `fern-editor-test-${randomUUID()}`);
        await mkdir(testDir, { recursive: true });
    });

    afterEach(async () => {
        await rm(testDir, { recursive: true, force: true });
    });

    // ─── SDK target tests ────────────────────────────────────────────────

    describe("setTargetVersion", () => {
        it("updates a target version in fern.yml", async () => {
            const fernYmlPath = AbsoluteFilePath.of(join(testDir, "fern.yml"));
            await writeFile(
                fernYmlPath,
                `edition: 2026-01-01
org: acme
sdks:
  targets:
    typescript:
      version: "1.0.0"
      output:
        path: ./sdks/typescript
`
            );

            const editor = await FernYmlEditor.load({ fernYmlPath });
            await editor.setTargetVersion("typescript", "2.0.0");
            await editor.save();

            const content = await readFile(fernYmlPath, "utf-8");
            expect(content).toContain('version: "2.0.0"');
            expect(content).toContain("edition: 2026-01-01");
        });

        it("preserves YAML formatting and comments", async () => {
            const fernYmlPath = AbsoluteFilePath.of(join(testDir, "fern.yml"));
            await writeFile(
                fernYmlPath,
                `edition: 2026-01-01
org: acme
# SDK configuration
sdks:
  targets:
    typescript:
      version: "1.0.0"
      output:
        path: ./sdks/typescript
`
            );

            const editor = await FernYmlEditor.load({ fernYmlPath });
            await editor.setTargetVersion("typescript", "2.0.0");
            await editor.save();

            const content = await readFile(fernYmlPath, "utf-8");
            expect(content).toContain("# SDK configuration");
        });
    });

    describe("sdks $ref resolution", () => {
        it("writes to the referenced file when sdks uses $ref", async () => {
            const fernYmlPath = AbsoluteFilePath.of(join(testDir, "fern.yml"));
            const sdksPath = join(testDir, "sdks.yaml");

            await writeFile(
                fernYmlPath,
                `edition: 2026-01-01
org: acme
sdks:
  $ref: "./sdks.yaml"
`
            );
            await writeFile(
                sdksPath,
                `targets:
  typescript:
    version: "1.0.0"
    output:
      path: ./sdks/typescript
`
            );

            const editor = await FernYmlEditor.load({ fernYmlPath });
            await editor.setTargetVersion("typescript", "2.0.0");
            await editor.save();

            // The referenced file should be updated, not fern.yml
            const sdksContent = await readFile(sdksPath, "utf-8");
            expect(sdksContent).toContain('version: "2.0.0"');

            // fern.yml should be unchanged
            const fernContent = await readFile(fernYmlPath, "utf-8");
            expect(fernContent).toContain("$ref");
        });
    });

    describe("addTarget", () => {
        it("adds a new target to fern.yml", async () => {
            const fernYmlPath = AbsoluteFilePath.of(join(testDir, "fern.yml"));
            await writeFile(
                fernYmlPath,
                `edition: 2026-01-01
org: acme
sdks:
  targets:
    typescript:
      version: "1.0.0"
      output:
        path: ./sdks/typescript
`
            );

            const editor = await FernYmlEditor.load({ fernYmlPath });
            await editor.addTarget("python", { version: "2.0.0", output: "./sdks/python" });
            await editor.save();

            const content = await readFile(fernYmlPath, "utf-8");
            expect(content).toContain("python:");
            expect(content).toContain("version: 2.0.0");
        });

        it("creates sdks.targets path if it does not exist", async () => {
            const fernYmlPath = AbsoluteFilePath.of(join(testDir, "fern.yml"));
            await writeFile(
                fernYmlPath,
                `edition: 2026-01-01
org: acme
`
            );

            const editor = await FernYmlEditor.load({ fernYmlPath });
            await editor.addTarget("typescript", { output: "./sdks/typescript" });
            await editor.save();

            const content = await readFile(fernYmlPath, "utf-8");
            expect(content).toContain("sdks:");
            expect(content).toContain("targets:");
            expect(content).toContain("typescript:");
        });

        it("adds a target to a $ref file", async () => {
            const fernYmlPath = AbsoluteFilePath.of(join(testDir, "fern.yml"));
            const sdksPath = join(testDir, "sdks.yaml");

            await writeFile(
                fernYmlPath,
                `edition: 2026-01-01
org: acme
sdks:
  $ref: "./sdks.yaml"
`
            );
            await writeFile(
                sdksPath,
                `targets:
  typescript:
    version: "1.0.0"
    output:
      path: ./sdks/typescript
`
            );

            const editor = await FernYmlEditor.load({ fernYmlPath });
            await editor.addTarget("python", { version: "2.0.0", output: "./sdks/python" });
            await editor.save();

            const sdksContent = await readFile(sdksPath, "utf-8");
            expect(sdksContent).toContain("python:");
        });
    });

    describe("setTargetConfig", () => {
        it("adds config to a target without one", async () => {
            const fernYmlPath = AbsoluteFilePath.of(join(testDir, "fern.yml"));
            await writeFile(
                fernYmlPath,
                `edition: 2026-01-01
org: acme
sdks:
  targets:
    typescript:
      version: "1.0.0"
      output:
        path: ./sdks/typescript
`
            );

            const editor = await FernYmlEditor.load({ fernYmlPath });
            await editor.setTargetConfig("typescript", { streamType: "wrapper" });
            await editor.save();

            const content = await readFile(fernYmlPath, "utf-8");
            expect(content).toContain("config:");
            expect(content).toContain("streamType: wrapper");
        });

        it("replaces an existing config", async () => {
            const fernYmlPath = AbsoluteFilePath.of(join(testDir, "fern.yml"));
            await writeFile(
                fernYmlPath,
                `edition: 2026-01-01
org: acme
sdks:
  targets:
    typescript:
      version: "1.0.0"
      config:
        streamType: sse
      output:
        path: ./sdks/typescript
`
            );

            const editor = await FernYmlEditor.load({ fernYmlPath });
            await editor.setTargetConfig("typescript", { streamType: "wrapper", fetchSupport: "node-fetch" });
            await editor.save();

            const content = await readFile(fernYmlPath, "utf-8");
            expect(content).toContain("streamType: wrapper");
            expect(content).toContain("fetchSupport: node-fetch");
        });
    });

    describe("deleteTargetConfig", () => {
        it("removes config from a target", async () => {
            const fernYmlPath = AbsoluteFilePath.of(join(testDir, "fern.yml"));
            await writeFile(
                fernYmlPath,
                `edition: 2026-01-01
org: acme
sdks:
  targets:
    typescript:
      version: "1.0.0"
      config:
        streamType: sse
      output:
        path: ./sdks/typescript
`
            );

            const editor = await FernYmlEditor.load({ fernYmlPath });
            await editor.deleteTargetConfig("typescript");
            await editor.save();

            const content = await readFile(fernYmlPath, "utf-8");
            expect(content).not.toContain("config:");
            expect(content).not.toContain("streamType");
            expect(content).toContain('version: "1.0.0"');
        });
    });

    // ─── API spec override/overlay tests ─────────────────────────────────

    describe("addOverride — inline api section", () => {
        it("adds override to spec with no existing overrides", async () => {
            const fernYmlPath = AbsoluteFilePath.of(join(testDir, "fern.yml"));
            const specFilePath = AbsoluteFilePath.of(join(testDir, "openapi.yml"));
            await writeFile(
                fernYmlPath,
                `api:
  specs:
    - openapi: ./openapi.yml
`
            );

            const editor = await FernYmlEditor.load({ fernYmlPath });
            const overridePath = AbsoluteFilePath.of(join(testDir, "openapi-overrides.yml"));
            const edit = await editor.addOverride(specFilePath, overridePath);
            await editor.save();

            const result = await readFile(fernYmlPath, "utf8");
            expect(result).toContain("overrides: ./openapi-overrides.yml");
            expect(edit?.line).toBeGreaterThan(0);
        });

        it("converts single override to array when adding second", async () => {
            const fernYmlPath = AbsoluteFilePath.of(join(testDir, "fern.yml"));
            const specFilePath = AbsoluteFilePath.of(join(testDir, "openapi.yml"));
            await writeFile(
                fernYmlPath,
                `api:
  specs:
    - openapi: ./openapi.yml
      overrides: ./overrides-1.yml
`
            );

            const editor = await FernYmlEditor.load({ fernYmlPath });
            const overridePath = AbsoluteFilePath.of(join(testDir, "overrides-2.yml"));
            await editor.addOverride(specFilePath, overridePath);
            await editor.save();

            const result = await readFile(fernYmlPath, "utf8");
            expect(result).toContain("overrides-1.yml");
            expect(result).toContain("overrides-2.yml");
        });

        it("appends to existing array of overrides", async () => {
            const fernYmlPath = AbsoluteFilePath.of(join(testDir, "fern.yml"));
            const specFilePath = AbsoluteFilePath.of(join(testDir, "openapi.yml"));
            await writeFile(
                fernYmlPath,
                `api:
  specs:
    - openapi: ./openapi.yml
      overrides:
        - ./overrides-1.yml
        - ./overrides-2.yml
`
            );

            const editor = await FernYmlEditor.load({ fernYmlPath });
            const overridePath = AbsoluteFilePath.of(join(testDir, "overrides-3.yml"));
            await editor.addOverride(specFilePath, overridePath);
            await editor.save();

            const result = await readFile(fernYmlPath, "utf8");
            expect(result).toContain("overrides-1.yml");
            expect(result).toContain("overrides-2.yml");
            expect(result).toContain("overrides-3.yml");
        });

        it("does not duplicate existing override", async () => {
            const fernYmlPath = AbsoluteFilePath.of(join(testDir, "fern.yml"));
            const specFilePath = AbsoluteFilePath.of(join(testDir, "openapi.yml"));
            await writeFile(
                fernYmlPath,
                `api:
  specs:
    - openapi: ./openapi.yml
      overrides: ./openapi-overrides.yml
`
            );

            const editor = await FernYmlEditor.load({ fernYmlPath });
            const overridePath = AbsoluteFilePath.of(join(testDir, "openapi-overrides.yml"));
            const edit = await editor.addOverride(specFilePath, overridePath);

            expect(edit).toBeUndefined();
        });

        it("returns undefined when no specs array", async () => {
            const fernYmlPath = AbsoluteFilePath.of(join(testDir, "fern.yml"));
            const specFilePath = AbsoluteFilePath.of(join(testDir, "openapi.yml"));
            await writeFile(
                fernYmlPath,
                `api:
  auth: bearer
`
            );

            const editor = await FernYmlEditor.load({ fernYmlPath });
            const overridePath = AbsoluteFilePath.of(join(testDir, "overrides.yml"));
            const edit = await editor.addOverride(specFilePath, overridePath);

            expect(edit).toBeUndefined();
        });

        it("removes single override reference", async () => {
            const fernYmlPath = AbsoluteFilePath.of(join(testDir, "fern.yml"));
            const specFilePath = AbsoluteFilePath.of(join(testDir, "openapi.yml"));
            await writeFile(
                fernYmlPath,
                `api:
  specs:
    - openapi: ./openapi.yml
      overrides: ./overrides.yml
`
            );

            const editor = await FernYmlEditor.load({ fernYmlPath });
            const edit = await editor.removeOverrides(specFilePath);
            await editor.save();

            const result = await readFile(fernYmlPath, "utf8");
            expect(result).not.toContain("overrides");
            expect(edit?.removed).toEqual(["./overrides.yml"]);
            expect(edit?.line).toBeGreaterThan(0);
        });

        it("removes array of overrides", async () => {
            const fernYmlPath = AbsoluteFilePath.of(join(testDir, "fern.yml"));
            const specFilePath = AbsoluteFilePath.of(join(testDir, "openapi.yml"));
            await writeFile(
                fernYmlPath,
                `api:
  specs:
    - openapi: ./openapi.yml
      overrides:
        - ./a.yml
        - ./b.yml
`
            );

            const editor = await FernYmlEditor.load({ fernYmlPath });
            const edit = await editor.removeOverrides(specFilePath);
            await editor.save();

            const result = await readFile(fernYmlPath, "utf8");
            expect(result).not.toContain("overrides");
            expect(edit?.removed).toEqual(["./a.yml", "./b.yml"]);
        });

        it("returns undefined when no overrides exist", async () => {
            const fernYmlPath = AbsoluteFilePath.of(join(testDir, "fern.yml"));
            const specFilePath = AbsoluteFilePath.of(join(testDir, "openapi.yml"));
            await writeFile(
                fernYmlPath,
                `api:
  specs:
    - openapi: ./openapi.yml
`
            );

            const editor = await FernYmlEditor.load({ fernYmlPath });
            const edit = await editor.removeOverrides(specFilePath);
            expect(edit).toBeUndefined();
        });

        it("only removes overrides for matching spec", async () => {
            const fernYmlPath = AbsoluteFilePath.of(join(testDir, "fern.yml"));
            const specFilePath = AbsoluteFilePath.of(join(testDir, "openapi.yml"));
            await writeFile(
                fernYmlPath,
                `api:
  specs:
    - openapi: ./openapi.yml
      overrides: ./overrides-a.yml
    - openapi: ./other.yml
      overrides: ./overrides-b.yml
`
            );

            const editor = await FernYmlEditor.load({ fernYmlPath });
            await editor.removeOverrides(specFilePath);
            await editor.save();

            const result = await readFile(fernYmlPath, "utf8");
            expect(result).toContain("overrides-b.yml");
            expect(result).not.toContain("overrides-a.yml");
        });

        it("does not write file when no mutations were made", async () => {
            const fernYmlPath = AbsoluteFilePath.of(join(testDir, "fern.yml"));
            await writeFile(
                fernYmlPath,
                `api:
  specs:
    - openapi: ./openapi.yml
`
            );
            const original = await readFile(fernYmlPath, "utf8");

            const editor = await FernYmlEditor.load({ fernYmlPath });
            await editor.save();

            const after = await readFile(fernYmlPath, "utf8");
            expect(after).toBe(original);
        });

        it("preserves comments and formatting when adding overrides", async () => {
            const fernYmlPath = AbsoluteFilePath.of(join(testDir, "fern.yml"));
            const specFilePath = AbsoluteFilePath.of(join(testDir, "openapi.yml"));
            await writeFile(
                fernYmlPath,
                `# API configuration
api:
  specs:
    # Main spec
    - openapi: ./openapi.yml
`
            );

            const editor = await FernYmlEditor.load({ fernYmlPath });
            const overridePath = AbsoluteFilePath.of(join(testDir, "overrides.yml"));
            await editor.addOverride(specFilePath, overridePath);
            await editor.save();

            const result = await readFile(fernYmlPath, "utf8");
            expect(result).toContain("# API configuration");
            expect(result).toContain("# Main spec");
            expect(result).toContain("overrides: ./overrides.yml");
        });

        it("preserves comments and formatting when removing overrides", async () => {
            const fernYmlPath = AbsoluteFilePath.of(join(testDir, "fern.yml"));
            const specFilePath = AbsoluteFilePath.of(join(testDir, "openapi.yml"));
            await writeFile(
                fernYmlPath,
                `# API configuration
api:
  specs:
    # Main spec
    - openapi: ./openapi.yml
      overrides: ./overrides.yml
`
            );

            const editor = await FernYmlEditor.load({ fernYmlPath });
            await editor.removeOverrides(specFilePath);
            await editor.save();

            const result = await readFile(fernYmlPath, "utf8");
            expect(result).toContain("# API configuration");
            expect(result).toContain("# Main spec");
            expect(result).not.toContain("overrides");
        });
    });

    describe("addOverride — api $ref section", () => {
        it("edits the referenced file when api uses $ref", async () => {
            const fernYmlPath = AbsoluteFilePath.of(join(testDir, "fern.yml"));
            const specFilePath = AbsoluteFilePath.of(join(testDir, "openapi.yml"));
            const apiYmlPath = join(testDir, "api.yml");
            await writeFile(
                fernYmlPath,
                `api:
  $ref: ./api.yml
`
            );
            await writeFile(
                apiYmlPath,
                `specs:
  - openapi: ./openapi.yml
`
            );

            const editor = await FernYmlEditor.load({ fernYmlPath });
            const overridePath = AbsoluteFilePath.of(join(testDir, "openapi-overrides.yml"));
            await editor.addOverride(specFilePath, overridePath);
            await editor.save();

            // fern.yml should be unchanged
            const fernContent = await readFile(fernYmlPath, "utf8");
            expect(fernContent).toContain("$ref: ./api.yml");

            // api.yml should have the override added
            const apiContent = await readFile(apiYmlPath, "utf8");
            expect(apiContent).toContain("overrides: ./openapi-overrides.yml");
        });

        it("removes overrides from the referenced file", async () => {
            const fernYmlPath = AbsoluteFilePath.of(join(testDir, "fern.yml"));
            const specFilePath = AbsoluteFilePath.of(join(testDir, "openapi.yml"));
            const apiYmlPath = join(testDir, "api.yml");
            await writeFile(
                fernYmlPath,
                `api:
  $ref: ./api.yml
`
            );
            await writeFile(
                apiYmlPath,
                `specs:
  - openapi: ./openapi.yml
    overrides: ./overrides.yml
`
            );

            const editor = await FernYmlEditor.load({ fernYmlPath });
            const edit = await editor.removeOverrides(specFilePath);
            await editor.save();

            expect(edit?.removed).toEqual(["./overrides.yml"]);
            const apiContent = await readFile(apiYmlPath, "utf8");
            expect(apiContent).not.toContain("overrides");
        });
    });
});
