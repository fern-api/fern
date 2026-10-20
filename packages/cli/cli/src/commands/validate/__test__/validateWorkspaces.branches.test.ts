import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { collectAPIWorkspaceViolations } from "@fern-api/api-workspace-validator";
import { createInlineSpecOssWorkspaces, filterOssWorkspaces } from "@fern-api/docs-resolver";
import type { ValidationViolation } from "@fern-api/fern-definition-validator";
import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";
import { LazyFernWorkspace, OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import { createLogger, LogLevel } from "@fern-api/logger";
import type { Project } from "@fern-api/project-loader";
import { CliError, createMockTaskContext } from "@fern-api/task-context";
import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import YAML from "yaml";

import type { CliContext } from "../../../cli-context/CliContext.js";
import { createSdkConfigWorkspace } from "../../generate/createSdkConfigWorkspace.js";
import { collectDocsWorkspaceViolations } from "../validateDocsWorkspaceAndLogIssues.js";
import { validateWorkspaces } from "../validateWorkspaces.js";

vi.mock("@fern-api/docs-resolver", async (importOriginal) => ({
    ...(await importOriginal<typeof import("@fern-api/docs-resolver")>()),
    filterOssWorkspaces: vi.fn(),
    createInlineSpecOssWorkspaces: vi.fn()
}));

vi.mock("@fern-api/api-workspace-validator", async (importOriginal) => ({
    ...(await importOriginal<typeof import("@fern-api/api-workspace-validator")>()),
    collectAPIWorkspaceViolations: vi.fn()
}));

vi.mock("../validateDocsWorkspaceAndLogIssues.js", () => ({
    collectDocsWorkspaceViolations: vi.fn()
}));

vi.mock("../../generate/createSdkConfigWorkspace.js", () => ({
    createSdkConfigWorkspace: vi.fn()
}));

const RUBYGEMS_TARGET = {
    language: "ruby",
    package: { packageName: "acme" },
    output: { delivery: "files", publish: { registry: "rubygems" } }
};
const GITHUB_RUBYGEMS_TARGET = {
    language: "ruby",
    package: { packageName: "acme" },
    output: { delivery: "github", github: { repository: "acme/acme-ruby" }, publish: { registry: "rubygems" } }
};
const TYPESCRIPT_TARGET = { language: "typescript", output: { delivery: "files" } };
const INVALID_YAML = "targets: [this is: not valid yaml";

interface FakeApiWorkspace {
    workspaceName: string | undefined;
    type: string;
    absoluteFilePath: AbsoluteFilePath;
    generatorsConfiguration: { groups: unknown[] } | undefined;
    toFernWorkspace: Mock<(args: { context: unknown }) => Promise<unknown>>;
    getIntermediateRepresentation?: Mock<(args: unknown) => Promise<unknown>>;
}

function violation(severity: ValidationViolation["severity"], name?: string): ValidationViolation {
    return {
        name,
        severity,
        message: `${severity} from ${name ?? "unnamed"}`,
        relativeFilepath: RelativeFilePath.of("api.yml"),
        nodePath: []
    };
}

describe("validateWorkspaces branches", () => {
    let root: string;
    let log: Mock<(level: LogLevel, ...args: string[]) => void>;
    let cliContext: CliContext;
    let cleanups: Array<Mock<() => Promise<void>>>;

    beforeEach(async () => {
        root = await mkdtemp(path.join(tmpdir(), "fern-validate-branches-"));
        log = vi.fn<(level: LogLevel, ...args: string[]) => void>();
        const taskContext = createMockTaskContext({ logger: createLogger(log) });
        cliContext = {
            environment: { packageVersion: "9.9.9" },
            failAndThrow: vi.fn(taskContext.failAndThrow.bind(taskContext)),
            instrumentPostHogEvent: vi.fn(),
            isJsonMode: false,
            writeJsonToStdout: vi.fn(),
            runTask: vi.fn(async (task) => task(taskContext)),
            runTaskForWorkspace: vi.fn(async (_workspace, task) => task(taskContext))
        } as unknown as CliContext;

        cleanups = [];
        vi.mocked(filterOssWorkspaces).mockReset().mockResolvedValue([]);
        vi.mocked(createInlineSpecOssWorkspaces).mockReset().mockReturnValue([]);
        vi.mocked(collectDocsWorkspaceViolations)
            .mockReset()
            .mockResolvedValue({ violations: [], elapsedMillis: 1, hasErrors: false });
        vi.mocked(collectAPIWorkspaceViolations)
            .mockReset()
            .mockImplementation(async ({ workspace }) => ({
                apiName: String((workspace as unknown as { apiName: string }).apiName),
                violations: [],
                elapsedMillis: 1,
                hasErrors: false
            }));
        vi.mocked(createSdkConfigWorkspace)
            .mockReset()
            .mockImplementation(async ({ workspaceName }) => {
                const cleanup = vi.fn(async () => undefined);
                cleanups.push(cleanup);
                return { workspace: apiWorkspace({ name: workspaceName }) as never, cleanup };
            });
    });

    afterEach(async () => {
        await rm(root, { recursive: true, force: true });
    });

    function apiWorkspace({
        name,
        type = "fern",
        groups,
        directory = root,
        kind = "plain"
    }: {
        name: string | undefined;
        type?: string;
        /** Number of generator groups; undefined means no generators configuration at all. */
        groups?: number;
        directory?: string;
        kind?: "plain" | "oss" | "lazy";
    }): FakeApiWorkspace {
        const fernWorkspace = { apiName: name ?? "default" };
        const fields: FakeApiWorkspace = {
            workspaceName: name,
            type,
            absoluteFilePath: AbsoluteFilePath.of(directory),
            generatorsConfiguration: groups == null ? undefined : { groups: Array.from({ length: groups }) },
            toFernWorkspace: vi.fn(async () => fernWorkspace)
        };
        if (kind === "oss") {
            return Object.assign(Object.create(OSSWorkspace.prototype), fields, {
                getIntermediateRepresentation: vi.fn(async () => undefined)
            });
        }
        if (kind === "lazy") {
            return Object.assign(Object.create(LazyFernWorkspace.prototype), fields);
        }
        return fields;
    }

    async function directory(name: string, files: Record<string, string> = {}): Promise<string> {
        const absolutePath = path.join(root, name);
        await mkdir(absolutePath, { recursive: true });
        for (const [filename, contents] of Object.entries(files)) {
            await mkdir(path.dirname(path.join(absolutePath, filename)), { recursive: true });
            await writeFile(path.join(absolutePath, filename), contents);
        }
        return absolutePath;
    }

    function sdkConfigYml(targets: unknown[]): string {
        return YAML.stringify({
            schemaVersion: "sdk-config/v1",
            sdkName: "acme",
            source: { specs: [{ id: "acme", type: "openapi", path: "./openapi.yml" }] },
            targets
        });
    }

    function projectOf({
        apiWorkspaces = [],
        sdkConfigWorkspaces,
        docsWorkspace
    }: {
        apiWorkspaces?: FakeApiWorkspace[];
        sdkConfigWorkspaces?: Array<{ absoluteFilePath: string; workspaceName: string | undefined }>;
        docsWorkspace?: unknown;
    }): Project {
        return {
            apiWorkspaces,
            sdkConfigWorkspaces: sdkConfigWorkspaces?.map((owner) => ({
                ...owner,
                absoluteFilePath: AbsoluteFilePath.of(owner.absoluteFilePath)
            })),
            docsWorkspaces: docsWorkspace
        } as unknown as Project;
    }

    function sdkConfigOwner(name: string, directoryPath: string) {
        return { absoluteFilePath: directoryPath, workspaceName: name };
    }

    async function validate(
        project: Project,
        options: {
            commandLineApiWorkspace?: string;
            logWarnings?: boolean;
            brokenLinks?: boolean;
            errorOnBrokenLinks?: boolean;
            directFromOpenapi?: boolean;
        } = {}
    ): Promise<void> {
        await validateWorkspaces({
            project,
            cliContext,
            logWarnings: options.logWarnings ?? false,
            brokenLinks: options.brokenLinks ?? false,
            errorOnBrokenLinks: options.errorOnBrokenLinks ?? false,
            directFromOpenapi: options.directFromOpenapi,
            commandLineApiWorkspace: options.commandLineApiWorkspace
        });
    }

    function validatedNames(): Array<string | undefined> {
        return vi
            .mocked(cliContext.runTaskForWorkspace)
            .mock.calls.map(([workspace]) => (workspace as { workspaceName: string | undefined }).workspaceName);
    }

    function postHogProperties(): Record<string, unknown> | undefined {
        return vi.mocked(cliContext.instrumentPostHogEvent).mock.calls[0]?.[0]?.properties;
    }

    describe("SDK Config-only workspaces", () => {
        it("materializes one workspace per SDK Config workspace and validates it after the API workspaces", async () => {
            const alpha = await directory("alpha", { "sdk-config.yml": sdkConfigYml([TYPESCRIPT_TARGET]) });
            const beta = await directory("beta", { "sdk-config.yml": sdkConfigYml([TYPESCRIPT_TARGET]) });
            const project = projectOf({
                apiWorkspaces: [apiWorkspace({ name: "legacy", groups: 1 })],
                sdkConfigWorkspaces: [sdkConfigOwner("alpha", alpha), sdkConfigOwner("beta", beta)]
            });

            await validate(project);

            expect(vi.mocked(createSdkConfigWorkspace)).toHaveBeenCalledTimes(2);
            expect(vi.mocked(createSdkConfigWorkspace).mock.calls[0]?.[0]).toMatchObject({
                workspaceName: "alpha",
                cliVersion: "9.9.9",
                absolutePathToConfig: path.join(alpha, "sdk-config.yml"),
                sdkConfig: { sdkName: "acme" }
            });
            expect(vi.mocked(createSdkConfigWorkspace).mock.calls[1]?.[0]).toMatchObject({
                workspaceName: "beta",
                absolutePathToConfig: path.join(beta, "sdk-config.yml")
            });
            expect(validatedNames()).toEqual(["legacy", "alpha", "beta"]);
        });

        it("does not touch the project's own workspace list", async () => {
            const alpha = await directory("alpha", { "sdk-config.yml": sdkConfigYml([TYPESCRIPT_TARGET]) });
            const project = projectOf({ sdkConfigWorkspaces: [sdkConfigOwner("alpha", alpha)] });

            await validate(project);

            expect(project.apiWorkspaces).toEqual([]);
        });

        it.each([
            { name: "undefined", sdkConfigWorkspaces: undefined },
            { name: "empty", sdkConfigWorkspaces: [] }
        ])("creates nothing when sdkConfigWorkspaces is $name", async ({ sdkConfigWorkspaces }) => {
            await validate(
                projectOf({ apiWorkspaces: [apiWorkspace({ name: "legacy", groups: 1 })], sdkConfigWorkspaces })
            );

            expect(vi.mocked(createSdkConfigWorkspace)).not.toHaveBeenCalled();
        });

        it("cleans up every materialized workspace after a successful run", async () => {
            const alpha = await directory("alpha", { "sdk-config.yml": sdkConfigYml([TYPESCRIPT_TARGET]) });
            const beta = await directory("beta", { "sdk-config.yml": sdkConfigYml([TYPESCRIPT_TARGET]) });

            await validate(
                projectOf({ sdkConfigWorkspaces: [sdkConfigOwner("alpha", alpha), sdkConfigOwner("beta", beta)] })
            );

            expect(cleanups).toHaveLength(2);
            for (const cleanup of cleanups) {
                expect(cleanup).toHaveBeenCalledOnce();
            }
        });

        it("cleans up every materialized workspace when validation fails", async () => {
            const alpha = await directory("alpha", { "sdk-config.yml": sdkConfigYml([TYPESCRIPT_TARGET]) });
            vi.mocked(collectAPIWorkspaceViolations).mockResolvedValue({
                apiName: "alpha",
                violations: [violation("error", "some-rule")],
                elapsedMillis: 1,
                hasErrors: true
            });

            await expect(
                validate(projectOf({ sdkConfigWorkspaces: [sdkConfigOwner("alpha", alpha)] }))
            ).rejects.toBeDefined();

            expect(cleanups).toHaveLength(1);
            expect(cleanups[0]).toHaveBeenCalledOnce();
        });

        it("rejects direct RubyGems publishing, cleaning up earlier workspaces and skipping all validation", async () => {
            const alpha = await directory("alpha", { "sdk-config.yml": sdkConfigYml([TYPESCRIPT_TARGET]) });
            const beta = await directory("beta", { "sdk-config.yml": sdkConfigYml([RUBYGEMS_TARGET]) });

            await expect(
                validate(
                    projectOf({ sdkConfigWorkspaces: [sdkConfigOwner("alpha", alpha), sdkConfigOwner("beta", beta)] })
                )
            ).rejects.toThrow(
                `SDK Config v1 at ${path.join(beta, "sdk-config.yml")} failed validation: target 0 (ruby): Direct RubyGems publishing is not supported`
            );

            expect(vi.mocked(createSdkConfigWorkspace)).toHaveBeenCalledTimes(1);
            expect(cleanups).toHaveLength(1);
            expect(cleanups[0]).toHaveBeenCalledOnce();
            expect(vi.mocked(cliContext.runTaskForWorkspace)).not.toHaveBeenCalled();
            // The failure happens before the try block that reports telemetry
            expect(vi.mocked(cliContext.instrumentPostHogEvent)).not.toHaveBeenCalled();
        });

        it("allows RubyGems publishing delivered through GitHub", async () => {
            const alpha = await directory("alpha", { "sdk-config.yml": sdkConfigYml([GITHUB_RUBYGEMS_TARGET]) });

            await validate(projectOf({ sdkConfigWorkspaces: [sdkConfigOwner("alpha", alpha)] }));

            expect(validatedNames()).toEqual(["alpha"]);
        });

        it("cleans up earlier workspaces and rethrows when materializing a later one fails", async () => {
            const alpha = await directory("alpha", { "sdk-config.yml": sdkConfigYml([TYPESCRIPT_TARGET]) });
            const beta = await directory("beta", { "sdk-config.yml": sdkConfigYml([TYPESCRIPT_TARGET]) });
            vi.mocked(createSdkConfigWorkspace)
                .mockReset()
                .mockImplementationOnce(async ({ workspaceName }) => {
                    const cleanup = vi.fn(async () => undefined);
                    cleanups.push(cleanup);
                    return { workspace: apiWorkspace({ name: workspaceName }) as never, cleanup };
                })
                .mockRejectedValueOnce(new Error("cannot materialize beta"));

            await expect(
                validate(
                    projectOf({ sdkConfigWorkspaces: [sdkConfigOwner("alpha", alpha), sdkConfigOwner("beta", beta)] })
                )
            ).rejects.toThrow("cannot materialize beta");

            expect(cleanups).toHaveLength(1);
            expect(cleanups[0]).toHaveBeenCalledOnce();
        });

        it("fails on an SDK Config workspace whose sdk-config.yml is missing", async () => {
            const missing = await directory("missing");

            await expect(
                validate(projectOf({ sdkConfigWorkspaces: [sdkConfigOwner("missing", missing)] }))
            ).rejects.toThrow(/ENOENT/);
        });

        it("materializes and loads every SDK Config workspace even when --api selects another one", async () => {
            const alpha = await directory("alpha", { "sdk-config.yml": sdkConfigYml([TYPESCRIPT_TARGET]) });
            const beta = await directory("beta", { "sdk-config.yml": sdkConfigYml([TYPESCRIPT_TARGET]) });

            await validate(
                projectOf({ sdkConfigWorkspaces: [sdkConfigOwner("alpha", alpha), sdkConfigOwner("beta", beta)] }),
                { commandLineApiWorkspace: "alpha" }
            );

            expect(vi.mocked(createSdkConfigWorkspace)).toHaveBeenCalledTimes(2);
            expect(validatedNames()).toEqual(["alpha"]);
            expect(cleanups).toHaveLength(2);
        });

        it("fails on an invalid sdk-config.yml of an SDK Config workspace excluded by --api", async () => {
            const alpha = await directory("alpha", { "sdk-config.yml": sdkConfigYml([TYPESCRIPT_TARGET]) });
            const beta = await directory("beta", { "sdk-config.yml": INVALID_YAML });

            await expect(
                validate(
                    projectOf({ sdkConfigWorkspaces: [sdkConfigOwner("alpha", alpha), sdkConfigOwner("beta", beta)] }),
                    { commandLineApiWorkspace: "alpha" }
                )
            ).rejects.toThrow(`SDK Config v1 at ${path.join(beta, "sdk-config.yml")} is not valid YAML`);
        });
    });

    describe("sdk-config.yml beside an API workspace", () => {
        async function projectWithApiSdkConfigs(
            sdkConfigs: Record<string, string | undefined>
        ): Promise<{ project: Project; directories: Record<string, string> }> {
            const directories: Record<string, string> = {};
            const workspaces: FakeApiWorkspace[] = [];
            for (const [name, contents] of Object.entries(sdkConfigs)) {
                directories[name] = await directory(name, contents == null ? {} : { "sdk-config.yml": contents });
                workspaces.push(apiWorkspace({ name, groups: 1, directory: directories[name] }));
            }
            return { project: projectOf({ apiWorkspaces: workspaces }), directories };
        }

        it("rejects direct RubyGems publishing and validates nothing", async () => {
            const { project, directories } = await projectWithApiSdkConfigs({
                payments: sdkConfigYml([RUBYGEMS_TARGET])
            });

            await expect(validate(project)).rejects.toThrow(
                `SDK Config v1 at ${path.join(directories.payments ?? "", "sdk-config.yml")} failed validation: target 0 (ruby): Direct RubyGems publishing is not supported`
            );

            expect(vi.mocked(cliContext.runTaskForWorkspace)).not.toHaveBeenCalled();
            expect(vi.mocked(cliContext.instrumentPostHogEvent)).not.toHaveBeenCalled();
        });

        it("accepts an API workspace without an sdk-config.yml", async () => {
            const { project } = await projectWithApiSdkConfigs({ payments: undefined });

            await validate(project);

            expect(validatedNames()).toEqual(["payments"]);
        });

        it("accepts RubyGems publishing delivered through GitHub", async () => {
            const { project } = await projectWithApiSdkConfigs({ payments: sdkConfigYml([GITHUB_RUBYGEMS_TARGET]) });

            await validate(project);

            expect(validatedNames()).toEqual(["payments"]);
        });

        it("never materializes a workspace for it", async () => {
            const { project } = await projectWithApiSdkConfigs({ payments: sdkConfigYml([TYPESCRIPT_TARGET]) });

            await validate(project);

            expect(vi.mocked(createSdkConfigWorkspace)).not.toHaveBeenCalled();
        });

        it("fails on an unreadable sdk-config.yml of a selected API", async () => {
            const { project, directories } = await projectWithApiSdkConfigs({ payments: INVALID_YAML });

            await expect(validate(project)).rejects.toThrow(
                `SDK Config v1 at ${path.join(directories.payments ?? "", "sdk-config.yml")} is not valid YAML`
            );
        });

        it("checks every API workspace's file without --api", async () => {
            const { project } = await projectWithApiSdkConfigs({
                payments: sdkConfigYml([TYPESCRIPT_TARGET]),
                billing: sdkConfigYml([RUBYGEMS_TARGET])
            });

            await expect(validate(project)).rejects.toThrow(
                "target 0 (ruby): Direct RubyGems publishing is not supported"
            );
        });

        it("only reads the file of the API selected by --api", async () => {
            const { project } = await projectWithApiSdkConfigs({
                payments: sdkConfigYml([TYPESCRIPT_TARGET]),
                billing: sdkConfigYml([RUBYGEMS_TARGET]),
                orders: INVALID_YAML
            });

            await validate(project, { commandLineApiWorkspace: "payments" });

            expect(validatedNames()).toEqual(["payments"]);
        });

        it("reads no API workspace's file when --api names an unknown API", async () => {
            const { project } = await projectWithApiSdkConfigs({ payments: INVALID_YAML, billing: INVALID_YAML });

            await validate(project, { commandLineApiWorkspace: "nope" });

            expect(vi.mocked(cliContext.runTaskForWorkspace)).not.toHaveBeenCalled();
        });
    });

    describe("--api filtering of API validation", () => {
        it("validates only the workspace named by --api, including a materialized SDK Config one", async () => {
            const alpha = await directory("alpha", { "sdk-config.yml": sdkConfigYml([TYPESCRIPT_TARGET]) });
            const project = projectOf({
                apiWorkspaces: [
                    apiWorkspace({ name: "payments", groups: 1 }),
                    apiWorkspace({ name: "billing", groups: 1 })
                ],
                sdkConfigWorkspaces: [sdkConfigOwner("alpha", alpha)]
            });

            await validate(project, { commandLineApiWorkspace: "alpha" });
            expect(validatedNames()).toEqual(["alpha"]);
        });

        it("validates every workspace without --api", async () => {
            const project = projectOf({
                apiWorkspaces: [
                    apiWorkspace({ name: "payments", groups: 1 }),
                    apiWorkspace({ name: "billing", groups: 1 })
                ]
            });

            await validate(project);

            expect(validatedNames()).toEqual(["payments", "billing"]);
        });

        it("validates nothing and succeeds for an unknown --api name (the existence check lives in cli.ts)", async () => {
            const project = projectOf({ apiWorkspaces: [apiWorkspace({ name: "payments", groups: 1 })] });

            await validate(project, { commandLineApiWorkspace: "nope" });

            expect(vi.mocked(cliContext.runTaskForWorkspace)).not.toHaveBeenCalled();
            expect(postHogProperties()).toMatchObject({ passed: true, abortReason: undefined });
        });

        it("never matches a nameless workspace by --api", async () => {
            const project = projectOf({ apiWorkspaces: [apiWorkspace({ name: undefined, groups: 1 })] });

            await validate(project, { commandLineApiWorkspace: "undefined" });

            expect(vi.mocked(cliContext.runTaskForWorkspace)).not.toHaveBeenCalled();
        });
    });

    describe("docs OSS workspace selection", () => {
        const docsWorkspace = {
            absoluteFilePath: "/fern",
            absoluteFilepathToDocsConfig: "/fern/docs.yml",
            config: { navigation: [{ api: "API Reference", specs: [] }] }
        };

        it("skips docs validation entirely without a docs workspace", async () => {
            await validate(projectOf({ apiWorkspaces: [apiWorkspace({ name: "payments", groups: 1 })] }));

            expect(vi.mocked(filterOssWorkspaces)).not.toHaveBeenCalled();
            expect(vi.mocked(createInlineSpecOssWorkspaces)).not.toHaveBeenCalled();
            expect(vi.mocked(collectDocsWorkspaceViolations)).not.toHaveBeenCalled();
        });

        it("uses the project's OSS workspaces and ignores inline specs when there are any", async () => {
            const oss = [{ workspaceName: "from-project" }];
            vi.mocked(filterOssWorkspaces).mockResolvedValue(oss as never);

            await validate(projectOf({ docsWorkspace }));

            expect(vi.mocked(createInlineSpecOssWorkspaces)).not.toHaveBeenCalled();
            expect(vi.mocked(collectDocsWorkspaceViolations).mock.calls[0]?.[0].ossWorkspaces).toBe(oss);
        });

        it("falls back to docs.yml inline specs when the project has no OSS workspace", async () => {
            const inline = [{ workspaceName: "inline" }];
            vi.mocked(filterOssWorkspaces).mockResolvedValue([]);
            vi.mocked(createInlineSpecOssWorkspaces).mockReturnValue(inline as never);

            await validate(projectOf({ docsWorkspace }));

            expect(vi.mocked(createInlineSpecOssWorkspaces)).toHaveBeenCalledOnce();
            expect(vi.mocked(createInlineSpecOssWorkspaces)).toHaveBeenCalledWith({
                navigation: docsWorkspace.config.navigation,
                absoluteFilepathToDocsConfig: "/fern/docs.yml",
                absoluteFilePathToFernDirectory: "/fern",
                cliVersion: "9.9.9"
            });
            expect(vi.mocked(collectDocsWorkspaceViolations).mock.calls[0]?.[0].ossWorkspaces).toBe(inline);
        });

        it("selects OSS workspaces from the project including the materialized SDK Config workspaces", async () => {
            const alpha = await directory("alpha", { "sdk-config.yml": sdkConfigYml([TYPESCRIPT_TARGET]) });

            await validate(
                projectOf({
                    apiWorkspaces: [apiWorkspace({ name: "payments", groups: 1 })],
                    sdkConfigWorkspaces: [sdkConfigOwner("alpha", alpha)],
                    docsWorkspace
                })
            );

            const selectedFrom = vi.mocked(filterOssWorkspaces).mock.calls[0]?.[0];
            expect(selectedFrom?.apiWorkspaces.map((workspace) => workspace.workspaceName)).toEqual([
                "payments",
                "alpha"
            ]);
        });

        it("hands docs validation every API workspace even when --api narrows API validation", async () => {
            const alpha = await directory("alpha", { "sdk-config.yml": sdkConfigYml([TYPESCRIPT_TARGET]) });

            await validate(
                projectOf({
                    apiWorkspaces: [
                        apiWorkspace({ name: "payments", groups: 1 }),
                        apiWorkspace({ name: "billing", groups: 1 })
                    ],
                    sdkConfigWorkspaces: [sdkConfigOwner("alpha", alpha)],
                    docsWorkspace
                }),
                { commandLineApiWorkspace: "billing" }
            );

            const docsCall = vi.mocked(collectDocsWorkspaceViolations).mock.calls[0]?.[0];
            expect(docsCall?.apiWorkspaces.map((workspace) => workspace.workspaceName)).toEqual([
                "payments",
                "billing",
                "alpha"
            ]);
            expect(docsCall?.workspace).toBe(docsWorkspace);
            // The docs workspace has no name; it is validated first
            expect(validatedNames()).toEqual([undefined, "billing"]);
        });

        it.each([
            { brokenLinks: false, errorOnBrokenLinks: false, excludeRules: ["valid-markdown-links"] },
            { brokenLinks: true, errorOnBrokenLinks: false, excludeRules: [] },
            { brokenLinks: false, errorOnBrokenLinks: true, excludeRules: [] },
            { brokenLinks: true, errorOnBrokenLinks: true, excludeRules: [] }
        ])("excludes $excludeRules when brokenLinks=$brokenLinks and errorOnBrokenLinks=$errorOnBrokenLinks", async ({
            brokenLinks,
            errorOnBrokenLinks,
            excludeRules
        }) => {
            await validate(projectOf({ docsWorkspace }), { brokenLinks, errorOnBrokenLinks });

            expect(vi.mocked(collectDocsWorkspaceViolations).mock.calls[0]?.[0]).toMatchObject({
                errorOnBrokenLinks,
                excludeRules
            });
        });

        it("fails with a validation error when docs validation reports errors", async () => {
            vi.mocked(collectDocsWorkspaceViolations).mockResolvedValue({
                violations: [violation("error", "docs-rule")],
                elapsedMillis: 1,
                hasErrors: true
            });

            await expect(validate(projectOf({ docsWorkspace }))).rejects.toBeDefined();

            expect(vi.mocked(cliContext.failAndThrow)).toHaveBeenCalledWith(undefined, undefined, {
                code: CliError.Code.ValidationError
            });
            expect(postHogProperties()).toMatchObject({
                passed: false,
                abortReason: "validation errors",
                validationRules: ["docs-rule"],
                numErrors: 1,
                numWarnings: 0
            });
        });

        it("does not fail on docs warnings alone", async () => {
            vi.mocked(collectDocsWorkspaceViolations).mockResolvedValue({
                violations: [violation("warning", "docs-rule")],
                elapsedMillis: 1,
                hasErrors: false
            });

            await validate(projectOf({ docsWorkspace }), { logWarnings: true });

            expect(postHogProperties()).toMatchObject({ passed: true, numErrors: 0, numWarnings: 1 });
        });

        it("reports nothing for docs when the docs task never produced a result", async () => {
            vi.mocked(cliContext.runTaskForWorkspace).mockImplementation(async () => undefined);

            await validate(projectOf({ docsWorkspace }));

            expect(vi.mocked(collectDocsWorkspaceViolations)).not.toHaveBeenCalled();
            expect(postHogProperties()).toMatchObject({ passed: true, validationRules: [], numErrors: 0 });
        });
    });

    describe("API validation", () => {
        describe("skipping workspaces without generator groups", () => {
            it.each([
                { name: "an oss workspace with zero groups", type: "oss", groups: 0, validated: false },
                { name: "a fern workspace with zero groups", type: "fern", groups: 0, validated: true },
                { name: "an oss workspace with groups", type: "oss", groups: 2, validated: true },
                {
                    name: "an oss workspace without a generators configuration",
                    type: "oss",
                    groups: undefined,
                    validated: true
                },
                {
                    name: "a fern workspace without a generators configuration",
                    type: "fern",
                    groups: undefined,
                    validated: true
                }
            ])("$name is validated: $validated", async ({ type, groups, validated }) => {
                const project = projectOf({ apiWorkspaces: [apiWorkspace({ name: "api", type, groups })] });

                await validate(project);

                expect(validatedNames()).toEqual(validated ? ["api"] : []);
            });

            it("skips silently, reporting a passing run", async () => {
                await validate(projectOf({ apiWorkspaces: [apiWorkspace({ name: "api", type: "oss", groups: 0 })] }));

                expect(vi.mocked(collectAPIWorkspaceViolations)).not.toHaveBeenCalled();
                expect(postHogProperties()).toMatchObject({ passed: true, abortReason: undefined });
            });
        });

        describe("--from-openapi", () => {
            it("generates the IR of an OSS workspace instead of collecting violations", async () => {
                const workspace = apiWorkspace({ name: "api", type: "oss", groups: 1, kind: "oss" });

                await validate(projectOf({ apiWorkspaces: [workspace] }), {
                    directFromOpenapi: true,
                    logWarnings: true
                });

                expect(workspace.getIntermediateRepresentation).toHaveBeenCalledOnce();
                expect(workspace.getIntermediateRepresentation).toHaveBeenCalledWith(
                    expect.objectContaining({
                        audiences: { type: "all" },
                        enableUniqueErrorsPerEndpoint: false,
                        generateV1Examples: false,
                        logWarnings: true
                    })
                );
                expect(workspace.toFernWorkspace).not.toHaveBeenCalled();
                expect(vi.mocked(collectAPIWorkspaceViolations)).not.toHaveBeenCalled();
            });

            it("passes logWarnings=false through to the IR generation", async () => {
                const workspace = apiWorkspace({ name: "api", type: "oss", groups: 1, kind: "oss" });

                await validate(projectOf({ apiWorkspaces: [workspace] }), {
                    directFromOpenapi: true,
                    logWarnings: false
                });

                expect(workspace.getIntermediateRepresentation).toHaveBeenCalledWith(
                    expect.objectContaining({ logWarnings: false })
                );
            });

            it("still validates a workspace that is not an OSS workspace", async () => {
                const workspace = apiWorkspace({ name: "api", groups: 1 });

                await validate(projectOf({ apiWorkspaces: [workspace] }), { directFromOpenapi: true });

                expect(vi.mocked(collectAPIWorkspaceViolations)).toHaveBeenCalledOnce();
            });

            it("is ignored for OSS workspaces unless requested", async () => {
                const workspace = apiWorkspace({ name: "api", type: "oss", groups: 1, kind: "oss" });

                await validate(projectOf({ apiWorkspaces: [workspace] }));

                expect(workspace.getIntermediateRepresentation).not.toHaveBeenCalled();
                expect(vi.mocked(collectAPIWorkspaceViolations)).toHaveBeenCalledOnce();
            });
        });

        describe("fern definition workspaces", () => {
            it("fails without the [api] prefix when definition/api.yml is missing", async () => {
                const directoryPath = await directory("missing-api-yml");
                const workspace = apiWorkspace({ name: "api", groups: 1, kind: "lazy", directory: directoryPath });

                await expect(validate(projectOf({ apiWorkspaces: [workspace] }))).rejects.toBeDefined();

                expect(log).toHaveBeenCalledWith(LogLevel.Error, "Missing file: api.yml");
                expect(workspace.toFernWorkspace).not.toHaveBeenCalled();
                expect(vi.mocked(cliContext.runTaskForWorkspace)).not.toHaveBeenCalled();
                expect(postHogProperties()).toMatchObject({ passed: true, abortReason: "missing api.yml" });
            });

            it("validates the workspace when definition/api.yml exists", async () => {
                const directoryPath = await directory("with-api-yml", { "definition/api.yml": "name: api\n" });
                const workspace = apiWorkspace({ name: "api", groups: 1, kind: "lazy", directory: directoryPath });

                await validate(projectOf({ apiWorkspaces: [workspace] }));

                expect(workspace.toFernWorkspace).toHaveBeenCalledOnce();
                expect(vi.mocked(collectAPIWorkspaceViolations)).toHaveBeenCalledOnce();
                expect(log).not.toHaveBeenCalledWith(LogLevel.Error, "Missing file: api.yml");
            });

            it("does not look for definition/api.yml in other kinds of workspace", async () => {
                const directoryPath = await directory("no-definition");
                const workspace = apiWorkspace({ name: "api", groups: 1, directory: directoryPath });

                await validate(projectOf({ apiWorkspaces: [workspace] }));

                expect(workspace.toFernWorkspace).toHaveBeenCalledOnce();
            });
        });

        describe("collecting violations", () => {
            it("passes the Fern workspace and the OSS workspace to the collector", async () => {
                const workspace = apiWorkspace({ name: "api", type: "oss", groups: 1, kind: "oss" });

                await validate(projectOf({ apiWorkspaces: [workspace] }));

                const args = vi.mocked(collectAPIWorkspaceViolations).mock.calls[0]?.[0];
                expect(args?.ossWorkspace).toBe(workspace);
                expect((args?.workspace as unknown as { apiName: string }).apiName).toBe("api");
            });

            it("passes no OSS workspace for other workspaces", async () => {
                await validate(projectOf({ apiWorkspaces: [apiWorkspace({ name: "api", groups: 1 })] }));

                expect(vi.mocked(collectAPIWorkspaceViolations).mock.calls[0]?.[0].ossWorkspace).toBeUndefined();
            });

            it("records nothing when the task never ran", async () => {
                vi.mocked(cliContext.runTaskForWorkspace).mockImplementation(async () => undefined);

                await validate(projectOf({ apiWorkspaces: [apiWorkspace({ name: "api", groups: 1 })] }));

                expect(vi.mocked(collectAPIWorkspaceViolations)).not.toHaveBeenCalled();
                expect(postHogProperties()).toMatchObject({ passed: true });
            });

            it("fails with a validation error when any API reports errors", async () => {
                vi.mocked(collectAPIWorkspaceViolations).mockImplementation(async ({ workspace }) => {
                    const apiName = (workspace as unknown as { apiName: string }).apiName;
                    return {
                        apiName,
                        violations: apiName === "billing" ? [violation("fatal", "broken-rule")] : [],
                        elapsedMillis: 1,
                        hasErrors: apiName === "billing"
                    };
                });
                const project = projectOf({
                    apiWorkspaces: [
                        apiWorkspace({ name: "payments", groups: 1 }),
                        apiWorkspace({ name: "billing", groups: 1 })
                    ]
                });

                await expect(validate(project)).rejects.toBeDefined();

                expect(vi.mocked(cliContext.failAndThrow)).toHaveBeenCalledWith(undefined, undefined, {
                    code: CliError.Code.ValidationError
                });
                expect(postHogProperties()).toMatchObject({
                    passed: false,
                    abortReason: "validation errors",
                    validationRules: ["broken-rule"],
                    numErrors: 1
                });
            });

            it("passes when API violations are only warnings, counting them", async () => {
                vi.mocked(collectAPIWorkspaceViolations).mockResolvedValue({
                    apiName: "api",
                    violations: [
                        violation("warning", "warn-rule"),
                        violation("warning", "warn-rule"),
                        violation("warning")
                    ],
                    elapsedMillis: 1,
                    hasErrors: false
                });

                await validate(projectOf({ apiWorkspaces: [apiWorkspace({ name: "api", groups: 1 })] }), {
                    logWarnings: true
                });

                expect(postHogProperties()).toEqual({
                    validationRules: ["warn-rule"],
                    numErrors: 0,
                    numWarnings: 3,
                    passed: true,
                    abortReason: undefined
                });
            });

            it("counts fatal and error severities as errors in the telemetry", async () => {
                vi.mocked(collectAPIWorkspaceViolations).mockResolvedValue({
                    apiName: "api",
                    violations: [violation("fatal", "a"), violation("error", "b"), violation("warning", "c")],
                    elapsedMillis: 1,
                    hasErrors: true
                });

                await expect(
                    validate(projectOf({ apiWorkspaces: [apiWorkspace({ name: "api", groups: 1 })] }))
                ).rejects.toBeDefined();

                expect(postHogProperties()).toMatchObject({
                    numErrors: 2,
                    numWarnings: 1,
                    validationRules: ["a", "b", "c"]
                });
            });
        });

        describe("failures while validating", () => {
            it("reports the first 100 characters of an Error message as the abort reason and rethrows", async () => {
                const message = "x".repeat(150);
                const workspace = apiWorkspace({ name: "api", groups: 1 });
                workspace.toFernWorkspace.mockRejectedValue(new Error(message));

                await expect(validate(projectOf({ apiWorkspaces: [workspace] }))).rejects.toThrow(message);

                expect(postHogProperties()).toMatchObject({ passed: true, abortReason: "x".repeat(100) });
            });

            it("reports a generic abort reason for a non-Error failure", async () => {
                vi.mocked(cliContext.runTaskForWorkspace).mockRejectedValue("not an error");

                await expect(
                    validate(projectOf({ apiWorkspaces: [apiWorkspace({ name: "api", groups: 1 })] }))
                ).rejects.toBe("not an error");

                expect(postHogProperties()).toMatchObject({ abortReason: "unexpected error" });
            });

            it("still cleans up materialized workspaces", async () => {
                const alpha = await directory("alpha", { "sdk-config.yml": sdkConfigYml([TYPESCRIPT_TARGET]) });
                vi.mocked(cliContext.runTaskForWorkspace).mockRejectedValue(new Error("boom"));

                await expect(
                    validate(projectOf({ sdkConfigWorkspaces: [sdkConfigOwner("alpha", alpha)] }))
                ).rejects.toThrow("boom");

                expect(cleanups[0]).toHaveBeenCalledOnce();
            });
        });

        describe("JSON output", () => {
            beforeEach(() => {
                Object.assign(cliContext, { isJsonMode: true });
            });

            it("writes a success document without API names for a single API", async () => {
                vi.mocked(collectAPIWorkspaceViolations).mockResolvedValue({
                    apiName: "api",
                    violations: [violation("warning", "warn-rule")],
                    elapsedMillis: 1,
                    hasErrors: false
                });

                await validate(projectOf({ apiWorkspaces: [apiWorkspace({ name: "api", groups: 1 })] }));

                expect(vi.mocked(cliContext.writeJsonToStdout)).toHaveBeenCalledOnce();
                expect(vi.mocked(cliContext.writeJsonToStdout)).toHaveBeenCalledWith({
                    success: true,
                    results: { apis: [{ severity: "warning", rule: "warn-rule", message: "warning from warn-rule" }] }
                });
            });

            it("names the API of each violation when several APIs are validated", async () => {
                vi.mocked(collectAPIWorkspaceViolations).mockImplementation(async ({ workspace }) => ({
                    apiName: (workspace as unknown as { apiName: string }).apiName,
                    violations: [violation("warning", "warn-rule")],
                    elapsedMillis: 1,
                    hasErrors: false
                }));

                await validate(
                    projectOf({
                        apiWorkspaces: [
                            apiWorkspace({ name: "payments", groups: 1 }),
                            apiWorkspace({ name: "billing", groups: 1 })
                        ]
                    })
                );

                const written = vi.mocked(cliContext.writeJsonToStdout).mock.calls[0]?.[0] as {
                    success: boolean;
                    results: { apis?: Array<{ api?: string }> };
                };
                expect(written.success).toBe(true);
                expect(written.results.apis?.map((entry) => entry.api).sort()).toEqual(["billing", "payments"]);
            });

            it("writes the document before failing when there are errors", async () => {
                vi.mocked(collectAPIWorkspaceViolations).mockResolvedValue({
                    apiName: "api",
                    violations: [violation("error", "bad")],
                    elapsedMillis: 1,
                    hasErrors: true
                });

                await expect(
                    validate(projectOf({ apiWorkspaces: [apiWorkspace({ name: "api", groups: 1 })] }))
                ).rejects.toBeDefined();

                expect(vi.mocked(cliContext.writeJsonToStdout)).toHaveBeenCalledWith({
                    success: false,
                    results: { apis: [{ severity: "error", rule: "bad", message: "error from bad" }] }
                });
            });

            it("writes docs violations under docs", async () => {
                vi.mocked(collectDocsWorkspaceViolations).mockResolvedValue({
                    violations: [violation("warning", "docs-rule")],
                    elapsedMillis: 1,
                    hasErrors: false
                });

                await validate(
                    projectOf({
                        docsWorkspace: {
                            absoluteFilePath: "/fern",
                            absoluteFilepathToDocsConfig: "/fern/docs.yml",
                            config: { navigation: [] }
                        }
                    })
                );

                expect(vi.mocked(cliContext.writeJsonToStdout)).toHaveBeenCalledWith({
                    success: true,
                    results: { docs: [{ severity: "warning", rule: "docs-rule", message: "warning from docs-rule" }] }
                });
            });

            it("writes nothing outside JSON mode", async () => {
                Object.assign(cliContext, { isJsonMode: false });

                await validate(projectOf({ apiWorkspaces: [apiWorkspace({ name: "api", groups: 1 })] }));

                expect(vi.mocked(cliContext.writeJsonToStdout)).not.toHaveBeenCalled();
            });
        });
    });

    describe("telemetry", () => {
        it("reports a clean run", async () => {
            await validate(projectOf({ apiWorkspaces: [apiWorkspace({ name: "api", groups: 1 })] }));

            expect(vi.mocked(cliContext.instrumentPostHogEvent)).toHaveBeenCalledOnce();
            expect(vi.mocked(cliContext.instrumentPostHogEvent)).toHaveBeenCalledWith({
                command: "fern check",
                properties: {
                    validationRules: [],
                    numErrors: 0,
                    numWarnings: 0,
                    passed: true,
                    abortReason: undefined
                }
            });
        });
    });
});
