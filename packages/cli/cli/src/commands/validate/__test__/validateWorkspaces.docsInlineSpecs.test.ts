import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { loadProjectFromDirectory } from "@fern-api/project-loader";
import { createMockTaskContext } from "@fern-api/task-context";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { CliContext } from "../../../cli-context/CliContext.js";
import { validateWorkspaces } from "../validateWorkspaces.js";

const DOCS_YML = [
    "instances:",
    "  - url: plants.docs.buildwithfern.com",
    "navigation:",
    "  - api: API Reference",
    "    specs:",
    "      - type: openapi",
    "        path: openapi/openapi.yml",
    ""
].join("\n");

function openApiSpec(plantSchemaRef: string): string {
    return [
        "openapi: 3.0.0",
        "info:",
        "  title: Plants",
        "  version: 1.0.0",
        "paths:",
        "  /plants:",
        "    get:",
        "      operationId: listPlants",
        "      responses:",
        '        "200":',
        "          description: OK",
        "          content:",
        "            application/json:",
        "              schema:",
        `                $ref: "${plantSchemaRef}"`,
        "components:",
        "  schemas:",
        "    Plant:",
        "      type: object",
        "      properties:",
        "        name:",
        "          type: string",
        ""
    ].join("\n");
}

describe("validateWorkspaces with docs.yml inline specs and no generators.yml", () => {
    const temporaryDirectories: string[] = [];

    afterEach(async () => {
        await Promise.all(
            temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true }))
        );
    });

    async function check(plantSchemaRef: string): Promise<{ apiWorkspaceCount: number; messages: string[] }> {
        const fernDirectory = await mkdtemp(path.join(tmpdir(), "fern-check-docs-inline-specs-"));
        temporaryDirectories.push(fernDirectory);
        await mkdir(path.join(fernDirectory, "openapi"));
        await writeFile(path.join(fernDirectory, "fern.config.json"), '{"organization":"test","version":"*"}\n');
        await writeFile(path.join(fernDirectory, "docs.yml"), DOCS_YML);
        await writeFile(path.join(fernDirectory, "openapi", "openapi.yml"), openApiSpec(plantSchemaRef));

        const messages: string[] = [];
        const record = (...args: string[]) => {
            messages.push(args.join(" "));
        };
        const taskContext = createMockTaskContext({
            logger: {
                disable: vi.fn(),
                enable: vi.fn(),
                trace: vi.fn(),
                debug: vi.fn(),
                info: record,
                warn: record,
                error: record,
                log: (_level, ...args) => record(...args)
            }
        });
        const project = await loadProjectFromDirectory({
            absolutePathToFernDirectory: AbsoluteFilePath.of(fernDirectory),
            cliName: "fern",
            cliVersion: "0.0.0",
            commandLineApiWorkspace: undefined,
            defaultToAllApiWorkspaces: true,
            context: taskContext
        });
        const cliContext = {
            environment: { packageVersion: "0.0.0" },
            failAndThrow: taskContext.failAndThrow.bind(taskContext),
            instrumentPostHogEvent: vi.fn(),
            isJsonMode: false,
            runTask: vi.fn(async (task) => task(taskContext)),
            runTaskForWorkspace: vi.fn(async (_workspace, task) => task(taskContext))
        } as unknown as CliContext;

        await validateWorkspaces({
            project,
            cliContext,
            logWarnings: true,
            brokenLinks: false,
            errorOnBrokenLinks: false
        });
        return { apiWorkspaceCount: project.apiWorkspaces.length, messages };
    }

    it("does not report an invalid reference for a valid inline spec", async () => {
        const { apiWorkspaceCount, messages } = await check("#/components/schemas/Plant");
        expect(apiWorkspaceCount).toBe(0);
        expect(messages.join("\n")).not.toContain("invalid OpenAPI reference");
    });

    it("validates local references in an inline spec", async () => {
        const { apiWorkspaceCount, messages } = await check("#/components/schemas/MissingPlant");
        expect(apiWorkspaceCount).toBe(0);
        expect(messages.join("\n")).toContain("#/components/schemas/MissingPlant");
    });
});
