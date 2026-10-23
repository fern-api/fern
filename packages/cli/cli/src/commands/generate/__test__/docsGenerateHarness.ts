import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { TaskContext } from "@fern-api/task-context";
import axios from "axios";
import { afterEach, beforeEach, vi } from "vitest";

import { generateDocsWorkspace } from "../generateDocsWorkspace.js";
import {
    createTestCliContext,
    createTestProject,
    FAKE_FDR_ORIGIN,
    FakeFdr,
    type FdrRequest,
    type TestCliContext,
    type TestProject
} from "./commandHarness.js";

// Helpers shared by the `docsGenerate.<theme>.command.test.ts` files: they run `generateDocsWorkspace` the way the
// command does, with only the network stubbed, and read back what the command sent.

export type DeployMode = "ledger" | "legacy";

/** A reply with a status code, for the routes where `FakeFdr` can only answer 200 or 500. */
export interface StatusReply {
    status: number;
    body?: unknown;
    /** Sent as it is, instead of `body` as JSON (an answer that is not JSON). */
    raw?: string;
}

type StatusResponder = (request: FdrRequest) => StatusReply | "network-failure" | undefined;

/**
 * `FakeFdr` plus replies with any status code (FDR answers 401, 403 and 409 on purpose), and requests that never
 * reach FDR. A route answered here is recorded like any other request.
 */
export class DocsFdr extends FakeFdr {
    private readonly statusRoutes = new Map<string, StatusResponder>();
    private readonly calls: Array<{ method: string; url: string; path: string; headers: Record<string, string> }> = [];

    constructor() {
        super();
        // The route a legacy preview registers with has no default in `FakeFdr`.
        this.respond("POST /v2/registry/docs/preview/init", {
            docsRegistrationId: "registration-1",
            uploadUrls: {},
            skippedFiles: [],
            previewUrl: "https://acme-preview-1.docs.buildwithfern.com"
        });
    }

    override install(): void {
        super.install();
        const answerByDefault = globalThis.fetch;
        vi.stubGlobal(
            "fetch",
            vi.fn(async (input: unknown, init?: { method?: string; body?: unknown }) => {
                const request = await toFdrRequest(input, init);
                this.calls.push({
                    method: request.method,
                    url: request.url,
                    path: request.path,
                    headers: toHeaders(input, init)
                });
                const respond =
                    this.statusRoutes.get(`${request.method} ${request.path}`) ??
                    this.statusRoutes.get(`${request.method} ${request.url}`);
                const reply = respond?.(request);
                if (reply == null) {
                    return answerByDefault(input as never, init as never);
                }
                this.requests.push(request);
                if (reply === "network-failure") {
                    throw new TypeError("fetch failed");
                }
                return new Response(reply.raw ?? JSON.stringify(reply.body ?? {}), {
                    status: reply.status,
                    headers: { "content-type": reply.raw != null ? "text/html" : "application/json" }
                });
            })
        );
    }

    /** The headers (lower-cased names) of each request to `METHOD /path` (or `METHOD https://full/url`), in order. */
    headersTo(route: string): Array<Record<string, string>> {
        return this.calls
            .filter((call) => `${call.method} ${call.path}` === route || `${call.method} ${call.url}` === route)
            .map((call) => call.headers);
    }

    /** Answers `METHOD /path` (or `METHOD https://full/url`) with a status code, or `undefined` to answer as usual. */
    reply(route: string, reply: StatusReply | "network-failure" | StatusResponder): void {
        this.statusRoutes.set(route, typeof reply === "function" ? reply : () => reply);
    }

    /** Answers the first `times` requests to the route with `reply`, then answers as usual. */
    replyTimes(route: string, times: number, reply: StatusReply | "network-failure"): void {
        let remaining = times;
        this.reply(route, () => {
            if (remaining <= 0) {
                return undefined;
            }
            remaining -= 1;
            return reply;
        });
    }
}

async function toFdrRequest(input: unknown, init?: { method?: string; body?: unknown }): Promise<FdrRequest> {
    const isRequest = typeof input === "object" && input != null && "url" in input;
    const url = new URL(isRequest ? (input as Request).url : String(input));
    const method = isRequest ? (input as Request).method : (init?.method ?? "GET");
    const text = isRequest ? await (input as Request).clone().text() : bodyToText(init?.body);
    return {
        method,
        url: `${url.origin}${url.pathname}`,
        path: url.pathname,
        body: text === "" ? undefined : parse(text)
    };
}

function toHeaders(
    input: unknown,
    init?: { method?: string; body?: unknown; headers?: unknown }
): Record<string, string> {
    const isRequest = typeof input === "object" && input != null && "url" in input;
    const headers = new Headers(isRequest ? (input as Request).headers : undefined);
    new Headers(init?.headers as never).forEach((value, name) => headers.set(name, value));
    return Object.fromEntries(headers.entries());
}

function bodyToText(body: unknown): string {
    if (typeof body === "string") {
        return body;
    }
    if (body instanceof ArrayBuffer) {
        return Buffer.from(body).toString("utf-8");
    }
    return body instanceof Uint8Array ? Buffer.from(body).toString("utf-8") : "";
}

function parse(text: string): unknown {
    try {
        return JSON.parse(text);
    } catch {
        return text;
    }
}

/** Every environment variable `isCI` and `detectCISource` read, so a test starts as if run on a laptop. */
const CI_VARIABLES = [
    "CI",
    "CONTINUOUS_INTEGRATION",
    "GITHUB_ACTIONS",
    "GITLAB_CI",
    "CIRCLECI",
    "TRAVIS",
    "JENKINS_URL",
    "JENKINS_HOME",
    "TF_BUILD",
    "BUILDKITE",
    "CODEBUILD_BUILD_ID",
    "TEAMCITY_VERSION",
    "BITBUCKET_BUILD_NUMBER",
    "DRONE",
    "SEMAPHORE",
    "APPVEYOR",
    "BUDDY_WORKSPACE_ID",
    "WERCKER_RUN_ID",
    "GITHUB_REPOSITORY",
    "GITHUB_SERVER_URL",
    "GITHUB_RUN_ID",
    "GITHUB_SHA",
    "GITHUB_REF_NAME",
    "GITHUB_ACTOR",
    "GITLAB_USER_LOGIN",
    "GITLAB_USER_EMAIL",
    "CIRCLE_USERNAME",
    "BUILD_REQUESTEDFOR",
    "BUILD_REQUESTEDFOREMAIL"
];

export interface DocsCliContext extends TestCliContext {
    /** The questions the command asked, with the default it offered. */
    prompts: Array<{ message: string; defaultValue: boolean | undefined }>;
    /** The events the command sent to PostHog, through the task context and through the CLI context. */
    events: unknown[];
}

interface TaskRunners {
    runTask: (run: (context: TaskContext) => unknown) => Promise<unknown>;
    runTaskForWorkspace: (workspace: unknown, run: (context: TaskContext) => unknown) => Promise<unknown>;
    confirmPrompt: (message: string, defaultValue?: boolean) => Promise<boolean>;
    instrumentPostHogEvent: (event: unknown) => void;
}

/**
 * `createTestCliContext` with what the docs command needs on top: a task context that takes PostHog events (the
 * mock one throws), and a `confirmPrompt` that records its questions and answers with `answer`.
 */
export function createDocsCliContext(answer: (message: string) => boolean = () => true): DocsCliContext {
    const base = createTestCliContext();
    const prompts: DocsCliContext["prompts"] = [];
    const events: unknown[] = [];
    const runners = base.cliContext as unknown as TaskRunners;
    const { runTask, runTaskForWorkspace } = runners;
    const withEvents = (context: TaskContext): TaskContext => ({
        ...context,
        instrumentPostHogEvent: (event) => events.push(event)
    });
    runners.runTask = async (run) => runTask((context) => run(withEvents(context)));
    runners.runTaskForWorkspace = async (workspace, run) =>
        runTaskForWorkspace(workspace, (context) => run(withEvents(context)));
    runners.confirmPrompt = async (message, defaultValue) => {
        prompts.push({ message, defaultValue });
        return answer(message);
    };
    runners.instrumentPostHogEvent = (event) => events.push(event);
    return { ...base, prompts, events };
}

export interface DocsRunOptions {
    instance?: string;
    preview?: boolean;
    previewId?: string;
    force?: boolean;
    brokenLinks?: boolean;
    strictBrokenLinks?: boolean;
    disableTemplates?: boolean;
    noPrompt?: boolean;
    skipUpload?: boolean;
    includePrivate?: boolean;
    /** Replaces the context the command runs with (to change what the prompts answer). */
    cli?: DocsCliContext;
}

export interface DocsRunResult extends DocsCliContext {
    /** What the command threw, if it failed. A failed task throws a `TaskAbortSignal` after logging its message. */
    error: unknown;
    /** The lines the command logged at `error` level, without the level. */
    errors: string[];
}

export interface DocsEnvironment {
    fdr: DocsFdr;
    mode: DeployMode;
    /** `axios` calls (`put`, `post`, `get`) the command made; each throws unless the test stubbed it. */
    axiosCalls: Array<{ method: string; url: string; data?: unknown; headers?: unknown }>;
    /** Writes the project to disk and loads it. The project is removed after the test. */
    project(files: Record<string, string>): Promise<TestProject>;
    /** Runs the command and returns what it threw instead of failing. */
    attempt(project: TestProject | Promise<TestProject>, options?: DocsRunOptions): Promise<DocsRunResult>;
    /** Runs the command, which must succeed. */
    run(project: TestProject | Promise<TestProject>, options?: DocsRunOptions): Promise<DocsRunResult>;
    /** Lets `axios.put`, `axios.post` or `axios.get` answer instead of throwing. */
    stubAxios(method: "put" | "post" | "get", answer: (url: string, data?: unknown) => unknown): void;
    /** Sets `FERN_DOCS_DEPLOY_MODE`; the command's default is the ledger. */
    setDeployMode(mode: DeployMode): void;
}

/**
 * Registers the hooks that give each test a fresh fake FDR, the environment of a developer's laptop (no CI variables,
 * a token, FDR at `http://fdr.test`) and an `axios` that throws when a test did not expect a call.
 */
export function useDocsEnvironment(): DocsEnvironment {
    const projects: TestProject[] = [];
    const environment: DocsEnvironment = {
        fdr: new DocsFdr(),
        mode: "ledger",
        axiosCalls: [],
        project: async (files) => {
            const project = await createTestProject(files);
            projects.push(project);
            return project;
        },
        attempt: async (project, options = {}) => {
            const { project: loaded } = await project;
            const cli = options.cli ?? createDocsCliContext();
            let error: unknown;
            try {
                await generateDocsWorkspace({
                    project: loaded,
                    cliContext: cli.cliContext,
                    instance: options.instance,
                    preview: options.preview ?? false,
                    previewId: options.previewId,
                    force: options.force ?? true,
                    brokenLinks: options.brokenLinks ?? false,
                    strictBrokenLinks: options.strictBrokenLinks ?? false,
                    disableTemplates: options.disableTemplates,
                    noPrompt: options.noPrompt ?? true,
                    skipUpload: options.skipUpload ?? false,
                    includePrivate: options.includePrivate
                });
            } catch (thrown) {
                error = thrown;
            }
            return {
                ...cli,
                error,
                errors: cli.logs
                    .filter((line) => line.startsWith("error: "))
                    .map((line) => line.slice("error: ".length))
            };
        },
        run: async (project, options) => {
            const result = await environment.attempt(project, options);
            if (result.error != null) {
                throw new Error(`The command failed.\n${result.logs.join("\n")}`);
            }
            return result;
        },
        stubAxios: (method, answer) => {
            vi.spyOn(axios, method).mockImplementation((async (url: string, data?: unknown, config?: unknown) => {
                environment.axiosCalls.push({
                    method,
                    url,
                    data,
                    headers: (config as { headers?: unknown } | undefined)?.headers
                });
                return { data: answer(url, data), status: 200 };
            }) as never);
        },
        setDeployMode: (mode) => {
            environment.mode = mode;
            vi.stubEnv("FERN_DOCS_DEPLOY_MODE", mode);
        }
    };

    beforeEach(() => {
        environment.fdr = new DocsFdr();
        environment.mode = "ledger";
        environment.axiosCalls = [];
        for (const name of CI_VARIABLES) {
            vi.stubEnv(name, undefined as unknown as string);
        }
        vi.stubEnv("FERN_DOCS_DEPLOY_MODE", undefined as unknown as string);
        vi.stubEnv("FERN_SELF_HOSTED", undefined as unknown as string);
        vi.stubEnv("FERN_FDR_ORIGIN", FAKE_FDR_ORIGIN);
        vi.stubEnv("OVERRIDE_FDR_ORIGIN", undefined as unknown as string);
        vi.stubEnv("FERN_TOKEN", "token");
        environment.fdr.install();
        for (const method of ["put", "post", "get"] as const) {
            vi.spyOn(axios, method).mockImplementation((async (url: string, data?: unknown, config?: unknown) => {
                environment.axiosCalls.push({
                    method,
                    url,
                    data,
                    headers: (config as { headers?: unknown } | undefined)?.headers
                });
                throw new Error(`Unexpected axios.${method} ${url}`);
            }) as never);
        }
    });

    afterEach(async () => {
        vi.useRealTimers();
        vi.restoreAllMocks();
        vi.unstubAllEnvs();
        vi.unstubAllGlobals();
        await Promise.all(projects.splice(0).map((project) => project.cleanup()));
    });

    return environment;
}

/**
 * Runs a command that waits on timers (a retry delay, a backoff) by moving the clock forward until it settles.
 * Call `vi.useFakeTimers({ toFake: FAKE_TIMEOUTS })` before starting the command.
 */
export const FAKE_TIMEOUTS: Array<"setTimeout" | "clearTimeout"> = ["setTimeout", "clearTimeout"];

export async function settleWithFakeTimers<T>(pending: Promise<T>, stepMs = 1_000): Promise<T> {
    let settled = false;
    const done = pending.then(
        () => {
            settled = true;
        },
        () => {
            settled = true;
        }
    );
    while (!settled) {
        await vi.advanceTimersByTimeAsync(stepMs);
        await new Promise<void>((resolve) => setImmediate(resolve));
    }
    await done;
    return pending;
}

/** Writes a file next to the `fern/` folder (a path with `../` in docs.yml or a page reaches it). */
export async function writeBesideFernFolder(
    project: TestProject,
    relativePath: string,
    content: string
): Promise<void> {
    const absolutePath = path.join(project.directory, relativePath);
    await mkdir(path.dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, content);
}

/** An SVG image of the given size, which is all the command needs to measure and upload an image. */
export function svg(width: number, height: number): string {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="${width}" height="${height}"/></svg>\n`;
}

export const FERN_CONFIG = '{"organization":"acme","version":"*"}';

const OPENAPI = `openapi: 3.0.0
info: { title: Pets, version: 1.0.0 }
paths:
  /pet/{petId}:
    get:
      operationId: getPet
      parameters:
        - { name: petId, in: path, required: true, schema: { type: string } }
      responses:
        "200": { description: ok }
`;

export const PETS_OPENAPI = OPENAPI;

/** A docs project with the files given (paths relative to `fern/`) over `fern.config.json`. */
export function docsFiles(docsYml: string, extra: Record<string, string> = {}): Record<string, string> {
    return { "fern.config.json": FERN_CONFIG, "docs.yml": docsYml, ...extra };
}

/** The docs.yml header every test starts from: one instance and the pages `navigation` lists. */
export function docsYml(navigation: string, { url = "acme.docs.buildwithfern.com", rest = "" } = {}): string {
    return `instances:\n  - url: ${url}\n${rest}navigation:\n${navigation}`;
}

/** A docs project with one page, "Welcome", and nothing else. */
export const ONE_PAGE: Record<string, string> = docsFiles(docsYml("  - page: Welcome\n    path: welcome.mdx\n"), {
    "welcome.mdx": "# Welcome\n"
});

/** A docs.yml that publishes the Pets OpenAPI spec (read from `openapi/openapi.yml`) as an API reference. */
export const OPENAPI_DOCS: Record<string, string> = docsFiles(
    `instances:
  - url: acme.docs.buildwithfern.com
navigation:
  - api: API Reference
    specs:
      - type: openapi
        path: openapi/openapi.yml
`,
    { "openapi/openapi.yml": OPENAPI }
);

// ── Reading what the command sent ────────────────────────────────────────────────────────────────

/** The bodies the command uploaded to the blob store, by the hash FDR was told (ledger mode). */
export function uploadedBlobs(fdr: FakeFdr): Map<string, unknown> {
    const blobs = new Map<string, unknown>();
    for (const request of fdr.requests) {
        if (request.method === "PUT" && request.url.startsWith("https://s3.test/blob/")) {
            blobs.set(request.url.slice("https://s3.test/blob/".length), request.body);
        }
    }
    return blobs;
}

export interface LedgerLocale {
    locale: string;
    root: unknown;
    pages: Record<string, { hash: string; contentType: string; contentLength: number; referencedFiles?: string[] }>;
    config: Record<string, unknown>;
    apiManifest: { hash: string } | null;
    jsFiles: { hash: string } | null;
    fileManifest?: Record<string, { hash: string; contentType: string; contentLength: number; filename: string }>;
    git?: { repoUrl: string; branch: string; commitSha?: string };
}

export interface LedgerRegisterBody {
    orgId: string;
    domain: string;
    basepath: string;
    basepathAware?: boolean;
    customDomains: string[];
    previewId: string | null;
    defaultLocale: string;
    locales: LedgerLocale[];
}

/** The body of the one `POST /docs-ledger/register` of a production publish. */
export function ledgerRegister(fdr: FakeFdr): LedgerRegisterBody {
    const [request] = fdr.to("POST /docs-ledger/register");
    if (request == null) {
        throw new Error("The command never called POST /docs-ledger/register");
    }
    return request.body as LedgerRegisterBody;
}

/** The body of the one `POST /docs-ledger/preview/init` of a ledger preview. */
export function ledgerPreviewRegister(fdr: FakeFdr): Record<string, unknown> & { locales: LedgerLocale[] } {
    const [request] = fdr.to("POST /docs-ledger/preview/init");
    if (request == null) {
        throw new Error("The command never called POST /docs-ledger/preview/init");
    }
    return request.body as Record<string, unknown> & { locales: LedgerLocale[] };
}

/** The markdown of every page of a locale, read from the blobs the command uploaded (ledger mode). */
export function ledgerPages(fdr: FakeFdr, locale: LedgerLocale): Record<string, string> {
    const blobs = uploadedBlobs(fdr);
    return Object.fromEntries(
        Object.entries(locale.pages).map(([pageId, page]) => [pageId, String(blobs.get(page.hash))])
    );
}

/** The API definitions of a locale by FDR id, read from its manifest blob (ledger mode). */
export function ledgerApis(fdr: FakeFdr, locale: LedgerLocale): Record<string, Record<string, unknown>> {
    if (locale.apiManifest == null) {
        return {};
    }
    return (uploadedBlobs(fdr).get(locale.apiManifest.hash) ?? {}) as Record<string, Record<string, unknown>>;
}

/** The `jsFiles` blob of a locale (ledger mode): relative path to file contents. */
export function ledgerJsFiles(fdr: FakeFdr, locale: LedgerLocale): Record<string, string> {
    if (locale.jsFiles == null) {
        return {};
    }
    return (uploadedBlobs(fdr).get(locale.jsFiles.hash) ?? {}) as Record<string, string>;
}

export interface LegacyDocsDefinition {
    pages: Record<string, { markdown: string; rawMarkdown?: string; editThisPageUrl?: string }>;
    config: Record<string, unknown> & { root?: unknown };
    jsFiles?: Record<string, string>;
}

/** The body of the one `POST /v2/registry/docs/register/<id>` of a legacy publish. */
export function legacyFinish(fdr: FakeFdr): {
    docsRegistrationId?: string;
    docsDefinition: LegacyDocsDefinition;
    excludeApis?: boolean;
    basepathAware?: boolean;
} {
    const finishes = fdr.requests.filter(
        (request) => request.method === "POST" && request.path.startsWith("/v2/registry/docs/register/")
    );
    const [request] = finishes;
    if (request == null) {
        throw new Error("The command never finished a legacy docs registration");
    }
    return request.body as never;
}

/** What the published site holds, whichever deploy mode ran: the markdown by page id and the navigation root. */
export function publishedSite(
    fdr: FakeFdr,
    mode: DeployMode,
    { preview = false }: { preview?: boolean } = {}
): { pages: Record<string, string>; root: unknown } {
    if (mode === "legacy") {
        const { docsDefinition } = legacyFinish(fdr);
        return {
            pages: Object.fromEntries(Object.entries(docsDefinition.pages).map(([id, page]) => [id, page.markdown])),
            root: docsDefinition.config.root
        };
    }
    const [base] = preview ? ledgerPreviewRegister(fdr).locales : ledgerRegister(fdr).locales;
    if (base == null) {
        throw new Error("The ledger register had no locales");
    }
    return { pages: ledgerPages(fdr, base), root: base.root };
}

/** The titles and slugs of the navigation nodes under a root, depth first (for asserting the tree's shape). */
export function navigationNodes(root: unknown): Array<{ type: string; title?: string; slug?: string }> {
    const nodes: Array<{ type: string; title?: string; slug?: string }> = [];
    const visit = (value: unknown): void => {
        if (Array.isArray(value)) {
            value.forEach(visit);
            return;
        }
        if (typeof value !== "object" || value == null) {
            return;
        }
        const record = value as Record<string, unknown>;
        if (typeof record.type === "string" && (typeof record.title === "string" || typeof record.slug === "string")) {
            nodes.push({
                type: record.type,
                title: typeof record.title === "string" ? record.title : undefined,
                slug: typeof record.slug === "string" ? record.slug : undefined
            });
        }
        Object.values(record).forEach(visit);
    };
    visit(root);
    return nodes;
}
