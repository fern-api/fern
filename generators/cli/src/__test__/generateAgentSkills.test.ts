import { lstat, mkdir, mkdtemp, readFile, readlink, rm, writeFile } from "fs/promises";
import os from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { DetectedAuthBinding } from "../detectAuth.js";
import { generateAgentSkills } from "../generateAgentSkills.js";
import type { SubClientField } from "../generateSdkGlue.js";

describe("generateAgentSkills", () => {
    let tmpDir: string;
    let outputDir: string;
    let specsDir: string;

    beforeEach(async () => {
        tmpDir = await mkdtemp(path.join(os.tmpdir(), "agentSkills-"));
        outputDir = path.join(tmpDir, "out");
        specsDir = path.join(tmpDir, "specs");
        await mkdir(outputDir, { recursive: true });
        await mkdir(specsDir, { recursive: true });
    });

    afterEach(async () => {
        await rm(tmpDir, { recursive: true, force: true });
    });

    const subClients: SubClientField[] = [
        { fieldName: "pets", typeName: "PetsClient" },
        { fieldName: "owners", typeName: "OwnersClient" }
    ];

    const authBindings: DetectedAuthBinding[] = [
        {
            schemeName: "bearer",
            rustCall: '.auth(BearerAuth::new("bearer").env("PETSTORE_TOKEN"))',
            placement: "root",
            authTypeImport: "BearerAuth",
            envVars: ["PETSTORE_TOKEN"],
            kind: "bearer"
        }
    ];

    async function stageSpec(spec: object): Promise<void> {
        await writeFile(path.join(specsDir, "openapi0.json"), JSON.stringify(spec));
        await writeFile(
            path.join(specsDir, "specs-manifest.json"),
            JSON.stringify({
                specs: [{ type: "openapi", specPath: path.join(specsDir, "openapi0.json") }]
            })
        );
    }

    it("generates SKILL.md under .agents/skills/custom-commands/", async () => {
        await stageSpec({
            openapi: "3.0.0",
            info: { title: "Petstore" },
            paths: {
                "/pets/{petId}": {
                    get: {
                        operationId: "getPet",
                        summary: "Fetch a pet by ID",
                        tags: ["Pets"],
                        parameters: [{ name: "petId", in: "path", required: true }]
                    }
                }
            }
        });

        await generateAgentSkills({
            outputDir,
            binaryName: "petstore",
            sdkCrateName: "petstore-sdk",
            subClients,
            authBindings,
            specsDir
        });

        const skillPath = path.join(outputDir, ".agents", "skills", "custom-commands", "SKILL.md");
        const content = await readFile(skillPath, "utf-8");

        // Has frontmatter
        expect(content).toContain("---");
        expect(content).toContain("name: petstore-custom-commands");
        expect(content).toContain("description:");

        // References actual binary name
        expect(content).toContain("`petstore`");

        // References actual SDK crate
        expect(content).toContain("petstore_sdk");

        // References real endpoint from spec
        expect(content).toContain("get_pet");
        expect(content).toContain("petId");

        // References real sub-clients
        expect(content).toContain("client.pets");
        expect(content).toContain("PetsClient");

        // Documents auth
        expect(content).toContain("PETSTORE_TOKEN");

        // Documents .fernignore protection
        expect(content).toContain(".fernignore");
        expect(content).toContain("custom.rs");
    });

    it("creates .claude symlink pointing to .agents", async () => {
        await stageSpec({ openapi: "3.0.0", paths: {} });

        await generateAgentSkills({
            outputDir,
            binaryName: "petstore",
            sdkCrateName: "petstore-sdk",
            subClients,
            authBindings: [],
            specsDir
        });

        const claudePath = path.join(outputDir, ".claude");
        const stat = await lstat(claudePath);
        expect(stat.isSymbolicLink()).toBe(true);

        const target = await readlink(claudePath);
        expect(target).toBe(".agents");
    });

    it("picks a GET endpoint with path params as the example", async () => {
        await stageSpec({
            openapi: "3.0.0",
            paths: {
                "/widgets": {
                    post: {
                        operationId: "createWidget",
                        tags: ["Widgets"]
                    }
                },
                "/widgets/{widgetId}": {
                    get: {
                        operationId: "getWidget",
                        summary: "Get a widget",
                        tags: ["Widgets"],
                        parameters: [{ name: "widgetId", in: "path", required: true }]
                    }
                }
            }
        });

        await generateAgentSkills({
            outputDir,
            binaryName: "acme",
            sdkCrateName: "acme-sdk",
            subClients: [{ fieldName: "widgets", typeName: "WidgetsClient" }],
            authBindings: [],
            specsDir
        });

        const content = await readFile(
            path.join(outputDir, ".agents", "skills", "custom-commands", "SKILL.md"),
            "utf-8"
        );

        // Should pick the GET with path param, not the POST
        expect(content).toContain("get_widget");
        expect(content).toContain("widgetId");
    });

    it("renders a generic example when no spec endpoints are available", async () => {
        await stageSpec({ openapi: "3.0.0", paths: {} });

        await generateAgentSkills({
            outputDir,
            binaryName: "acme",
            sdkCrateName: "acme-sdk",
            subClients: [{ fieldName: "items", typeName: "ItemsClient" }],
            authBindings: [],
            specsDir
        });

        const content = await readFile(
            path.join(outputDir, ".agents", "skills", "custom-commands", "SKILL.md"),
            "utf-8"
        );

        // Falls back to generic example
        expect(content).toContain("my-command");
        expect(content).toContain("client.items");
    });

    it("includes sub-client table with all discovered clients", async () => {
        await stageSpec({ openapi: "3.0.0", paths: {} });

        await generateAgentSkills({
            outputDir,
            binaryName: "petstore",
            sdkCrateName: "petstore-sdk",
            subClients,
            authBindings: [],
            specsDir
        });

        const content = await readFile(
            path.join(outputDir, ".agents", "skills", "custom-commands", "SKILL.md"),
            "utf-8"
        );

        expect(content).toContain("| `client.pets` | `petstore_sdk::api::PetsClient` |");
        expect(content).toContain("| `client.owners` | `petstore_sdk::api::OwnersClient` |");
    });
});
