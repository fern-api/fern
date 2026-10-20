import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { type Spec } from "@fern-api/api-workspace-commons";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import { loadProjectFromDirectory, type Project } from "@fern-api/project-loader";
import { createMockTaskContext } from "@fern-api/task-context";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { CliContext } from "../../../cli-context/CliContext.js";
import { collectDocsWorkspaceViolations } from "../validateDocsWorkspaceAndLogIssues.js";
import { validateWorkspaces } from "../validateWorkspaces.js";

// Wrap the real implementation so the OSS workspaces handed to docs validation can be recorded.
vi.mock("../validateDocsWorkspaceAndLogIssues.js", async (importOriginal) => {
    const actual = await importOriginal<typeof import("../validateDocsWorkspaceAndLogIssues.js")>();
    return { ...actual, collectDocsWorkspaceViolations: vi.fn(actual.collectDocsWorkspaceViolations) };
});

const INVALID_REF = "#/components/schemas/MissingPlant";
const VALID_REF = "#/components/schemas/Plant";

function openApiSpec(title: string, schemaRef: string = VALID_REF): string {
    return [
        "openapi: 3.0.0",
        "info:",
        `  title: ${title}`,
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
        `                $ref: "${schemaRef}"`,
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

function asyncApiSpec(title: string): string {
    return [
        "asyncapi: 2.6.0",
        "info:",
        `  title: ${title}`,
        "  version: 1.0.0",
        "channels:",
        "  plants/created:",
        "    subscribe:",
        "      operationId: onPlantCreated",
        "      message:",
        "        payload:",
        "          $ref: '#/components/schemas/Plant'",
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

const FERN_CONFIG = '{"organization":"test","version":"*"}\n';

function docsYml(...navigation: string[]): string {
    return ["instances:", "  - url: plants.docs.buildwithfern.com", "navigation:", ...navigation, ""].join("\n");
}

function versionFile(navigation: string[]): string {
    return ["navigation:", ...navigation, ""].join("\n");
}

function inlineApi(title: string, specPath: string, options: { apiName?: string; type?: string } = {}): string[] {
    return [
        `  - api: ${title}`,
        ...(options.apiName != null ? [`    api-name: ${options.apiName}`] : []),
        "    specs:",
        `      - type: ${options.type ?? "openapi"}`,
        `        path: ${specPath}`
    ];
}

function filepathOf(spec: Spec): string {
    if (spec.type === "openapi" || spec.type === "graphql") {
        return spec.absoluteFilepath;
    }
    throw new Error(`Unexpected spec type ${spec.type}`);
}

interface RecordedWorkspace {
    type: string;
    workspaceName: string | undefined;
    /** Spec paths relative to the temporary root directory (the parent of `fern/`). */
    specPaths: string[];
}

interface CheckResult {
    project: Project;
    messages: string;
    thrown: Error | undefined;
    /** The API workspaces `loadProjectFromDirectory` produced. */
    projectWorkspaces: RecordedWorkspace[];
    /** The `ossWorkspaces` that docs validation was handed (project's own, or the inline-spec fallback). */
    docsOssWorkspaces: RecordedWorkspace[];
    /** The `apiWorkspaces` that docs validation was handed (always the project's, never the fallback). */
    docsApiWorkspaces: RecordedWorkspace[];
    /** Workspaces for which `runTaskForWorkspace` ran an API-level validation task. */
    apiValidated: RecordedWorkspace[];
}

describe("validateWorkspaces docs.yml inline-spec fallback", () => {
    const temporaryDirectories: string[] = [];

    afterEach(async () => {
        vi.mocked(collectDocsWorkspaceViolations).mockClear();
        await Promise.all(
            temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true }))
        );
    });

    /** `files` are written relative to a temporary root; the fern directory is `<root>/fern`. */
    async function check(files: Record<string, string>): Promise<CheckResult> {
        const root = await mkdtemp(path.join(tmpdir(), "fern-check-inline-fallback-"));
        temporaryDirectories.push(root);
        const fernDirectory = path.join(root, "fern");
        await mkdir(fernDirectory);
        await writeFile(path.join(fernDirectory, "fern.config.json"), FERN_CONFIG);
        for (const [relativePath, contents] of Object.entries(files)) {
            const absolutePath = path.join(root, relativePath);
            await mkdir(path.dirname(absolutePath), { recursive: true });
            await writeFile(absolutePath, contents);
        }

        const messageList: string[] = [];
        const record = (...args: string[]) => {
            messageList.push(args.join(" "));
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

        const describeWorkspace = (workspace: Project["apiWorkspaces"][number]): RecordedWorkspace => ({
            type: workspace.type,
            workspaceName: workspace.workspaceName,
            specPaths:
                workspace instanceof OSSWorkspace
                    ? workspace.allSpecs.map((spec) => path.relative(root, filepathOf(spec)))
                    : []
        });
        const apiValidated: RecordedWorkspace[] = [];
        const cliContext = {
            environment: { packageVersion: "0.0.0" },
            failAndThrow: taskContext.failAndThrow.bind(taskContext),
            instrumentPostHogEvent: vi.fn(),
            isJsonMode: false,
            runTask: vi.fn(async (task) => task(taskContext)),
            runTaskForWorkspace: vi.fn(async (workspace, task) => {
                if (workspace.type !== "docs") {
                    apiValidated.push(describeWorkspace(workspace));
                }
                return task(taskContext);
            })
        } as unknown as CliContext;

        let thrown: Error | undefined;
        try {
            await validateWorkspaces({
                project,
                cliContext,
                logWarnings: true,
                brokenLinks: false,
                errorOnBrokenLinks: false
            });
        } catch (error) {
            thrown = error instanceof Error ? error : new Error(String(error));
        }

        const docsCalls = vi.mocked(collectDocsWorkspaceViolations).mock.calls;
        if (docsCalls.length !== 1) {
            throw new Error(`Expected one docs validation call, got ${docsCalls.length}`);
        }
        const docsArgs = docsCalls[0]?.[0];
        return {
            project,
            messages: messageList.join("\n"),
            thrown,
            projectWorkspaces: project.apiWorkspaces.map(describeWorkspace),
            docsOssWorkspaces: (docsArgs?.ossWorkspaces ?? []).map(describeWorkspace),
            docsApiWorkspaces: (docsArgs?.apiWorkspaces ?? []).map(describeWorkspace),
            apiValidated
        };
    }

    describe("(a) a generators.yml with an openapi spec exists alongside inline specs", () => {
        const GENERATORS_YML = ["api:", "  specs:", "    - openapi: openapi/openapi.yml", ""].join("\n");

        it("skips the fallback: docs validation only sees the generators.yml workspace, not the inline spec", async () => {
            const result = await check({
                "fern/docs.yml": docsYml(...inlineApi("Inline API", "inline/inline.yml")),
                "fern/generators.yml": GENERATORS_YML,
                "fern/openapi/openapi.yml": openApiSpec("From generators", VALID_REF),
                // The inline spec is invalid, but nothing ever loads it.
                "fern/inline/inline.yml": openApiSpec("Inline", INVALID_REF)
            });

            expect(result.projectWorkspaces).toEqual([
                { type: "oss", workspaceName: undefined, specPaths: ["fern/openapi/openapi.yml"] }
            ]);
            expect(result.docsOssWorkspaces).toEqual(result.projectWorkspaces);
            expect(result.docsApiWorkspaces).toEqual(result.projectWorkspaces);
            // A generators.yml without generator groups is skipped by API-level validation entirely.
            expect(result.apiValidated).toEqual([]);
            expect(result.messages).not.toContain(INVALID_REF);
            expect(result.thrown).toBeUndefined();
        });

        it("validates the generators.yml workspace at API level when it has generator groups, still ignoring the inline spec", async () => {
            const result = await check({
                "fern/docs.yml": docsYml(...inlineApi("Inline API", "inline/inline.yml")),
                "fern/generators.yml": [
                    "api:",
                    "  specs:",
                    "    - openapi: openapi/openapi.yml",
                    "groups:",
                    "  local:",
                    "    generators:",
                    "      - name: fernapi/fern-typescript-sdk",
                    "        version: 0.0.1",
                    "        output:",
                    "          location: local-file-system",
                    "          path: ../sdk",
                    ""
                ].join("\n"),
                "fern/openapi/openapi.yml": openApiSpec("From generators"),
                "fern/inline/inline.yml": openApiSpec("Inline", INVALID_REF)
            });

            const expected = [{ type: "oss", workspaceName: undefined, specPaths: ["fern/openapi/openapi.yml"] }];
            expect(result.projectWorkspaces).toEqual(expected);
            expect(result.docsOssWorkspaces).toEqual(expected);
            expect(result.apiValidated).toEqual(expected);
            expect(result.messages).not.toContain(INVALID_REF);
        });

        it("does not fall back even when the inline api-name is not among the project's workspaces", async () => {
            const result = await check({
                "fern/docs.yml": docsYml(...inlineApi("Inline API", "inline/inline.yml", { apiName: "inline-only" })),
                "fern/generators.yml": GENERATORS_YML,
                "fern/openapi/openapi.yml": openApiSpec("From generators"),
                "fern/inline/inline.yml": openApiSpec("Inline")
            });

            expect(result.docsOssWorkspaces.map((workspace) => workspace.workspaceName)).toEqual([undefined]);
            expect(result.docsOssWorkspaces.flatMap((workspace) => workspace.specPaths)).toEqual([
                "fern/openapi/openapi.yml"
            ]);
        });

        it("runs the fallback when the project's only API workspace is not an OSS workspace (definition/ folder)", async () => {
            // The fallback keys off the OSS workspace list being empty, not off the API workspace list being empty.
            const result = await check({
                "fern/docs.yml": docsYml(...inlineApi("Inline API", "inline/inline.yml")),
                "fern/definition/api.yml": "name: plants\n",
                "fern/inline/inline.yml": openApiSpec("Inline")
            });

            expect(result.projectWorkspaces.map((workspace) => workspace.type)).toEqual(["fern"]);
            expect(result.docsApiWorkspaces.map((workspace) => workspace.type)).toEqual(["fern"]);
            expect(result.docsOssWorkspaces).toEqual([
                { type: "oss", workspaceName: undefined, specPaths: ["fern/inline/inline.yml"] }
            ]);
        });
    });

    describe("(b) asyncapi/ folder with a docs.yml inline asyncapi spec", () => {
        it("uses the inline spec as an OSS workspace and does not load asyncapi/ as an API workspace", async () => {
            const result = await check({
                "fern/docs.yml": docsYml(
                    ...inlineApi("Events", "asyncapi/asyncapi.yml", { type: "asyncapi", apiName: "events" })
                ),
                "fern/asyncapi/asyncapi.yml": asyncApiSpec("Events")
            });

            expect(result.projectWorkspaces).toEqual([]);
            expect(result.docsOssWorkspaces).toEqual([
                { type: "oss", workspaceName: "events", specPaths: ["fern/asyncapi/asyncapi.yml"] }
            ]);
            expect(result.docsApiWorkspaces).toEqual([]);
            expect(result.apiValidated).toEqual([]);
            expect(result.thrown).toBeUndefined();
        });

        it("represents the asyncapi spec as an openapi-typed spec whose source is asyncapi", async () => {
            const result = await check({
                "fern/docs.yml": docsYml(...inlineApi("Events", "asyncapi/asyncapi.yml", { type: "asyncapi" })),
                "fern/asyncapi/asyncapi.yml": asyncApiSpec("Events")
            });
            const calls = vi.mocked(collectDocsWorkspaceViolations).mock.calls;
            const [workspace] = calls[0]?.[0].ossWorkspaces ?? [];
            expect(workspace?.allSpecs.map((spec) => spec.type)).toEqual(["openapi"]);
            expect(workspace?.allSpecs[0]).toMatchObject({ source: { type: "asyncapi" } });
            expect(result.docsOssWorkspaces).toHaveLength(1);
        });
    });

    describe("(c) inline specs nested inside versions and products", () => {
        const MISSING_API_MESSAGE = "No API definition found";

        it("does not find specs that live in version files (docs.yml `versions` only references files)", async () => {
            const result = await check({
                "fern/docs.yml": [
                    "instances:",
                    "  - url: plants.docs.buildwithfern.com",
                    "versions:",
                    "  - display-name: v1",
                    "    path: versions/v1.yml",
                    "  - display-name: v2",
                    "    path: versions/v2.yml",
                    ""
                ].join("\n"),
                "fern/versions/v1.yml": versionFile(inlineApi("API v1", "../openapi/v1.yml", { apiName: "v1" })),
                "fern/versions/v2.yml": versionFile(inlineApi("API v2", "../openapi/v2.yml", { apiName: "v2" })),
                "fern/openapi/v1.yml": openApiSpec("V1", INVALID_REF),
                "fern/openapi/v2.yml": openApiSpec("V2", INVALID_REF)
            });

            // Neither loadProject nor the fallback look inside version files: openapi/ is mis-loaded as a legacy API
            // workspace (reported, not thrown), no OSS workspace reaches docs validation and the specs go unchecked.
            expect(result.projectWorkspaces).toEqual([]);
            expect(result.docsOssWorkspaces).toEqual([]);
            expect(result.messages).toContain(MISSING_API_MESSAGE);
            expect(result.messages).not.toContain(INVALID_REF);
        });

        it("does not find specs that live in product files (docs.yml `products` only references files)", async () => {
            const result = await check({
                "fern/docs.yml": [
                    "instances:",
                    "  - url: plants.docs.buildwithfern.com",
                    "products:",
                    "  - display-name: Plants",
                    "    path: products/plants.yml",
                    "    slug: plants",
                    ""
                ].join("\n"),
                "fern/products/plants.yml": versionFile(inlineApi("Plants API", "../openapi/openapi.yml")),
                "fern/openapi/openapi.yml": openApiSpec("Plants", INVALID_REF)
            });

            expect(result.projectWorkspaces).toEqual([]);
            expect(result.docsOssWorkspaces).toEqual([]);
            expect(result.messages).toContain(MISSING_API_MESSAGE);
            expect(result.messages).not.toContain(INVALID_REF);
        });

        it("finds specs nested in tabs and sections of docs.yml's own navigation", async () => {
            const result = await check({
                "fern/docs.yml": [
                    "instances:",
                    "  - url: plants.docs.buildwithfern.com",
                    "navigation:",
                    "  - tab: reference",
                    "    layout:",
                    "      - section: Reference",
                    "        contents:",
                    "          - api: API Reference",
                    "            api-name: nested",
                    "            specs:",
                    "              - type: openapi",
                    "                path: openapi/openapi.yml",
                    "tabs:",
                    "  reference:",
                    "    display-name: Reference",
                    ""
                ].join("\n"),
                "fern/openapi/openapi.yml": openApiSpec("Nested", INVALID_REF)
            });

            expect(result.docsOssWorkspaces).toEqual([
                { type: "oss", workspaceName: "nested", specPaths: ["fern/openapi/openapi.yml"] }
            ]);
            expect(result.messages).toContain(INVALID_REF);
        });
    });

    describe("(d) specs: []", () => {
        it("treats an empty specs list as no inline spec: no fallback workspaces and no API workspace", async () => {
            const result = await check({
                "fern/docs.yml": docsYml("  - api: API Reference", "    specs: []"),
                "fern/openapi/openapi.yml": openApiSpec("Plants", INVALID_REF)
            });

            // loadProject does not recognise the section as inline, so openapi/ is mis-loaded as a legacy workspace
            // (reported, not thrown) and the invalid reference in it is never validated.
            expect(result.projectWorkspaces).toEqual([]);
            expect(result.docsOssWorkspaces).toEqual([]);
            expect(result.messages).not.toContain(INVALID_REF);
            expect(result.messages).toContain("No API definition found");
        });
    });

    describe("(e) several API sections and api-name", () => {
        it("creates one workspace per section; two sections with the same api-name both appear, an unnamed one has no name", async () => {
            const result = await check({
                "fern/docs.yml": docsYml(
                    ...inlineApi("Plants v1", "openapi/one.yml", { apiName: "plants" }),
                    ...inlineApi("Plants v2", "openapi/two.yml", { apiName: "plants" }),
                    ...inlineApi("Unnamed", "openapi/three.yml")
                ),
                "fern/openapi/one.yml": openApiSpec("One"),
                "fern/openapi/two.yml": openApiSpec("Two"),
                "fern/openapi/three.yml": openApiSpec("Three")
            });

            expect(result.projectWorkspaces).toEqual([]);
            expect(result.docsOssWorkspaces).toEqual([
                { type: "oss", workspaceName: "plants", specPaths: ["fern/openapi/one.yml"] },
                { type: "oss", workspaceName: "plants", specPaths: ["fern/openapi/two.yml"] },
                { type: "oss", workspaceName: undefined, specPaths: ["fern/openapi/three.yml"] }
            ]);
            expect(result.thrown).toBeUndefined();
        });

        it("reports a broken spec in any of several sections", async () => {
            const result = await check({
                "fern/docs.yml": docsYml(
                    ...inlineApi("Good", "openapi/good.yml", { apiName: "good" }),
                    ...inlineApi("Bad", "openapi/bad.yml", { apiName: "bad" })
                ),
                "fern/openapi/good.yml": openApiSpec("Good"),
                "fern/openapi/bad.yml": openApiSpec("Bad", INVALID_REF)
            });

            expect(result.docsOssWorkspaces.map((workspace) => workspace.workspaceName)).toEqual(["good", "bad"]);
            expect(result.messages).toContain(INVALID_REF);
        });
    });

    describe("(f) spec file outside the fern folder", () => {
        it("resolves ../specs/openapi.yml relative to docs.yml and validates it", async () => {
            const result = await check({
                "fern/docs.yml": docsYml(...inlineApi("Outside", "../specs/openapi.yml", { apiName: "outside" })),
                "specs/openapi.yml": openApiSpec("Outside", INVALID_REF)
            });

            expect(result.projectWorkspaces).toEqual([]);
            expect(result.docsOssWorkspaces).toEqual([
                { type: "oss", workspaceName: "outside", specPaths: ["specs/openapi.yml"] }
            ]);
            expect(result.messages).toContain(INVALID_REF);
        });

        it("passes validation for a valid spec outside the fern folder", async () => {
            const result = await check({
                "fern/docs.yml": docsYml(...inlineApi("Outside", "../specs/openapi.yml")),
                "specs/openapi.yml": openApiSpec("Outside")
            });

            expect(result.messages).not.toContain("invalid OpenAPI reference");
            expect(result.thrown).toBeUndefined();
        });
    });
});
