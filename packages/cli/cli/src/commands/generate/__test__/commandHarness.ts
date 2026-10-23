import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { Readable } from "node:stream";
import { crc32 } from "node:zlib";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { createLogger, LogLevel } from "@fern-api/logger";
import { loadProjectFromDirectory, type Project } from "@fern-api/project-loader";
import { createMockTaskContext, type TaskContext } from "@fern-api/task-context";
import axios from "axios";
import { vi } from "vitest";

import type { CliContext } from "../../../cli-context/CliContext.js";

// Helpers for command-level tests: a real project on disk, a CliContext that records what the command logs, and a
// fake FDR behind a stubbed `fetch`, so the test sees every request the command sends and nothing leaves the process.

export interface TestProject {
    project: Project;
    directory: string;
    cleanup: () => Promise<void>;
}

/** Writes `files` (paths relative to the `fern/` folder) to a temporary directory and loads it like the CLI does. */
export async function createTestProject(files: Record<string, string>): Promise<TestProject> {
    const directory = await mkdtemp(path.join(tmpdir(), "fern-command-test-"));
    const fernDirectory = path.join(directory, "fern");
    for (const [relativePath, content] of Object.entries(files)) {
        const absolutePath = path.join(fernDirectory, relativePath);
        await mkdir(path.dirname(absolutePath), { recursive: true });
        await writeFile(absolutePath, content);
    }
    const project = await loadProjectFromDirectory({
        absolutePathToFernDirectory: AbsoluteFilePath.of(fernDirectory),
        cliName: "fern",
        cliVersion: "0.0.0",
        commandLineApiWorkspace: undefined,
        defaultToAllApiWorkspaces: true,
        context: createMockTaskContext()
    });
    return { project, directory, cleanup: () => rm(directory, { recursive: true, force: true }) };
}

export interface TestCliContext {
    cliContext: CliContext;
    /** Everything the command logged, as `level: message`. */
    logs: string[];
    /** Whether a log line contains the text. */
    logged: (text: string) => boolean;
}

export function createTestCliContext(): TestCliContext {
    const logs: string[] = [];
    const logger = createLogger((level: LogLevel, ...args: string[]) => logs.push(`${level}: ${args.join(" ")}`));
    const task = createMockTaskContext({ logger });
    const taskContext = {
        ...task,
        setSubtitle: vi.fn(),
        // Unlike the real CliContext, which catches the failure and returns `false`, a failed task throws out of
        // here. The tests rely on that to read what a command failed with; a command that branches on the
        // returned boolean (runRemoteGenerationForAPIWorkspace does, to fail after sibling generators finish)
        // is therefore not covered for siblings.
        runInteractiveTask: async (_options: unknown, run: (context: TaskContext) => Promise<unknown>) => {
            await run(taskContext as never);
            return true;
        }
    } as unknown as TaskContext;
    const cliContext = {
        environment: { packageVersion: "0.0.0" },
        failAndThrow: task.failAndThrow,
        instrumentPostHogEvent: vi.fn(),
        confirmPrompt: vi.fn(async () => true),
        logger,
        runTask: vi.fn(async (run: (context: TaskContext) => unknown) => run(taskContext)),
        runTaskForWorkspace: vi.fn(async (_workspace: unknown, run: (context: TaskContext) => unknown) =>
            run(taskContext)
        )
    } as unknown as CliContext;
    return { cliContext, logs, logged: (text) => logs.some((line) => line.includes(text)) };
}

export interface FdrRequest {
    method: string;
    /** The full URL, including a host other than FDR's (a download or upload link FDR handed out). */
    url: string;
    /** The path without the host or the query. */
    path: string;
    body: unknown;
}

type Responder = (request: FdrRequest) => unknown;

/** The origin the fake FDR answers for; point FERN_FDR_ORIGIN at it. */
export const FAKE_FDR_ORIGIN = "http://fdr.test";

/**
 * Stands in for the FDR service behind `fetch`. It records every request, answers each route with a working default
 * and lets a test change the answer for one route. A response that is an `Error` makes that route fail with a 500.
 */
export class FakeFdr {
    readonly requests: FdrRequest[] = [];
    private readonly overrides = new Map<string, Responder>();

    install(): void {
        vi.stubGlobal(
            "fetch",
            vi.fn(async (input: unknown, init?: { method?: string; body?: unknown }) => this.handle(input, init))
        );
    }

    /** Answers `METHOD /path` with `response` (a value, or a function of the request) instead of the default. */
    respond(route: string, response: Responder | object | null): void {
        this.overrides.set(route, isResponder(response) ? response : () => response);
    }

    /** The requests to `METHOD /path` (or `METHOD https://full/url`), in the order they were sent. */
    to(route: string): FdrRequest[] {
        return this.requests.filter(
            (request) => `${request.method} ${request.path}` === route || `${request.method} ${request.url}` === route
        );
    }

    private async handle(input: unknown, init?: { method?: string; body?: unknown }): Promise<Response> {
        const isRequest = typeof input === "object" && input != null && "url" in input;
        const url = new URL(isRequest ? (input as Request).url : String(input));
        const method = isRequest ? (input as Request).method : (init?.method ?? "GET");
        const text = isRequest ? await (input as Request).clone().text() : bodyToText(init?.body);
        const request: FdrRequest = {
            method,
            url: `${url.origin}${url.pathname}`,
            path: url.pathname,
            body: text === "" ? undefined : safeParse(text)
        };
        this.requests.push(request);
        const respond =
            this.overrides.get(`${method} ${url.pathname}`) ??
            this.overrides.get(`${method} ${request.url}`) ??
            defaultResponder;
        const response = respond(request);
        if (response instanceof Error) {
            return new Response(JSON.stringify({ error: response.message }), { status: 500 });
        }
        return new Response(JSON.stringify(response === undefined ? {} : response), {
            status: 200,
            headers: { "content-type": "application/json" }
        });
    }
}

const isResponder = (response: Responder | object | null): response is Responder => typeof response === "function";

function bodyToText(body: unknown): string {
    if (typeof body === "string") {
        return body;
    }
    if (body instanceof ArrayBuffer) {
        return Buffer.from(body).toString("utf-8");
    }
    return body instanceof Uint8Array ? Buffer.from(body).toString("utf-8") : "";
}

function safeParse(text: string): unknown {
    try {
        return JSON.parse(text);
    } catch {
        return text;
    }
}

function defaultResponder({ method, path, body }: FdrRequest): unknown {
    if (method === "POST" && path === "/v2/registry/docs/v2/init") {
        return { docsRegistrationId: "registration-1", uploadUrls: {}, skippedFiles: [] };
    }
    if (method === "POST" && path === "/registry/api/register") {
        return { apiDefinitionId: "definition-1" };
    }
    if (method === "POST" && path === "/slugs/markdowns") {
        return { entries: [] };
    }
    if (method === "POST" && path === "/registry/api/sdk-dynamic-ir-upload-urls") {
        const languages = Object.keys((body as { snippetConfiguration: Record<string, unknown> }).snippetConfiguration);
        return {
            uploadUrls: Object.fromEntries(
                languages.map((language) => [language, { uploadUrl: `https://s3.test/dynamic-ir/${language}` }])
            )
        };
    }
    if (method === "POST" && path === "/generators/by-image") {
        // The CLI looks the generator up to find its IR version, and carries on without when there is no answer.
        return null;
    }
    if (method === "POST" && path === "/snippets/load") {
        return { snippets: {} };
    }
    if (method === "POST" && path === "/docs-ledger/register") {
        // Asks for every blob, like a first publish, so the test can read what the command uploads.
        return { deploymentHash: "hash-1", missingContent: findBlobHashes(body).map(toBlobUpload) };
    }
    if (method === "POST" && path === "/docs-ledger/preview/init") {
        return {
            deploymentHash: "hash-1",
            missingContent: findBlobHashes(body).map(toBlobUpload),
            domain: "acme-preview-1.docs.buildwithfern.com",
            basepath: "",
            previewId: "preview-1",
            previewUrl: "https://acme-preview-1.docs.buildwithfern.com"
        };
    }
    if (method === "POST" && path === "/docs-ledger/register/finish") {
        return { deploymentId: "deployment-1", reusedDeployment: false };
    }
    return {};
}

/** Where the fake FDR tells the command to upload the blob with this hash. */
export const blobUploadUrl = (hash: string): string => `https://s3.test/blob/${hash}`;

const toBlobUpload = (hash: string): { hash: string; uploadUrl: string } => ({ hash, uploadUrl: blobUploadUrl(hash) });

/** Every content hash a ledger register request refers to: the objects with a `hash` and a `contentLength`. */
function findBlobHashes(value: unknown): string[] {
    if (Array.isArray(value)) {
        return value.flatMap(findBlobHashes);
    }
    if (typeof value !== "object" || value == null) {
        return [];
    }
    const { hash, contentLength } = value as { hash?: unknown; contentLength?: unknown };
    const own = typeof hash === "string" && typeof contentLength === "number" ? [hash] : [];
    return [...own, ...Object.values(value).flatMap(findBlobHashes)];
}

/** A zip with one stored file, which is all a build's artifact needs to be for the command to unpack it. */
function createZip(fileName: string, content: string): Buffer {
    const name = Buffer.from(fileName);
    const data = Buffer.from(content);
    const checksum = crc32(data);
    const fields = (...values: Array<[number, number]>): Buffer => {
        const buffer = Buffer.alloc(values.reduce((size, [, width]) => size + width, 0));
        let offset = 0;
        for (const [value, width] of values) {
            if (width === 4) {
                buffer.writeUInt32LE(value, offset);
            } else {
                buffer.writeUInt16LE(value, offset);
            }
            offset += width;
        }
        return buffer;
    };
    const local = Buffer.concat([
        fields(
            [0x04034b50, 4],
            [20, 2],
            [0, 2],
            [0, 2],
            [0, 2],
            [0x21, 2],
            [checksum, 4],
            [data.length, 4],
            [data.length, 4],
            [name.length, 2],
            [0, 2]
        ),
        name,
        data
    ]);
    const central = Buffer.concat([
        fields(
            [0x02014b50, 4],
            [20, 2],
            [20, 2],
            [0, 2],
            [0, 2],
            [0, 2],
            [0x21, 2],
            [checksum, 4],
            [data.length, 4],
            [data.length, 4],
            [name.length, 2],
            [0, 2],
            [0, 2],
            [0, 2],
            [0, 2],
            [0, 4],
            [0, 4]
        ),
        name
    ]);
    const end = fields([0x06054b50, 4], [0, 2], [0, 2], [1, 2], [1, 2], [central.length, 4], [local.length, 4], [0, 2]);
    return Buffer.concat([local, central, end]);
}

export interface BuiltTarget {
    language: string;
    sdk: { name: string; version: string };
    package?: Record<string, string>;
}

export interface TargetOutcome {
    /** The version the build reports, as an AUTO build would; defaults to the version the CLI asked for. */
    actualVersion?: string;
    /** The text of the snippets file the build saved; leave out when it saved none. */
    snippets?: string;
    /** Makes the build of this target fail with this message. */
    failure?: string;
}

/**
 * Stands in for sdk-gen-api behind `axios`: it takes the build the command submits, answers its status with every
 * target built (or failed), and serves the artifact and the snippets file at the links it hands out.
 */
export class FakeSdkGenApi {
    /** The targets of every build the command submitted. */
    readonly submitted: BuiltTarget[] = [];
    private readonly outcomes = new Map<string, TargetOutcome>();
    private targetIds = new Map<string, BuiltTarget>();

    install(): void {
        vi.stubEnv("FERN_SDK_GEN_API_ORIGIN", "https://sdk-gen-api.test");
        vi.spyOn(axios, "post").mockImplementation((async (_url: string, form: { getBuffer(): Buffer }) => {
            const text = form.getBuffer().toString("utf8");
            const request = JSON.parse(text.match(/name="request"\r\n\r\n([^\r\n]+)/)?.[1] ?? "{}") as {
                targets: Array<BuiltTarget & { targetId: string }>;
            };
            for (const target of request.targets) {
                this.targetIds.set(target.targetId, target);
                this.submitted.push(target);
            }
            return { data: { buildId: "build-1" } };
        }) as never);
        vi.spyOn(axios, "get").mockImplementation((async (url: string) => {
            if (url.endsWith("/v1/fern/build/build-1")) {
                return { data: { buildId: "build-1", status: "succeeded", targets: this.statuses() } };
            }
            if (url.startsWith("https://s3.test/artifact/")) {
                return { data: Readable.from([createZip("README.md", "generated")]) };
            }
            if (url.startsWith("https://s3.test/snippets/")) {
                return { data: this.outcomes.get(url.slice("https://s3.test/snippets/".length))?.snippets };
            }
            throw new Error(`Unexpected GET ${url}`);
        }) as never);
    }

    /** What building the target of this language gives. Targets with no outcome build with defaults. */
    willBuild(language: string, outcome: TargetOutcome): void {
        this.outcomes.set(language, outcome);
    }

    private statuses(): unknown[] {
        return [...this.targetIds].map(([targetId, target]) => {
            const outcome = this.outcomes.get(target.language) ?? {};
            if (outcome.failure != null) {
                return { targetId, status: "failed", logs: [], error: { message: outcome.failure } };
            }
            return {
                targetId,
                status: "succeeded",
                logs: [],
                result: {
                    artifactUrl: `https://s3.test/artifact/${target.language}`,
                    actualVersion: outcome.actualVersion ?? target.sdk.version,
                    ...(outcome.snippets != null && { snippetsUrl: `https://s3.test/snippets/${target.language}` })
                }
            };
        });
    }
}

export interface FiddleOutcome {
    /** The version Fiddle reports back for the SDK, as it does for a published or auto-versioned one. */
    actualVersion?: string;
    /** The text of the snippet.json the generator wrote; leave out when it wrote none. */
    snippets?: string;
    /** Makes the job fail with this message. */
    failure?: string;
}

const FIDDLE_ORIGIN = "https://fiddle-coordinator.buildwithfern.com";

/**
 * Stands in for the Fiddle service, which runs `generators.yml` generators, behind the fake FDR's `fetch` and
 * `axios`: it takes the job the command creates and reports it finished (or failed) on the first poll.
 */
export class FakeFiddle {
    /** The bodies of the jobs the command created. */
    readonly jobs: unknown[] = [];
    private outcome: FiddleOutcome = {};

    install(fdr: FakeFdr): void {
        fdr.respond(`POST ${FIDDLE_ORIGIN}/api/remote-gen/create-job-v3`, ({ body }) => {
            this.jobs.push(body);
            return { jobId: "job-1", taskIds: ["task-1"] };
        });
        fdr.respond(`POST ${FIDDLE_ORIGIN}/api/remote-gen/jobs/job-1/status`, () => ({
            "task-1": {
                id: "task-1",
                packages: [],
                logs: [],
                status:
                    this.outcome.failure != null
                        ? { _type: "failed", message: this.outcome.failure }
                        : {
                              _type: "finished",
                              hasFilesToDownload: true,
                              s3PreSignedReadUrl: "https://s3.test/artifact/fiddle",
                              s3PreSignedReadUrlV2: "https://s3.test/artifact/fiddle",
                              createdSnippets: this.outcome.snippets != null,
                              snippetsS3PreSignedReadUrl:
                                  this.outcome.snippets != null ? "https://s3.test/snippets/fiddle" : undefined,
                              actualVersion: this.outcome.actualVersion
                          }
            }
        }));
        // The command starts the job by uploading its sources.
        vi.spyOn(axios, "post").mockImplementation((async (url: string) => {
            if (url === `${FIDDLE_ORIGIN}/api/remote-gen/jobs/job-1/start`) {
                return { data: {} };
            }
            throw new Error(`Unexpected POST ${url}`);
        }) as never);
        vi.spyOn(axios, "get").mockImplementation((async (url: string) => {
            if (url.startsWith("https://s3.test/artifact/")) {
                return { data: Readable.from([createZip("README.md", "generated")]) };
            }
            if (url === "https://s3.test/snippets/fiddle") {
                return { data: Readable.from([this.outcome.snippets ?? ""]) };
            }
            throw new Error(`Unexpected GET ${url}`);
        }) as never);
    }

    /** What the job of the next generation reports. */
    willFinish(outcome: FiddleOutcome): void {
        this.outcome = outcome;
    }
}
