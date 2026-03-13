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
            editor.setTargetVersion("typescript", "2.0.0");
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
            editor.setTargetVersion("typescript", "2.0.0");
            await editor.save();

            const content = await readFile(fernYmlPath, "utf-8");
            expect(content).toContain("# SDK configuration");
        });
    });

    describe("$ref resolution", () => {
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
            editor.setTargetVersion("typescript", "2.0.0");
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
            editor.addTarget("python", { version: "2.0.0", output: "./sdks/python" });
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
            editor.addTarget("typescript", { output: "./sdks/typescript" });
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
            editor.addTarget("python", { version: "2.0.0", output: "./sdks/python" });
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
            editor.setTargetConfig("typescript", { streamType: "wrapper" });
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
            editor.setTargetConfig("typescript", { streamType: "wrapper", fetchSupport: "node-fetch" });
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
            editor.deleteTargetConfig("typescript");
            await editor.save();

            const content = await readFile(fernYmlPath, "utf-8");
            expect(content).not.toContain("config:");
            expect(content).not.toContain("streamType");
            expect(content).toContain('version: "1.0.0"');
        });
    });
});
