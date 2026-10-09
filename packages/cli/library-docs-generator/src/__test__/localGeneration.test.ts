import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import type { docsYml } from "@fern-api/configuration";
import type { FdrAPI } from "@fern-api/fdr-sdk";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { type TaskContext, TaskResult } from "@fern-api/task-context";

import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from "vitest";

vi.mock("@fern-api/docker-utils", () => ({
    runContainer: vi.fn()
}));

import { runContainer } from "@fern-api/docker-utils";

import { runLibraryDocsGeneration } from "../orchestrate.js";

/**
 * End-to-end coverage of the `fern docs md generate --local` path for a
 * local path and git input libraries.
 *
 * Only the Docker boundary (`runContainer`) is mocked — it emits a realistic
 * `{ ir }` envelope to the container's `/output` mount, exactly as the real
 * parser image would. Everything else runs for real: raw-config routing,
 * source-path resolution, `LocalParserRunner`, IR validation, and the Python
 * MDX generator writing files to `output.path` on disk.
 *
 * This is the local analogue of the git/remote render coverage in
 * fern-platform's `library-docs-generate.spec.ts`, and closes the seam that
 * let a `path` input be required by `--local` yet unhandled elsewhere.
 */

type LoggerMock = { info: Mock; error: Mock; debug: Mock; warn: Mock; trace: Mock; log: Mock };

function makeContext(): TaskContext {
    const logger: LoggerMock = {
        trace: vi.fn(),
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        log: vi.fn()
    };
    return {
        logger,
        takeOverTerminal: async (run: () => void | Promise<void>) => {
            await run();
        },
        failAndThrow: (message?: string) => {
            throw new Error(message ?? "fail");
        },
        failWithoutThrowing: vi.fn(),
        captureException: vi.fn(),
        getResult: () => TaskResult.Success,
        getLastFailureMessage: () => undefined,
        instrumentPostHogEvent: vi.fn(),
        addInteractiveTask: vi.fn(),
        runInteractiveTask: vi.fn()
    } as unknown as TaskContext;
}

/** The bind spec `runContainer` receives is `<hostPath>:<containerPath>[:mode]`. */
function hostPathForMount(binds: string[], containerMount: string): string {
    const bind = binds.find((b) => b.includes(`:${containerMount}`)) ?? "";
    return bind.slice(0, bind.indexOf(`:${containerMount}`));
}

/**
 * A small but non-trivial Python IR: a root package with one submodule that
 * carries a class and a function, so the generator emits multiple pages plus
 * navigation (rather than a single-page degenerate case).
 */
function docstring(summary: string, description: string): FdrAPI.libraryDocs.DocstringIr {
    return {
        summary,
        description,
        params: [],
        raises: [],
        examples: [],
        notes: [],
        warnings: [],
        returns: undefined
    } as unknown as FdrAPI.libraryDocs.DocstringIr;
}

function pythonIr(): FdrAPI.libraryDocs.PythonLibraryDocsIr {
    const submodule = {
        name: "client",
        path: "plantstore.client",
        docstring: undefined,
        submodules: [],
        classes: [
            {
                name: "PlantStoreClient",
                path: "plantstore.client.PlantStoreClient",
                kind: "CLASS",
                docstring: docstring("Plant store client.", "Entry point for the plant store SDK."),
                bases: [],
                constructorParams: [],
                methods: [],
                attributes: [],
                decorators: [],
                metaclass: undefined,
                isAbstract: false,
                hasSlots: false,
                typedDictFields: undefined,
                enumMembers: undefined
            }
        ],
        functions: [
            {
                name: "connect",
                path: "plantstore.client.connect",
                signature: "def connect() -> PlantStoreClient",
                parameters: [],
                isAsync: false,
                decorators: [],
                isClassmethod: false,
                isStaticmethod: false,
                isProperty: false,
                docstring: undefined,
                returnTypeInfo: undefined
            }
        ],
        attributes: []
    } as unknown as FdrAPI.libraryDocs.PythonModuleIr;

    return {
        rootModule: {
            name: "plantstore",
            path: "plantstore",
            docstring: undefined,
            submodules: [submodule],
            classes: [],
            functions: [],
            attributes: []
        }
    } as unknown as FdrAPI.libraryDocs.PythonLibraryDocsIr;
}

describe("runLibraryDocsGeneration — --local path input (end-to-end to disk)", () => {
    let docsDir: string;

    beforeEach(() => {
        vi.clearAllMocks();
        docsDir = mkdtempSync(join(tmpdir(), "libdocs-local-e2e-"));
        // A real local checkout of the library at the `input.path`.
        mkdirSync(join(docsDir, "sdk-python", "plantstore"), { recursive: true });
        writeFileSync(join(docsDir, "sdk-python", "plantstore", "__init__.py"), "from .client import connect\n");
    });

    afterEach(() => {
        rmSync(docsDir, { recursive: true, force: true });
    });

    it("routes a 'path' input through the local parser and writes MDX to output.path", async () => {
        const ir = pythonIr();
        (runContainer as Mock).mockImplementation(async ({ binds }: { binds: string[] }) => {
            const outputHostDir = hostPathForMount(binds, "/output");
            await writeFile(
                join(outputHostDir, "ir.json"),
                JSON.stringify({ ir, metadata: { packageName: "plantstore" } })
            );
        });

        const libraries: Record<string, docsYml.RawSchemas.LibraryConfiguration> = {
            plantstore: {
                input: { path: "./sdk-python" } as unknown as docsYml.RawSchemas.LibraryInputConfiguration,
                output: { path: "./static/plant-sdk-docs" },
                lang: "python"
            }
        };

        const result = await runLibraryDocsGeneration({
            libraries,
            docsDirectoryPath: AbsoluteFilePath.of(docsDir),
            orgId: "smoke-test",
            context: makeContext(),
            local: true
        });

        expect(result).toEqual({ successful: 1 });

        // The container ran once, mounting the resolved local source at /repo (read-only).
        expect(runContainer as Mock).toHaveBeenCalledTimes(1);
        const call = (runContainer as Mock).mock.calls[0]?.[0] as { binds: string[]; args: string[] };
        expect(call.binds).toContain(`${join(docsDir, "sdk-python")}:/repo:ro`);
        // Passing the CLI entrypoint is what stops the image booting its Lambda handler.
        expect(call.args).toEqual(["python", "-m", "src.cli_entrypoint"]);

        // Real MDX was written into output.path — this is the "generate to a folder" artifact.
        // Pages are nested under <output.path>/<slug>/<rootModule>/, and the navigation
        // manifest is written at the output root.
        const outputRoot = join(docsDir, "static", "plant-sdk-docs");
        const pagesDir = join(outputRoot, "plantstore", "plantstore");
        expect(existsSync(join(pagesDir, "index.mdx"))).toBe(true);
        expect(existsSync(join(pagesDir, "client.mdx"))).toBe(true);
        expect(existsSync(join(outputRoot, "_navigation.yml"))).toBe(true);

        const clientPage = readFileSync(join(pagesDir, "client.mdx"), "utf-8");
        expect(clientPage).toContain("PlantStoreClient");
        expect(clientPage).toContain("Entry point for the plant store SDK.");
    });

    it("clones a git input and mounts the resolved checkout in Docker", async () => {
        const origin = join(docsDir, "sdk-python");
        execFileSync("git", ["init", "-b", "main"], { cwd: origin });
        execFileSync("git", ["add", "--", "plantstore/__init__.py"], { cwd: origin });
        execFileSync(
            "git",
            ["-c", "user.name=Fern Test", "-c", "user.email=test@buildwithfern.com", "commit", "-m", "initial"],
            { cwd: origin }
        );

        const ir = pythonIr();
        let parserConfig: Record<string, unknown> | undefined;
        (runContainer as Mock).mockImplementation(async ({ binds }: { binds: string[] }) => {
            const repoHostPath = hostPathForMount(binds, "/repo");
            expect(repoHostPath).not.toBe(origin);
            expect(existsSync(join(repoHostPath, "plantstore", "__init__.py"))).toBe(true);

            parserConfig = JSON.parse(readFileSync(hostPathForMount(binds, "/input/config.json"), "utf-8")) as Record<
                string,
                unknown
            >;
            await writeFile(
                join(hostPathForMount(binds, "/output"), "ir.json"),
                JSON.stringify({ ir, metadata: { packageName: "plantstore" } })
            );
        });

        const libraries: Record<string, docsYml.RawSchemas.LibraryConfiguration> = {
            plantstore: {
                input: { git: origin, ref: "main", subpath: "plantstore" },
                output: { path: "./static/plant-sdk-docs" },
                lang: "python"
            }
        };

        await expect(
            runLibraryDocsGeneration({
                libraries,
                docsDirectoryPath: AbsoluteFilePath.of(docsDir),
                orgId: "smoke-test",
                context: makeContext(),
                local: true
            })
        ).resolves.toEqual({ successful: 1 });

        expect(runContainer as Mock).toHaveBeenCalledTimes(1);
        expect(parserConfig).toEqual({
            packagePath: "plantstore",
            sourceUrl: origin,
            branch: "main"
        });
        expect(existsSync(join(docsDir, "static", "plant-sdk-docs", "_navigation.yml"))).toBe(true);
    });
});
