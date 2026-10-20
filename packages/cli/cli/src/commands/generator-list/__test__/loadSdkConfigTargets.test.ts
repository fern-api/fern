import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import type { Project } from "@fern-api/project-loader";
import { CliError } from "@fern-api/task-context";
import { afterEach, describe, expect, it, vi } from "vitest";
import YAML from "yaml";

import type { CliContext } from "../../../cli-context/CliContext.js";
import { loadSdkConfigV1 } from "../../generate/loadSdkConfigV1.js";
import { loadSdkConfigTargets } from "../loadSdkConfigTargets.js";
import { removeTemporaryDirectories, sdkConfig } from "./sdkConfigFixtures.js";

const INVALID_SDK_CONFIG = "targets: [this is: not valid yaml";

interface Owner {
    absoluteFilePath: AbsoluteFilePath;
    workspaceName: string | undefined;
}

describe("loadSdkConfigTargets", () => {
    const temporaryDirectories: string[] = [];

    afterEach(async () => {
        vi.unstubAllEnvs();
        await removeTemporaryDirectories(temporaryDirectories);
    });

    const failAndThrow = vi.fn((message?: string) => {
        throw new Error(message);
    });
    const cliContext = { failAndThrow } as unknown as CliContext;

    async function createRoot(): Promise<string> {
        const root = await mkdtemp(path.join(tmpdir(), "fern-load-sdk-config-targets-"));
        temporaryDirectories.push(root);
        return root;
    }

    /** Creates `<root>/<name>/` and, when contents are given, an sdk-config.yml (or another file) in it. */
    async function createOwner({
        root,
        name,
        workspaceName,
        sdkConfigContents,
        filename = "sdk-config.yml"
    }: {
        root: string;
        name: string;
        workspaceName: string | undefined;
        sdkConfigContents?: unknown;
        filename?: string;
    }): Promise<Owner> {
        const directory = path.join(root, name);
        await mkdir(directory, { recursive: true });
        if (sdkConfigContents != null) {
            await writeFile(
                path.join(directory, filename),
                typeof sdkConfigContents === "string" ? sdkConfigContents : YAML.stringify(sdkConfigContents)
            );
        }
        return { absoluteFilePath: AbsoluteFilePath.of(directory), workspaceName };
    }

    function projectOf({
        apiWorkspaces = [],
        sdkConfigWorkspaces
    }: {
        apiWorkspaces?: Owner[];
        sdkConfigWorkspaces?: Owner[];
    }): Project {
        return { apiWorkspaces, sdkConfigWorkspaces } as unknown as Project;
    }

    const javaTarget = { language: "java", output: { delivery: "files", path: "./sdks/java" } };
    const pythonTarget = { language: "python", output: { delivery: "files", path: "./sdks/python" } };

    function names(sources: Array<{ workspaceName: string | undefined }>): Array<string | undefined> {
        return sources.map((source) => source.workspaceName);
    }

    describe("owner selection", () => {
        it("returns nothing for a project without owners", async () => {
            const sources = await loadSdkConfigTargets({
                project: projectOf({}),
                cliContext,
                isSelectedApi: () => true
            });
            expect(sources).toEqual([]);
        });

        it("lists API workspaces before SDK Config workspaces, each in project order", async () => {
            const root = await createRoot();
            const sdkOnly = await createOwner({
                root,
                name: "sdk-only",
                workspaceName: "sdk-only",
                sdkConfigContents: sdkConfig([javaTarget])
            });
            const second = await createOwner({
                root,
                name: "second",
                workspaceName: "second",
                sdkConfigContents: sdkConfig([javaTarget])
            });
            const first = await createOwner({
                root,
                name: "first",
                workspaceName: "first",
                sdkConfigContents: sdkConfig([javaTarget])
            });

            const sources = await loadSdkConfigTargets({
                project: projectOf({ apiWorkspaces: [first, second], sdkConfigWorkspaces: [sdkOnly] }),
                cliContext,
                isSelectedApi: () => true
            });

            expect(names(sources)).toEqual(["first", "second", "sdk-only"]);
            expect(sources.map((source) => source.absolutePathToSdkConfig)).toEqual([
                path.join(first.absoluteFilePath, "sdk-config.yml"),
                path.join(second.absoluteFilePath, "sdk-config.yml"),
                path.join(sdkOnly.absoluteFilePath, "sdk-config.yml")
            ]);
        });

        it("treats a missing sdkConfigWorkspaces list as empty", async () => {
            const root = await createRoot();
            const api = await createOwner({
                root,
                name: "api",
                workspaceName: "api",
                sdkConfigContents: sdkConfig([javaTarget])
            });

            const sources = await loadSdkConfigTargets({
                project: projectOf({ apiWorkspaces: [api], sdkConfigWorkspaces: undefined }),
                cliContext,
                isSelectedApi: () => true
            });

            expect(names(sources)).toEqual(["api"]);
        });

        it("asks isSelectedApi about each owner by workspace name, including a nameless one", async () => {
            const root = await createRoot();
            const named = await createOwner({ root, name: "named", workspaceName: "named" });
            const nameless = await createOwner({ root, name: "nameless", workspaceName: undefined });
            const sdkOnly = await createOwner({ root, name: "sdk-only", workspaceName: "sdk-only" });
            const isSelectedApi = vi.fn((_workspaceName: string | undefined) => true);

            await loadSdkConfigTargets({
                project: projectOf({ apiWorkspaces: [named, nameless], sdkConfigWorkspaces: [sdkOnly] }),
                cliContext,
                isSelectedApi
            });

            expect(isSelectedApi.mock.calls.map(([workspaceName]) => workspaceName)).toEqual([
                "named",
                undefined,
                "sdk-only"
            ]);
        });

        it("keeps only owners the predicate selects, across API and SDK Config workspaces", async () => {
            const root = await createRoot();
            const payments = await createOwner({
                root,
                name: "payments",
                workspaceName: "payments",
                sdkConfigContents: sdkConfig([javaTarget])
            });
            const billing = await createOwner({
                root,
                name: "billing",
                workspaceName: "billing",
                sdkConfigContents: sdkConfig([pythonTarget])
            });
            const orders = await createOwner({
                root,
                name: "orders",
                workspaceName: "orders",
                sdkConfigContents: sdkConfig([pythonTarget])
            });

            const sources = await loadSdkConfigTargets({
                project: projectOf({ apiWorkspaces: [payments, billing], sdkConfigWorkspaces: [orders] }),
                cliContext,
                isSelectedApi: (workspaceName) => workspaceName === "payments" || workspaceName === "orders"
            });

            expect(names(sources)).toEqual(["payments", "orders"]);
        });

        it("never reads the file of an unselected owner, even when it is invalid", async () => {
            const root = await createRoot();
            const selected = await createOwner({
                root,
                name: "selected",
                workspaceName: "selected",
                sdkConfigContents: sdkConfig([javaTarget])
            });
            const unselectedApi = await createOwner({
                root,
                name: "unselected-api",
                workspaceName: "unselected-api",
                sdkConfigContents: INVALID_SDK_CONFIG
            });
            const unselectedSdkOnly = await createOwner({
                root,
                name: "unselected-sdk-only",
                workspaceName: "unselected-sdk-only",
                sdkConfigContents: INVALID_SDK_CONFIG
            });

            const sources = await loadSdkConfigTargets({
                project: projectOf({
                    apiWorkspaces: [unselectedApi, selected],
                    sdkConfigWorkspaces: [unselectedSdkOnly]
                }),
                cliContext,
                isSelectedApi: (workspaceName) => workspaceName === "selected"
            });

            expect(names(sources)).toEqual(["selected"]);
        });

        it("selects nothing when the predicate rejects every owner", async () => {
            const root = await createRoot();
            const api = await createOwner({
                root,
                name: "api",
                workspaceName: "api",
                sdkConfigContents: sdkConfig([javaTarget])
            });

            const sources = await loadSdkConfigTargets({
                project: projectOf({ apiWorkspaces: [api] }),
                cliContext,
                isSelectedApi: () => false
            });

            expect(sources).toEqual([]);
        });

        it("skips an owner without an sdk-config.yml and keeps the others", async () => {
            const root = await createRoot();
            const legacyOnly = await createOwner({ root, name: "legacy-only", workspaceName: "legacy-only" });
            const migrated = await createOwner({
                root,
                name: "migrated",
                workspaceName: "migrated",
                sdkConfigContents: sdkConfig([javaTarget])
            });

            const sources = await loadSdkConfigTargets({
                project: projectOf({ apiWorkspaces: [legacyOnly, migrated] }),
                cliContext,
                isSelectedApi: () => true
            });

            expect(names(sources)).toEqual(["migrated"]);
        });

        it("only looks for sdk-config.yml, so an sdk-config.yaml owner is skipped", async () => {
            const root = await createRoot();
            const yamlOwner = await createOwner({
                root,
                name: "yaml-extension",
                workspaceName: "yaml-extension",
                sdkConfigContents: sdkConfig([javaTarget]),
                filename: "sdk-config.yaml"
            });

            const sources = await loadSdkConfigTargets({
                project: projectOf({ apiWorkspaces: [yamlOwner] }),
                cliContext,
                isSelectedApi: () => true
            });

            expect(sources).toEqual([]);
        });
    });

    describe("de-duplication by sdk-config.yml path", () => {
        it("reports a directory owned by both an API workspace and an SDK Config workspace once, under the API name", async () => {
            const root = await createRoot();
            const shared = await createOwner({
                root,
                name: "shared",
                workspaceName: "as-api",
                sdkConfigContents: sdkConfig([javaTarget])
            });

            const sources = await loadSdkConfigTargets({
                project: projectOf({
                    apiWorkspaces: [shared],
                    sdkConfigWorkspaces: [{ ...shared, workspaceName: "as-sdk-config" }]
                }),
                cliContext,
                isSelectedApi: () => true
            });

            expect(names(sources)).toEqual(["as-api"]);
        });

        it("reports the file under the SDK Config workspace name when the API owner is unselected", async () => {
            const root = await createRoot();
            const shared = await createOwner({
                root,
                name: "shared",
                workspaceName: "as-api",
                sdkConfigContents: sdkConfig([javaTarget])
            });

            const sources = await loadSdkConfigTargets({
                project: projectOf({
                    apiWorkspaces: [shared],
                    sdkConfigWorkspaces: [{ ...shared, workspaceName: "as-sdk-config" }]
                }),
                cliContext,
                isSelectedApi: (workspaceName) => workspaceName === "as-sdk-config"
            });

            expect(names(sources)).toEqual(["as-sdk-config"]);
        });

        it("reports two API workspaces that share a directory once", async () => {
            const root = await createRoot();
            const shared = await createOwner({
                root,
                name: "shared",
                workspaceName: "first",
                sdkConfigContents: sdkConfig([javaTarget])
            });

            const sources = await loadSdkConfigTargets({
                project: projectOf({ apiWorkspaces: [shared, { ...shared, workspaceName: "second" }] }),
                cliContext,
                isSelectedApi: () => true
            });

            expect(names(sources)).toEqual(["first"]);
        });

        it("reads a shared file only once", async () => {
            const root = await createRoot();
            const shared = await createOwner({
                root,
                name: "shared",
                workspaceName: "first",
                sdkConfigContents: sdkConfig([javaTarget])
            });
            const isSelectedApi = vi.fn((_workspaceName: string | undefined) => true);

            const sources = await loadSdkConfigTargets({
                project: projectOf({ apiWorkspaces: [shared], sdkConfigWorkspaces: [shared] }),
                cliContext,
                isSelectedApi
            });

            expect(sources).toHaveLength(1);
            expect(isSelectedApi).toHaveBeenCalledTimes(2);
        });
    });

    describe("target summaries", () => {
        it("summarizes language, generator, version and output of each target", async () => {
            const root = await createRoot();
            const api = await createOwner({
                root,
                name: "api",
                workspaceName: "api",
                sdkConfigContents: sdkConfig([
                    { ...javaTarget, generatorVersion: "4.8.12" },
                    {
                        language: "python",
                        output: { delivery: "github", github: { repository: "acme/python-sdk" } }
                    }
                ])
            });

            const sources = await loadSdkConfigTargets({
                project: projectOf({ apiWorkspaces: [api] }),
                cliContext,
                isSelectedApi: () => true
            });

            expect(sources).toEqual([
                {
                    workspaceName: "api",
                    absolutePathToSdkConfig: path.join(api.absoluteFilePath, "sdk-config.yml"),
                    targets: [
                        {
                            id: "java",
                            language: "java",
                            generator: "fernapi/fern-java-sdk",
                            version: "4.8.12",
                            output: { delivery: "files", path: "./sdks/java" }
                        },
                        {
                            id: "python",
                            language: "python",
                            generator: "fernapi/fern-python-sdk",
                            version: "latest",
                            output: { delivery: "github", github: { repository: "acme/python-sdk" } }
                        }
                    ]
                }
            ]);
        });

        it("suffixes the id of a repeated language with its position among same-language targets", async () => {
            const root = await createRoot();
            const api = await createOwner({
                root,
                name: "api",
                workspaceName: "api",
                sdkConfigContents: sdkConfig([javaTarget, pythonTarget, javaTarget])
            });

            const [source] = await loadSdkConfigTargets({
                project: projectOf({ apiWorkspaces: [api] }),
                cliContext,
                isSelectedApi: () => true
            });

            expect(source?.targets.map((target) => target.id)).toEqual(["java-0", "python", "java-1"]);
        });

        it("falls back to the document-level output for a target without one", async () => {
            const root = await createRoot();
            const globalOutput = { delivery: "files", path: "./sdks" };
            const api = await createOwner({
                root,
                name: "api",
                workspaceName: "api",
                sdkConfigContents: { ...sdkConfig([{ language: "python" }, javaTarget]), output: globalOutput }
            });

            const [source] = await loadSdkConfigTargets({
                project: projectOf({ apiWorkspaces: [api] }),
                cliContext,
                isSelectedApi: () => true
            });

            expect(source?.targets.map((target) => target.output)).toEqual([globalOutput, javaTarget.output]);
        });
    });

    describe("preview mode", () => {
        it("loads a publishing target without resolving its credential", async () => {
            const root = await createRoot();
            const api = await createOwner({
                root,
                name: "api",
                workspaceName: "api",
                sdkConfigContents: sdkConfig([
                    {
                        language: "typescript",
                        package: { packageName: "@acme/sdk" },
                        output: {
                            delivery: "files",
                            publish: { registry: "npm", token: "${FERN_TEST_UNSET_NPM_TOKEN_FOR_PREVIEW}" }
                        }
                    }
                ])
            });
            vi.stubEnv("FERN_TEST_UNSET_NPM_TOKEN_FOR_PREVIEW", undefined);

            const sources = await loadSdkConfigTargets({
                project: projectOf({ apiWorkspaces: [api] }),
                cliContext,
                isSelectedApi: () => true
            });

            expect(sources[0]?.targets.map((target) => target.id)).toEqual(["typescript"]);
            // The same file is rejected when credentials are resolved, as `fern generate` does
            await expect(loadSdkConfigV1(path.join(api.absoluteFilePath, "sdk-config.yml"), false)).rejects.toThrow();
        });
    });

    describe("invalid files", () => {
        it("fails with a config error carrying the loader's message for a selected owner", async () => {
            failAndThrow.mockClear();
            const root = await createRoot();
            const api = await createOwner({
                root,
                name: "api",
                workspaceName: "api",
                sdkConfigContents: INVALID_SDK_CONFIG
            });

            await expect(
                loadSdkConfigTargets({
                    project: projectOf({ apiWorkspaces: [api] }),
                    cliContext,
                    isSelectedApi: () => true
                })
            ).rejects.toThrow(
                `SDK Config v1 at ${path.join(api.absoluteFilePath, "sdk-config.yml")} is not valid YAML`
            );
            expect(failAndThrow).toHaveBeenCalledWith(expect.any(String), undefined, {
                code: CliError.Code.ConfigError
            });
        });

        it("fails on the first invalid file instead of skipping it", async () => {
            const root = await createRoot();
            const valid = await createOwner({
                root,
                name: "valid",
                workspaceName: "valid",
                sdkConfigContents: sdkConfig([javaTarget])
            });
            const invalid = await createOwner({
                root,
                name: "invalid",
                workspaceName: "invalid",
                sdkConfigContents: { schemaVersion: "sdk-config/v1" }
            });

            await expect(
                loadSdkConfigTargets({
                    project: projectOf({ apiWorkspaces: [valid, invalid] }),
                    cliContext,
                    isSelectedApi: () => true
                })
            ).rejects.toThrow(
                `SDK Config v1 at ${path.join(invalid.absoluteFilePath, "sdk-config.yml")} failed validation`
            );
        });
    });
});
