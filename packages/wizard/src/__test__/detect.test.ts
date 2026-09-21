import { mkdir, mkdtemp, rm, writeFile } from "fs/promises";
import os from "os";
import path from "path";
import { describe, expect, it } from "vitest";
import { detectAgents } from "../detect/agents";
import { detectDocsTools } from "../detect/docs";
import { detectFrameworks } from "../detect/frameworks";
import { detectFernProject } from "../detect/project";
import { detectApiSpecs } from "../detect/specs";

async function fixture(): Promise<string> {
    return mkdtemp(path.join(os.tmpdir(), "fern-wizard-"));
}

describe("repository detection", () => {
    it("detects OpenAPI YAML with a title", async () => {
        const dir = await fixture();
        await writeFile(path.join(dir, "openapi.yaml"), "openapi: 3.1.0\ninfo:\n  title: Pets\n");
        await expect(detectApiSpecs(dir)).resolves.toEqual([
            { path: "openapi.yaml", format: "openapi", title: "Pets", version: "3.1.0" }
        ]);
        await rm(dir, { recursive: true, force: true });
    });

    it("detects Swagger 2 JSON and AsyncAPI", async () => {
        const dir = await fixture();
        await writeFile(path.join(dir, "swagger.json"), '{"swagger":"2.0","info":{"title":"Legacy"}}');
        await writeFile(path.join(dir, "events.yml"), "asyncapi: 2.6.0\ninfo:\n  title: Events\n");
        await expect(detectApiSpecs(dir)).resolves.toEqual([
            { path: "events.yml", format: "asyncapi", title: "Events", version: "2.6.0" },
            { path: "swagger.json", format: "openapi", title: "Legacy", version: "2.0" }
        ]);
        await rm(dir, { recursive: true, force: true });
    });

    it("ignores non-spec YAML and node_modules", async () => {
        const dir = await fixture();
        await mkdir(path.join(dir, "node_modules"), { recursive: true });
        await writeFile(path.join(dir, "config.yml"), "name: example\n");
        await writeFile(path.join(dir, "node_modules", "hidden.yml"), "openapi: 3.0.0\n");
        await expect(detectApiSpecs(dir)).resolves.toEqual([]);
        await rm(dir, { recursive: true, force: true });
    });

    it("detects frameworks", async () => {
        const dir = await fixture();
        await writeFile(path.join(dir, "package.json"), '{"dependencies":{"express":"^4.0.0"}}');
        await writeFile(path.join(dir, "requirements.txt"), "fastapi==0.100.0\n");
        await expect(detectFrameworks(dir)).resolves.toEqual([
            { name: "express", language: "typescript", canGenerateOpenApi: false },
            { name: "fastapi", language: "python", canGenerateOpenApi: true }
        ]);
        await rm(dir, { recursive: true, force: true });
    });

    it("detects Mintlify and coding agents", async () => {
        const dir = await fixture();
        await writeFile(path.join(dir, "mint.json"), '{"name":"Docs","navigation":[]}');
        await mkdir(path.join(dir, ".cursor"), { recursive: true });
        await writeFile(path.join(dir, "CLAUDE.md"), "# Instructions\n");
        await expect(detectDocsTools(dir)).resolves.toEqual([{ name: "mintlify", path: "mint.json" }]);
        await expect(detectAgents(dir)).resolves.toEqual(["cursor", "claude-code"]);
        await rm(dir, { recursive: true, force: true });
    });

    it("detects an existing Fern project", async () => {
        const dir = await fixture();
        await mkdir(path.join(dir, "fern"), { recursive: true });
        await writeFile(path.join(dir, "fern", "fern.config.json"), "{}");
        await expect(detectFernProject(dir)).resolves.toEqual({ exists: true, path: "fern/", docsConfigExists: false });
        await rm(dir, { recursive: true, force: true });
    });
});
