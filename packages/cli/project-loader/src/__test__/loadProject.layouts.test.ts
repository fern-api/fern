import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { createMockTaskContext, TaskAbortSignal } from "@fern-api/task-context";
import { afterEach, describe, expect, it, vi } from "vitest";

import { loadApis, loadProject, loadProjectFromDirectory } from "../loadProject.js";
import { SdkConfigWorkspace } from "../Project.js";

/**
 * One row per project layout. Each row is a small file tree, the options `loadProjectFromDirectory` is called with,
 * and what comes out. The expected values record what the loader does today, including behavior that looks odd.
 */

const CONFIG = '{"organization":"test","version":"*"}\n';
const OPENAPI = "openapi: 3.0.0\ninfo:\n  title: Plants\n  version: 1.0.0\npaths: {}\n";
const ASYNCAPI = "asyncapi: 2.6.0\ninfo:\n  title: Plants\n  version: 1.0.0\nchannels: {}\n";
const GENERATORS_WITH_SPEC = "api:\n  specs:\n    - openapi: openapi.yml\n";
const GENERATORS_EMPTY = "{}\n";
const GENERATORS_INVALID = "this is intentionally invalid: [\n";
const SDK_CONFIG = "schemaVersion: sdk-config/v1\n";
const DEFINITION_API = "name: api\n";
const DOCS_MINIMAL = "instances:\n  - url: plants.docs.buildwithfern.com\n";
const DOCS_INVALID = "instances: [\n";

function docsWithInlineSpecs(specs: string): string {
    return [
        "instances:",
        "  - url: plants.docs.buildwithfern.com",
        "navigation:",
        "  - api: API Reference",
        "    specs:",
        ...specs.split("\n").map((line) => `      ${line}`),
        ""
    ].join("\n");
}

const DOCS_INLINE_OPENAPI = docsWithInlineSpecs("- type: openapi\n  path: openapi/openapi.yml");
const DOCS_INLINE_ASYNCAPI = docsWithInlineSpecs("- type: asyncapi\n  path: asyncapi/asyncapi.yml");
const DOCS_API_WITHOUT_SPECS =
    "instances:\n  - url: plants.docs.buildwithfern.com\nnavigation:\n  - api: API Reference\n";
const DOCS_API_EMPTY_SPECS =
    "instances:\n  - url: plants.docs.buildwithfern.com\nnavigation:\n  - api: API Reference\n    specs: []\n";

interface Loaded {
    outcome: "loads";
    /** `<workspace name or "<root>">:<workspace type>`, sorted. */
    apiWorkspaces: string[];
    /** `<directory relative to the fern directory, "." for the root>:<workspace name or "<root>">`, sorted. */
    sdkConfigWorkspaces: string[];
    hasDocs: boolean;
    /** Substrings that must appear in errors logged while loading. Empty means nothing may be logged. */
    loggedErrors: string[];
}

interface Aborted {
    outcome: "aborts";
    /** Substrings that must appear in the errors logged before the task aborted. */
    loggedErrors: string[];
}

interface Threw {
    outcome: "throws";
    message: string;
}

type Expected = Loaded | Aborted | Threw;

interface Layout {
    name: string;
    files: Record<string, string>;
    /** Leaves out the fern.config.json that every other layout gets. */
    withoutProjectConfig?: boolean;
    options?: {
        commandLineApiWorkspace?: string | string[];
        defaultToAllApiWorkspaces?: boolean;
        skipApiWorkspaces?: boolean;
    };
    expected: Expected;
}

type MockLogger = NonNullable<NonNullable<Parameters<typeof createMockTaskContext>[0]>["logger"]>;

function createErrorCapturingLogger(errors: string[]): MockLogger {
    return {
        disable: vi.fn(),
        enable: vi.fn(),
        trace: vi.fn(),
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: (...parts: string[]) => {
            errors.push(parts.join(" "));
        },
        log: vi.fn()
    };
}

function loads(expected: Partial<Omit<Loaded, "outcome">> = {}): Loaded {
    return {
        outcome: "loads",
        apiWorkspaces: [],
        sdkConfigWorkspaces: [],
        hasDocs: false,
        loggedErrors: [],
        ...expected
    };
}

function aborts(...loggedErrors: string[]): Aborted {
    return { outcome: "aborts", loggedErrors };
}

function throws(message: string): Threw {
    return { outcome: "throws", message };
}

/** Builds `{ "<dir>/<file>": content }` for every file, so rows can describe `apis/<name>/` folders compactly. */
function inDirectory(directory: string, files: Record<string, string>): Record<string, string> {
    return Object.fromEntries(Object.entries(files).map(([file, content]) => [`${directory}/${file}`, content]));
}

const LAYOUTS: Layout[] = [
    // ---- one API at the fern root ----
    {
        name: "root: definition/ only",
        files: { "definition/api.yml": DEFINITION_API },
        expected: loads({ apiWorkspaces: ["<root>:fern"] })
    },
    {
        name: "root: generators.yml {} with definition/",
        files: { "generators.yml": GENERATORS_EMPTY, "definition/api.yml": DEFINITION_API },
        expected: loads({ apiWorkspaces: ["<root>:fern"] })
    },
    {
        name: "root: generators.yml with an openapi spec",
        files: { "generators.yml": GENERATORS_WITH_SPEC, "openapi.yml": OPENAPI },
        expected: loads({ apiWorkspaces: ["<root>:oss"] })
    },
    {
        name: "root: generators.yaml with an openapi spec",
        files: { "generators.yaml": GENERATORS_WITH_SPEC, "openapi.yml": OPENAPI },
        expected: loads({ apiWorkspaces: ["<root>:oss"] })
    },
    {
        name: "root: generators.legacy.yml with an openapi spec",
        files: { "generators.legacy.yml": GENERATORS_WITH_SPEC, "openapi.yml": OPENAPI },
        expected: loads({ apiWorkspaces: ["<root>:oss"] })
    },
    {
        name: "root: generators.yml and generators.yaml together (yml wins, no conflict error)",
        files: {
            "generators.yml": GENERATORS_WITH_SPEC,
            "generators.yaml": GENERATORS_INVALID,
            "openapi.yml": OPENAPI
        },
        expected: loads({ apiWorkspaces: ["<root>:oss"] })
    },
    {
        name: "root: generators.yml and generators.legacy.yml together",
        files: {
            "generators.yml": GENERATORS_WITH_SPEC,
            "generators.legacy.yml": GENERATORS_WITH_SPEC,
            "openapi.yml": OPENAPI
        },
        expected: throws("Found both generators.yml and generators.legacy.yml")
    },
    {
        name: "root: generators.yaml and generators.legacy.yml together",
        files: {
            "generators.yaml": GENERATORS_WITH_SPEC,
            "generators.legacy.yml": GENERATORS_WITH_SPEC,
            "openapi.yml": OPENAPI
        },
        expected: throws("generators.legacy.yml")
    },
    {
        name: "root: generators.yml {} without definition/ logs the misconfigured-directory error and finds nothing",
        files: { "generators.yml": GENERATORS_EMPTY },
        expected: aborts("No API definition found", "No SDK specifications or docs specifications found")
    },
    // ---- nothing usable at the fern root ----
    {
        name: "root: empty fern directory",
        files: {},
        expected: aborts("No SDK specifications or docs specifications found")
    },
    {
        name: "root: openapi/ folder only",
        files: { "openapi/openapi.yml": OPENAPI },
        expected: aborts("No API definition found", "No SDK specifications or docs specifications found")
    },
    {
        name: "root: asyncapi/ folder only",
        files: { "asyncapi/asyncapi.yml": ASYNCAPI },
        expected: aborts("No API definition found", "No SDK specifications or docs specifications found")
    },
    // ---- the apis/ folder ----
    {
        name: "apis: one API with generators.yml",
        files: inDirectory("apis/a", { "generators.yml": GENERATORS_WITH_SPEC, "openapi.yml": OPENAPI }),
        expected: loads({ apiWorkspaces: ["a:oss"] })
    },
    {
        name: "apis: one API with definition/",
        files: inDirectory("apis/a", { "definition/api.yml": DEFINITION_API }),
        expected: loads({ apiWorkspaces: ["a:fern"] })
    },
    {
        name: "apis: a stray file next to the API folders is ignored",
        files: {
            ...inDirectory("apis/a", { "generators.yml": GENERATORS_WITH_SPEC, "openapi.yml": OPENAPI }),
            "apis/README.md": "# apis\n"
        },
        expected: loads({ apiWorkspaces: ["a:oss"] })
    },
    {
        name: "apis: two APIs without --api",
        files: {
            ...inDirectory("apis/a", { "generators.yml": GENERATORS_WITH_SPEC, "openapi.yml": OPENAPI }),
            ...inDirectory("apis/b", { "generators.yml": GENERATORS_WITH_SPEC, "openapi.yml": OPENAPI })
        },
        expected: aborts("There are multiple workspaces. You must specify one with --api:", "--api a", "--api b")
    },
    {
        name: "apis: two APIs, caller defaults to all",
        files: {
            ...inDirectory("apis/a", { "generators.yml": GENERATORS_WITH_SPEC, "openapi.yml": OPENAPI }),
            ...inDirectory("apis/b", { "generators.yml": GENERATORS_WITH_SPEC, "openapi.yml": OPENAPI })
        },
        options: { defaultToAllApiWorkspaces: true },
        expected: loads({ apiWorkspaces: ["a:oss", "b:oss"] })
    },
    {
        name: "apis: --api picks one of two",
        files: {
            ...inDirectory("apis/a", { "generators.yml": GENERATORS_WITH_SPEC, "openapi.yml": OPENAPI }),
            ...inDirectory("apis/b", { "generators.yml": GENERATORS_WITH_SPEC, "openapi.yml": OPENAPI })
        },
        options: { commandLineApiWorkspace: "b" },
        expected: loads({ apiWorkspaces: ["b:oss"] })
    },
    {
        name: "apis: --api given twice picks both",
        files: {
            ...inDirectory("apis/a", { "generators.yml": GENERATORS_WITH_SPEC, "openapi.yml": OPENAPI }),
            ...inDirectory("apis/b", { "generators.yml": GENERATORS_WITH_SPEC, "openapi.yml": OPENAPI })
        },
        options: { commandLineApiWorkspace: ["a", "b"] },
        expected: loads({ apiWorkspaces: ["a:oss", "b:oss"] })
    },
    {
        name: "apis: --api repeated with the same name loads it once",
        files: inDirectory("apis/a", { "generators.yml": GENERATORS_WITH_SPEC, "openapi.yml": OPENAPI }),
        options: { commandLineApiWorkspace: ["a", "a"] },
        expected: loads({ apiWorkspaces: ["a:oss"] })
    },
    {
        name: "apis: --api with an unknown name",
        files: inDirectory("apis/a", { "generators.yml": GENERATORS_WITH_SPEC, "openapi.yml": OPENAPI }),
        options: { commandLineApiWorkspace: "missing" },
        expected: aborts("API does not exist: missing")
    },
    {
        name: "apis: --api with two unknown names",
        files: inDirectory("apis/a", { "generators.yml": GENERATORS_WITH_SPEC, "openapi.yml": OPENAPI }),
        options: { commandLineApiWorkspace: ["x", "y"] },
        expected: aborts("APIs do not exist: x, y")
    },
    {
        name: "apis: --api with one known and one unknown name",
        files: inDirectory("apis/a", { "generators.yml": GENERATORS_WITH_SPEC, "openapi.yml": OPENAPI }),
        options: { commandLineApiWorkspace: ["a", "missing"] },
        expected: aborts("API does not exist: missing")
    },
    {
        name: "apis: empty apis/ folder",
        files: { "apis/.gitkeep": "" },
        expected: aborts("No APIs found.")
    },
    {
        name: "apis: empty apis/ folder with --api",
        files: { "apis/.gitkeep": "" },
        options: { commandLineApiWorkspace: "x" },
        expected: aborts("API does not exist: x")
    },
    {
        name: "apis: an API that fails to load aborts the whole load",
        files: inDirectory("apis/a", { "generators.yml": GENERATORS_EMPTY }),
        expected: aborts("No API definition found")
    },
    // ---- sdk-config.yml ----
    {
        name: "sdk-config: root sdk-config.yml only",
        files: { "sdk-config.yml": SDK_CONFIG },
        expected: loads({ sdkConfigWorkspaces: [".:<root>"] })
    },
    {
        name: "sdk-config: root sdk-config.yaml is not recognized",
        files: { "sdk-config.yaml": SDK_CONFIG },
        expected: aborts("No SDK specifications or docs specifications found")
    },
    {
        name: "sdk-config: root sdk-config.yml with generators.yml {} (generators fail to load, sdk-config still owns the root)",
        files: { "sdk-config.yml": SDK_CONFIG, "generators.yml": GENERATORS_EMPTY },
        expected: loads({ sdkConfigWorkspaces: [".:<root>"], loggedErrors: ["No API definition found"] })
    },
    {
        name: "sdk-config: root sdk-config.yml with a loadable generators.yml (the API workspace wins)",
        files: { "sdk-config.yml": SDK_CONFIG, "generators.yml": GENERATORS_WITH_SPEC, "openapi.yml": OPENAPI },
        expected: loads({ apiWorkspaces: ["<root>:oss"] })
    },
    {
        name: "sdk-config: root sdk-config.yml with generators.legacy.yml",
        files: { "sdk-config.yml": SDK_CONFIG, "generators.legacy.yml": GENERATORS_WITH_SPEC, "openapi.yml": OPENAPI },
        expected: loads({ apiWorkspaces: ["<root>:oss"] })
    },
    {
        name: "sdk-config: root sdk-config.yml with definition/",
        files: { "sdk-config.yml": SDK_CONFIG, "definition/api.yml": DEFINITION_API },
        expected: loads({ apiWorkspaces: ["<root>:fern"] })
    },
    {
        name: "sdk-config: root sdk-config.yml with --api and no apis/ folder",
        files: { "sdk-config.yml": SDK_CONFIG },
        options: { commandLineApiWorkspace: "x" },
        expected: loads()
    },
    {
        name: "sdk-config: apis/a with sdk-config.yml only, --api a",
        files: inDirectory("apis/a", { "sdk-config.yml": SDK_CONFIG }),
        options: { commandLineApiWorkspace: "a" },
        expected: loads({ sdkConfigWorkspaces: ["apis/a:a"] })
    },
    {
        name: "sdk-config: apis/a with sdk-config.yml only, no --api",
        files: inDirectory("apis/a", { "sdk-config.yml": SDK_CONFIG }),
        expected: loads({ sdkConfigWorkspaces: ["apis/a:a"] })
    },
    {
        name: "sdk-config: apis/a with generators.yml and sdk-config.yml (the API workspace wins)",
        files: inDirectory("apis/a", {
            "generators.yml": GENERATORS_WITH_SPEC,
            "openapi.yml": OPENAPI,
            "sdk-config.yml": SDK_CONFIG
        }),
        expected: loads({ apiWorkspaces: ["a:oss"] })
    },
    {
        name: "sdk-config: apis/a with generators.legacy.yml and sdk-config.yml",
        files: inDirectory("apis/a", {
            "generators.legacy.yml": GENERATORS_WITH_SPEC,
            "openapi.yml": OPENAPI,
            "sdk-config.yml": SDK_CONFIG
        }),
        expected: loads({ apiWorkspaces: ["a:oss"] })
    },
    {
        name: "sdk-config: apis/a with generators.yml {} and sdk-config.yml (generators exists, so it must load as an API)",
        files: inDirectory("apis/a", { "generators.yml": GENERATORS_EMPTY, "sdk-config.yml": SDK_CONFIG }),
        expected: aborts("No API definition found")
    },
    {
        name: "sdk-config: apis/a with sdk-config.yaml only is loaded as an API and fails",
        files: inDirectory("apis/a", { "sdk-config.yaml": SDK_CONFIG }),
        expected: aborts("No API definition found")
    },
    {
        name: "sdk-config: root sdk-config.yml next to apis/a with generators.yml (the root is still an owner)",
        files: {
            "sdk-config.yml": SDK_CONFIG,
            ...inDirectory("apis/a", { "generators.yml": GENERATORS_WITH_SPEC, "openapi.yml": OPENAPI })
        },
        expected: loads({ apiWorkspaces: ["a:oss"], sdkConfigWorkspaces: [".:<root>"] })
    },
    {
        name: "sdk-config: root sdk-config.yml next to apis/a with sdk-config.yml, all APIs",
        files: { "sdk-config.yml": SDK_CONFIG, ...inDirectory("apis/a", { "sdk-config.yml": SDK_CONFIG }) },
        options: { defaultToAllApiWorkspaces: true },
        expected: loads({ sdkConfigWorkspaces: [".:<root>", "apis/a:a"] })
    },
    {
        name: "sdk-config: root sdk-config.yml next to apis/a with sdk-config.yml, --api a (the root is not an owner)",
        files: { "sdk-config.yml": SDK_CONFIG, ...inDirectory("apis/a", { "sdk-config.yml": SDK_CONFIG }) },
        options: { commandLineApiWorkspace: "a" },
        expected: loads({ sdkConfigWorkspaces: ["apis/a:a"] })
    },
    {
        name: "sdk-config: two sdk-config-only APIs, all APIs",
        files: {
            ...inDirectory("apis/a", { "sdk-config.yml": SDK_CONFIG }),
            ...inDirectory("apis/b", { "sdk-config.yml": SDK_CONFIG })
        },
        options: { defaultToAllApiWorkspaces: true },
        expected: loads({ sdkConfigWorkspaces: ["apis/a:a", "apis/b:b"] })
    },
    {
        name: "sdk-config: an sdk-config-only API next to a legacy API, all APIs",
        files: {
            ...inDirectory("apis/a", { "sdk-config.yml": SDK_CONFIG }),
            ...inDirectory("apis/b", { "generators.yml": GENERATORS_WITH_SPEC, "openapi.yml": OPENAPI })
        },
        options: { defaultToAllApiWorkspaces: true },
        expected: loads({ apiWorkspaces: ["b:oss"], sdkConfigWorkspaces: ["apis/a:a"] })
    },
    // ---- skipApiWorkspaces ----
    {
        name: "skip: invalid generators.yml is never parsed, and the root becomes an owner without an sdk-config.yml",
        files: { "generators.yml": GENERATORS_INVALID },
        options: { skipApiWorkspaces: true },
        expected: loads({ sdkConfigWorkspaces: [".:<root>"] })
    },
    {
        name: "skip: root sdk-config.yml only",
        files: { "sdk-config.yml": SDK_CONFIG },
        options: { skipApiWorkspaces: true },
        expected: loads({ sdkConfigWorkspaces: [".:<root>"] })
    },
    {
        name: "skip: root sdk-config.yml with an invalid generators.yml (the root is an owner once)",
        files: { "sdk-config.yml": SDK_CONFIG, "generators.yml": GENERATORS_INVALID },
        options: { skipApiWorkspaces: true },
        expected: loads({ sdkConfigWorkspaces: [".:<root>"] })
    },
    {
        name: "skip: root sdk-config.yml with --api and no apis/ folder",
        files: { "sdk-config.yml": SDK_CONFIG },
        options: { skipApiWorkspaces: true, commandLineApiWorkspace: "x" },
        expected: loads({ sdkConfigWorkspaces: [".:<root>"] })
    },
    {
        name: "skip: apis/a with an invalid generators.yml, --api a (owner without looking for sdk-config.yml)",
        files: inDirectory("apis/a", { "generators.yml": GENERATORS_INVALID }),
        options: { skipApiWorkspaces: true, commandLineApiWorkspace: "a" },
        expected: loads({ sdkConfigWorkspaces: ["apis/a:a"] })
    },
    {
        name: "skip: two APIs without --api still need --api",
        files: {
            ...inDirectory("apis/a", { "sdk-config.yml": SDK_CONFIG }),
            ...inDirectory("apis/b", { "sdk-config.yml": SDK_CONFIG })
        },
        options: { skipApiWorkspaces: true },
        expected: aborts("There are multiple workspaces. You must specify one with --api:")
    },
    {
        name: "skip: two APIs, all APIs",
        files: {
            ...inDirectory("apis/a", { "generators.yml": GENERATORS_INVALID }),
            ...inDirectory("apis/b", { "generators.yml": GENERATORS_INVALID })
        },
        options: { skipApiWorkspaces: true, defaultToAllApiWorkspaces: true },
        expected: loads({ sdkConfigWorkspaces: ["apis/a:a", "apis/b:b"] })
    },
    {
        name: "skip: docs only, nothing to skip",
        files: { "docs.yml": DOCS_MINIMAL },
        options: { skipApiWorkspaces: true },
        expected: loads({ hasDocs: true })
    },
    {
        name: "skip: empty fern directory is allowed",
        files: {},
        options: { skipApiWorkspaces: true },
        expected: loads()
    },
    // ---- docs.yml ----
    {
        name: "docs: docs.yml only",
        files: { "docs.yml": DOCS_MINIMAL },
        expected: loads({ hasDocs: true })
    },
    {
        name: "docs: docs.yml with a generators.yml API",
        files: { "docs.yml": DOCS_MINIMAL, "generators.yml": GENERATORS_WITH_SPEC, "openapi.yml": OPENAPI },
        expected: loads({ hasDocs: true, apiWorkspaces: ["<root>:oss"] })
    },
    {
        name: "docs: docs.yaml is not recognized",
        files: { "docs.yaml": DOCS_MINIMAL },
        expected: aborts("No SDK specifications or docs specifications found")
    },
    {
        name: "docs: invalid docs.yml with a valid generators.yml",
        files: { "docs.yml": DOCS_INVALID, "generators.yml": GENERATORS_WITH_SPEC, "openapi.yml": OPENAPI },
        expected: throws("Failed to parse")
    },
    {
        name: "docs: invalid docs.yml and invalid generators.yml (docs fail first)",
        files: { "docs.yml": DOCS_INVALID, "generators.yml": GENERATORS_INVALID },
        expected: throws("Failed to parse")
    },
    {
        name: "docs: inline openapi spec with openapi/ and no generators.yml",
        files: { "docs.yml": DOCS_INLINE_OPENAPI, "openapi/openapi.yml": OPENAPI },
        expected: loads({ hasDocs: true })
    },
    {
        name: "docs: inline asyncapi spec with asyncapi/ and no generators.yml",
        files: { "docs.yml": DOCS_INLINE_ASYNCAPI, "asyncapi/asyncapi.yml": ASYNCAPI },
        expected: loads({ hasDocs: true })
    },
    {
        name: "docs: inline specs and a generators.yml API (generators.yml is loaded as usual)",
        files: {
            "docs.yml": DOCS_INLINE_OPENAPI,
            "openapi/openapi.yml": OPENAPI,
            "generators.yml": GENERATORS_WITH_SPEC,
            "openapi.yml": OPENAPI
        },
        expected: loads({ hasDocs: true, apiWorkspaces: ["<root>:oss"] })
    },
    {
        name: "docs: inline specs with a root sdk-config.yml",
        files: { "docs.yml": DOCS_INLINE_OPENAPI, "openapi/openapi.yml": OPENAPI, "sdk-config.yml": SDK_CONFIG },
        expected: loads({ hasDocs: true, sdkConfigWorkspaces: [".:<root>"] })
    },
    {
        name: "docs: api section without specs and an openapi/ folder (openapi/ is loaded as a legacy workspace)",
        files: { "docs.yml": DOCS_API_WITHOUT_SPECS, "openapi/openapi.yml": OPENAPI },
        expected: loads({ hasDocs: true, loggedErrors: ["No API definition found"] })
    },
    {
        name: "docs: api section with empty specs and an openapi/ folder",
        files: { "docs.yml": DOCS_API_EMPTY_SPECS, "openapi/openapi.yml": OPENAPI },
        expected: loads({ hasDocs: true, loggedErrors: ["No API definition found"] })
    },
    {
        name: "docs: inline specs and an apis/ folder",
        files: {
            "docs.yml": DOCS_INLINE_OPENAPI,
            "openapi/openapi.yml": OPENAPI,
            ...inDirectory("apis/a", { "generators.yml": GENERATORS_WITH_SPEC, "openapi.yml": OPENAPI })
        },
        expected: loads({ hasDocs: true, apiWorkspaces: ["a:oss"] })
    },
    // ---- fern.config.json ----
    {
        name: "config: missing fern.config.json surfaces the raw file-system error",
        files: { "docs.yml": DOCS_MINIMAL },
        withoutProjectConfig: true,
        expected: throws("ENOENT: no such file or directory, open")
    }
];

describe("loadProjectFromDirectory — project layouts", () => {
    const temporaryDirectories: string[] = [];

    afterEach(async () => {
        await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true })));
    });

    async function writeLayout(layout: Layout): Promise<string> {
        const fernDirectory = await mkdtemp(path.join(tmpdir(), "fern-layout-"));
        temporaryDirectories.push(fernDirectory);
        const files: Record<string, string> = layout.withoutProjectConfig
            ? layout.files
            : { "fern.config.json": CONFIG, ...layout.files };
        for (const [file, content] of Object.entries(files)) {
            const absolutePath = path.join(fernDirectory, file);
            await mkdir(path.dirname(absolutePath), { recursive: true });
            await writeFile(absolutePath, content);
        }
        return fernDirectory;
    }

    it.each(LAYOUTS)("$name", async (layout) => {
        const fernDirectory = await writeLayout(layout);
        const errors: string[] = [];

        const result = await loadProjectFromDirectory({
            absolutePathToFernDirectory: AbsoluteFilePath.of(fernDirectory),
            cliName: "fern",
            cliVersion: "0.0.0",
            commandLineApiWorkspace: layout.options?.commandLineApiWorkspace,
            defaultToAllApiWorkspaces: layout.options?.defaultToAllApiWorkspaces ?? false,
            skipApiWorkspaces: layout.options?.skipApiWorkspaces,
            context: createMockTaskContext({ logger: createErrorCapturingLogger(errors) })
        }).then(
            (project) => ({ project, error: undefined }),
            (error: unknown) => ({ project: undefined, error })
        );

        const { expected } = layout;
        switch (expected.outcome) {
            case "loads": {
                expect(result.error).toBeUndefined();
                const project = result.project;
                expect(project).toBeDefined();
                if (project == null) {
                    return;
                }
                expect(
                    project.apiWorkspaces
                        .map((workspace) => `${workspace.workspaceName ?? "<root>"}:${workspace.type}`)
                        .sort()
                ).toEqual(expected.apiWorkspaces);
                expect(
                    (project.sdkConfigWorkspaces ?? [])
                        .map(
                            (workspace) =>
                                `${path.relative(fernDirectory, workspace.absoluteFilePath) || "."}:${workspace.workspaceName ?? "<root>"}`
                        )
                        .sort()
                ).toEqual(expected.sdkConfigWorkspaces);
                expect(project.docsWorkspaces != null).toBe(expected.hasDocs);
                expect(findErrorMismatch(errors, expected.loggedErrors)).toBeUndefined();
                return;
            }
            case "aborts": {
                expect(result.error).toBeInstanceOf(TaskAbortSignal);
                expect(findErrorMismatch(errors, expected.loggedErrors)).toBeUndefined();
                return;
            }
            case "throws": {
                expect(result.error).toBeInstanceOf(Error);
                expect(result.error instanceof Error ? result.error.message : "").toContain(expected.message);
                return;
            }
        }
    });
});

describe("loadApis", () => {
    const temporaryDirectories: string[] = [];

    afterEach(async () => {
        await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true })));
    });

    async function createFernDirectory(files: Record<string, string>): Promise<string> {
        const fernDirectory = await mkdtemp(path.join(tmpdir(), "fern-layout-apis-"));
        temporaryDirectories.push(fernDirectory);
        for (const [file, content] of Object.entries(files)) {
            const absolutePath = path.join(fernDirectory, file);
            await mkdir(path.dirname(absolutePath), { recursive: true });
            await writeFile(absolutePath, content);
        }
        return fernDirectory;
    }

    async function load({
        files,
        collector,
        skipLegacyWorkspaceLoading
    }: {
        files: Record<string, string>;
        collector?: SdkConfigWorkspace[];
        skipLegacyWorkspaceLoading?: boolean;
    }): Promise<{ names: string[]; errors: string[]; error: unknown }> {
        const fernDirectory = await createFernDirectory(files);
        const errors: string[] = [];
        let names: string[] = [];
        const error = await loadApis({
            cliName: "fern",
            cliVersion: "0.0.0",
            fernDirectory: AbsoluteFilePath.of(fernDirectory),
            commandLineApiWorkspace: undefined,
            defaultToAllApiWorkspaces: true,
            sdkConfigWorkspaceCollector: collector,
            skipLegacyWorkspaceLoading,
            context: createMockTaskContext({ logger: createErrorCapturingLogger(errors) })
        }).then(
            (workspaces) => {
                names = workspaces
                    .map((workspace) => `${workspace.workspaceName ?? "<root>"}:${workspace.type}`)
                    .sort();
                return undefined;
            },
            (thrown: unknown) => thrown
        );
        return { names, errors, error };
    }

    const API = inDirectory("apis/a", { "generators.yml": GENERATORS_WITH_SPEC, "openapi.yml": OPENAPI });
    const SDK_CONFIG_ONLY = inDirectory("apis/b", { "sdk-config.yml": SDK_CONFIG });

    it("loads the API workspaces", async () => {
        const { names, errors, error } = await load({ files: API });

        expect(error).toBeUndefined();
        expect(names).toEqual(["a:oss"]);
        expect(errors).toEqual([]);
    });

    it("loads the fern directory itself when there is no apis folder", async () => {
        const { names } = await load({ files: { "generators.yml": GENERATORS_WITH_SPEC, "openapi.yml": OPENAPI } });

        expect(names).toEqual(["<root>:oss"]);
    });

    it("collects an sdk-config-only API instead of loading it when given a collector", async () => {
        const collector: SdkConfigWorkspace[] = [];

        const { names } = await load({ files: { ...API, ...SDK_CONFIG_ONLY }, collector });

        expect(names).toEqual(["a:oss"]);
        expect(collector.map((owner) => owner.workspaceName)).toEqual(["b"]);
    });

    it("loads an sdk-config-only API like any other when there is no collector, so it fails", async () => {
        const { errors, error } = await load({ files: { ...API, ...SDK_CONFIG_ONLY } });

        expect(error).toBeInstanceOf(TaskAbortSignal);
        expect(errors.join("\n")).toContain("No API definition found");
    });

    it("collects every folder and loads none when legacy loading is skipped", async () => {
        const collector: SdkConfigWorkspace[] = [];

        const { names } = await load({
            files: { ...API, ...SDK_CONFIG_ONLY },
            collector,
            skipLegacyWorkspaceLoading: true
        });

        expect(names).toEqual([]);
        expect(collector.map((owner) => owner.workspaceName).sort()).toEqual(["a", "b"]);
    });

    it("loads none when legacy loading is skipped and there is no collector", async () => {
        const { names, error } = await load({ files: API, skipLegacyWorkspaceLoading: true });

        expect(error).toBeUndefined();
        expect(names).toEqual([]);
    });
});

describe("Project.loadAPIWorkspace", () => {
    let fernDirectory: string | undefined;

    afterEach(async () => {
        if (fernDirectory != null) {
            await rm(fernDirectory, { recursive: true });
            fernDirectory = undefined;
        }
    });

    async function loadTwoApis(): Promise<Awaited<ReturnType<typeof loadProjectFromDirectory>>> {
        fernDirectory = await mkdtemp(path.join(tmpdir(), "fern-layout-lookup-"));
        const files: Record<string, string> = {
            "fern.config.json": CONFIG,
            ...inDirectory("apis/a", { "generators.yml": GENERATORS_WITH_SPEC, "openapi.yml": OPENAPI }),
            ...inDirectory("apis/b", { "generators.yml": GENERATORS_WITH_SPEC, "openapi.yml": OPENAPI })
        };
        for (const [file, content] of Object.entries(files)) {
            const absolutePath = path.join(fernDirectory, file);
            await mkdir(path.dirname(absolutePath), { recursive: true });
            await writeFile(absolutePath, content);
        }
        return await loadProjectFromDirectory({
            absolutePathToFernDirectory: AbsoluteFilePath.of(fernDirectory),
            cliName: "fern",
            cliVersion: "0.0.0",
            commandLineApiWorkspace: undefined,
            defaultToAllApiWorkspaces: true,
            context: createMockTaskContext()
        });
    }

    it("returns the first workspace when no name is given", async () => {
        const project = await loadTwoApis();

        expect(project.loadAPIWorkspace(undefined)).toBe(project.apiWorkspaces[0]);
    });

    it("finds a workspace by name", async () => {
        const project = await loadTwoApis();

        expect(project.loadAPIWorkspace("b")?.workspaceName).toBe("b");
    });

    it("returns undefined for an unknown name", async () => {
        const project = await loadTwoApis();

        expect(project.loadAPIWorkspace("missing")).toBeUndefined();
    });
});

/** Why the logged errors differ from what a row expects, or `undefined` when they match. */
function findErrorMismatch(actual: string[], expectedSubstrings: string[]): string | undefined {
    if (expectedSubstrings.length === 0) {
        return actual.length === 0 ? undefined : `expected no logged errors, got: ${actual.join(" | ")}`;
    }
    const missing = expectedSubstrings.filter((substring) => !actual.join("\n").includes(substring));
    return missing.length === 0
        ? undefined
        : `missing from the logged errors: ${missing.join(" | ")} (got: ${actual.join(" | ")})`;
}

describe("loadProject — finding the fern directory", () => {
    const temporaryDirectories: string[] = [];
    const originalCwd = process.cwd();

    afterEach(async () => {
        process.chdir(originalCwd);
        await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true })));
    });

    async function createWorkingDirectory(): Promise<string> {
        const directory = await mkdtemp(path.join(tmpdir(), "fern-cwd-"));
        temporaryDirectories.push(directory);
        return directory;
    }

    async function load(nameOverride: string | undefined): Promise<{ errors: string[]; error: unknown }> {
        const errors: string[] = [];
        const context = createMockTaskContext({ logger: createErrorCapturingLogger(errors) });
        const error = await loadProject({
            cliName: "fern",
            cliVersion: "0.0.0",
            commandLineApiWorkspace: undefined,
            defaultToAllApiWorkspaces: false,
            nameOverride,
            context
        }).then(
            () => undefined,
            (thrown: unknown) => thrown
        );
        return { errors, error };
    }

    it("fails when there is no fern directory", async () => {
        process.chdir(await createWorkingDirectory());

        const { errors, error } = await load(undefined);

        expect(error).toBeInstanceOf(TaskAbortSignal);
        expect(errors).toEqual(['Directory "fern" not found.']);
    });

    it("names the override in the failure when there is no such directory", async () => {
        process.chdir(await createWorkingDirectory());

        const { errors, error } = await load(".mock");

        expect(error).toBeInstanceOf(TaskAbortSignal);
        expect(errors).toEqual(['Directory ".mock" not found.']);
    });

    it("ignores a fern directory without a fern.config.json", async () => {
        const workingDirectory = await createWorkingDirectory();
        await mkdir(path.join(workingDirectory, "fern"));
        process.chdir(workingDirectory);

        const { errors, error } = await load(undefined);

        expect(error).toBeInstanceOf(TaskAbortSignal);
        expect(errors).toEqual(['Directory "fern" not found.']);
    });

    it("loads the fern directory found in the working directory", async () => {
        const workingDirectory = await createWorkingDirectory();
        await mkdir(path.join(workingDirectory, "fern"));
        await writeFile(path.join(workingDirectory, "fern", "fern.config.json"), CONFIG);
        await writeFile(path.join(workingDirectory, "fern", "docs.yml"), DOCS_MINIMAL);
        process.chdir(workingDirectory);

        const { errors, error } = await load(undefined);

        expect(error).toBeUndefined();
        expect(errors).toEqual([]);
    });

    it("loads the override directory when a nameOverride is given", async () => {
        const workingDirectory = await createWorkingDirectory();
        await mkdir(path.join(workingDirectory, ".mock"));
        await writeFile(path.join(workingDirectory, ".mock", "fern.config.json"), CONFIG);
        await writeFile(path.join(workingDirectory, ".mock", "docs.yml"), DOCS_MINIMAL);
        process.chdir(workingDirectory);

        const { errors, error } = await load(".mock");

        expect(error).toBeUndefined();
        expect(errors).toEqual([]);
    });
});
