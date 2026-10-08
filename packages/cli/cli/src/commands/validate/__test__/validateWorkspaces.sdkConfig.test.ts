import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { loadProjectFromDirectory } from "@fern-api/project-loader";
import { createMockTaskContext } from "@fern-api/task-context";
import { afterEach, describe, expect, it, vi } from "vitest";
import YAML from "yaml";

import type { CliContext } from "../../../cli-context/CliContext.js";
import { validateWorkspaces } from "../validateWorkspaces.js";

describe("validateWorkspaces with SDK Config-only APIs", () => {
    const temporaryDirectories: string[] = [];

    afterEach(async () => {
        await Promise.all(
            temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true }))
        );
    });

    it("materializes and validates a named SDK Config-only API", async () => {
        const fernDirectory = await mkdtemp(path.join(tmpdir(), "fern-check-sdk-config-"));
        temporaryDirectories.push(fernDirectory);
        const apiDirectory = path.join(fernDirectory, "apis", "payments");
        await mkdir(apiDirectory, { recursive: true });
        await writeFile(path.join(fernDirectory, "fern.config.json"), '{"organization":"test","version":"*"}\n');
        await writeFile(
            path.join(apiDirectory, "openapi.yml"),
            "openapi: 3.0.0\ninfo:\n  title: Payments\n  version: 1.0.0\npaths: {}\n"
        );
        await writeFile(
            path.join(apiDirectory, "sdk-config.yml"),
            YAML.stringify({
                schemaVersion: "sdk-config/v1",
                sdkName: "payments",
                source: { specs: [{ id: "payments", type: "openapi", path: "./openapi.yml" }] },
                targets: [{ language: "typescript", output: { delivery: "files" } }]
            })
        );

        const taskContext = createMockTaskContext();
        const project = await loadProjectFromDirectory({
            absolutePathToFernDirectory: AbsoluteFilePath.of(fernDirectory),
            cliName: "fern",
            cliVersion: "0.0.0",
            commandLineApiWorkspace: undefined,
            defaultToAllApiWorkspaces: true,
            context: taskContext
        });
        const validatedWorkspaceNames: Array<string | undefined> = [];
        const cliContext = {
            environment: { packageVersion: "0.0.0" },
            failAndThrow: taskContext.failAndThrow.bind(taskContext),
            instrumentPostHogEvent: vi.fn(),
            isJsonMode: false,
            runTask: vi.fn(async (task) => task(taskContext)),
            runTaskForWorkspace: vi.fn(async (workspace, task) => {
                validatedWorkspaceNames.push(workspace.workspaceName);
                return task(taskContext);
            })
        } as unknown as CliContext;

        await validateWorkspaces({
            project,
            cliContext,
            logWarnings: false,
            brokenLinks: false,
            errorOnBrokenLinks: false,
            commandLineApiWorkspace: "payments"
        });

        expect(validatedWorkspaceNames).toContain("payments");
    });

    it("rejects direct RubyGems publishing in an SDK Config target", async () => {
        const fernDirectory = await mkdtemp(path.join(tmpdir(), "fern-check-sdk-config-rubygems-"));
        temporaryDirectories.push(fernDirectory);
        const apiDirectory = path.join(fernDirectory, "apis", "payments");
        await mkdir(apiDirectory, { recursive: true });
        await writeFile(path.join(fernDirectory, "fern.config.json"), '{"organization":"test","version":"*"}\n');
        await writeFile(
            path.join(apiDirectory, "openapi.yml"),
            "openapi: 3.0.0\ninfo:\n  title: Payments\n  version: 1.0.0\npaths: {}\n"
        );
        await writeFile(
            path.join(apiDirectory, "sdk-config.yml"),
            YAML.stringify({
                schemaVersion: "sdk-config/v1",
                sdkName: "payments",
                source: { specs: [{ id: "payments", type: "openapi", path: "./openapi.yml" }] },
                targets: [
                    {
                        language: "ruby",
                        package: { packageName: "payments" },
                        output: { delivery: "files", publish: { registry: "rubygems" } }
                    }
                ]
            })
        );

        const taskContext = createMockTaskContext();
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

        await expect(
            validateWorkspaces({
                project,
                cliContext,
                logWarnings: false,
                brokenLinks: false,
                errorOnBrokenLinks: false
            })
        ).rejects.toThrow("target 0 (ruby): Direct RubyGems publishing is not supported");
    });
});
