import type { Dirent } from "node:fs";
import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { Readable } from "node:stream";
import { crc32, gunzipSync } from "node:zlib";
import { logErrorMessage } from "@fern-api/cli-logger";
import { extractErrorMessage } from "@fern-api/core-utils";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { createLogger, LogLevel } from "@fern-api/logger";
import { loadProjectFromDirectory, type Project } from "@fern-api/project-loader";
import { createMockTaskContext, TaskAbortSignal, type TaskContext, TaskResult } from "@fern-api/task-context";
import axios, { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import { vi } from "vitest";

import type { CliContext } from "../../../cli-context/CliContext.js";
import { TaskContextImpl } from "../../../cli-context/TaskContextImpl.js";
import { FAKE_FDR_ORIGIN, FakeFdr } from "./commandHarness.js";
import { resetMocks, TEST_TOKEN } from "./sdkGenerateMocks.js";

// A full-stack harness for `fern generate` of SDKs. `generateAPIWorkspaces` runs for real (project on disk, real
// OpenAPI to IR conversion, real source archives, real task contexts); only the network is replaced:
//   - `fetch` is answered by the fake FDR from commandHarness.ts, plus a Fiddle simulator for the generators.yml path.
//   - `axios.get` / `axios.post` are answered by one dispatcher that plays sdk-gen-api, Fiddle's job start and the
//     artifact / snippet downloads. Any other axios call throws, so nothing can reach the internet.

export const FIDDLE_ORIGIN = "https://fiddle-coordinator.buildwithfern.com";
export const SDK_GEN_API_ORIGIN = "https://sdk-gen-api.test";

export const OPENAPI = `openapi: 3.0.0
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

export const FERN_CONFIG = '{"organization":"acme","version":"*"}';

// ---------------------------------------------------------------------------------------------------------------
// Zip files and multipart bodies
// ---------------------------------------------------------------------------------------------------------------

/** A zip with every file stored (not compressed), which is all a build's artifact needs to be to be unpacked. */
export function createZip(files: Record<string, string>): Buffer {
    const locals: Buffer[] = [];
    const centrals: Buffer[] = [];
    let offset = 0;
    for (const [fileName, content] of Object.entries(files)) {
        const name = Buffer.from(fileName);
        const data = Buffer.from(content);
        const checksum = crc32(data);
        const local = Buffer.alloc(30);
        local.writeUInt32LE(0x04034b50, 0);
        local.writeUInt16LE(20, 4);
        local.writeUInt16LE(0x21, 12);
        local.writeUInt32LE(checksum, 14);
        local.writeUInt32LE(data.length, 18);
        local.writeUInt32LE(data.length, 22);
        local.writeUInt16LE(name.length, 26);
        const central = Buffer.alloc(46);
        central.writeUInt32LE(0x02014b50, 0);
        central.writeUInt16LE(20, 4);
        central.writeUInt16LE(20, 6);
        central.writeUInt16LE(0x21, 14);
        central.writeUInt32LE(checksum, 16);
        central.writeUInt32LE(data.length, 20);
        central.writeUInt32LE(data.length, 24);
        central.writeUInt16LE(name.length, 28);
        central.writeUInt32LE(offset, 42);
        locals.push(local, name, data);
        centrals.push(central, name);
        offset += local.length + name.length + data.length;
    }
    const centralDirectory = Buffer.concat(centrals);
    const end = Buffer.alloc(22);
    end.writeUInt32LE(0x06054b50, 0);
    end.writeUInt16LE(Object.keys(files).length, 8);
    end.writeUInt16LE(Object.keys(files).length, 10);
    end.writeUInt32LE(centralDirectory.length, 12);
    end.writeUInt32LE(offset, 16);
    return Buffer.concat([...locals, centralDirectory, end]);
}

export interface MultipartPart {
    name: string;
    filename: string | undefined;
    contentType: string | undefined;
    body: Buffer;
}

function parseMultipart(form: { getBuffer(): Buffer; getBoundary(): string }): MultipartPart[] {
    const buffer = form.getBuffer();
    const delimiter = Buffer.from(`--${form.getBoundary()}`);
    const parts: MultipartPart[] = [];
    let position = buffer.indexOf(delimiter);
    while (position !== -1) {
        const start = position + delimiter.length;
        if (buffer.subarray(start, start + 2).toString() === "--") {
            break;
        }
        const next = buffer.indexOf(delimiter, start);
        if (next === -1) {
            break;
        }
        const raw = buffer.subarray(start + 2, next - 2);
        const headerEnd = raw.indexOf("\r\n\r\n");
        const headers = raw.subarray(0, headerEnd).toString("utf8");
        parts.push({
            name: /name="([^"]*)"/.exec(headers)?.[1] ?? "",
            filename: /filename="([^"]*)"/.exec(headers)?.[1],
            contentType: /Content-Type: ([^\r\n]+)/i.exec(headers)?.[1],
            body: raw.subarray(headerEnd + 4)
        });
        position = next;
    }
    return parts;
}

// ---------------------------------------------------------------------------------------------------------------
// Fiddle (generators.yml generators)
// ---------------------------------------------------------------------------------------------------------------

export interface FiddlePackage {
    type: "npm" | "pypi" | "maven" | "ruby" | "nuget" | "crates";
    /** Defaults to PUBLISHED. */
    status?: "NOT_STARTED_PUBLISHING" | "PUBLISHING" | "PUBLISHED" | "FAILED_TO_PUBLISH";
    name?: string;
    group?: string;
    artifact?: string;
    version: string;
}

export interface FiddleOutcome {
    /** The version Fiddle reports back (a published, tagged or auto-versioned SDK). */
    actualVersion?: string;
    /** The text of the snippet.json the generator wrote; leave out when it wrote none. */
    snippets?: string;
    /** Makes the job fail with this message. */
    failure?: string;
    /** The packages Fiddle published, which the CLI reports as `Published ...`. */
    packages?: FiddlePackage[];
    pullRequestUrl?: string;
    noChangesDetected?: boolean;
    /** Log lines of the task. */
    logs?: Array<{ level: "DEBUG" | "INFO" | "WARN" | "ERROR"; message: string }>;
    /** The files in the artifact; defaults to a README.md. */
    files?: Record<string, string>;
    /** Reports a finished job with no artifact to download (GitHub outputs). */
    noArtifact?: boolean;
    /** Makes the download of the artifact fail. */
    artifactDownloadFails?: boolean;
    /** Makes creating the job fail with this HTTP status and JSON body. */
    createJobError?: { status: number; body: unknown };
    /** Makes starting the job (the upload of the IR) fail. */
    startFails?: boolean;
}

export interface FiddleJob {
    jobId: string;
    /** The body of the create-job request. */
    request: FiddleCreateJobBody;
    /** Whether the job was started (the IR and sources uploaded). */
    started: boolean;
    /** The IR the command uploaded when it started the job. */
    ir: () => FiddleIr;
    /** Whether the command uploaded a source archive. */
    hasSpecs: boolean;
}

export interface FiddleCreateJobBody {
    apiName: string;
    version?: string;
    organizationName: string;
    generators: Array<{
        id: string;
        version: string;
        outputMode: { type?: string; _type?: string } & Record<string, unknown>;
        customConfig?: unknown;
        publishMetadata?: unknown;
    }>;
    uploadToS3?: boolean;
    preview?: boolean;
    pushPreviewBranch?: boolean;
    whitelabel?: unknown;
    replay?: { enabled: boolean };
    fernignoreContents?: string;
    skipIfNoDiff?: boolean;
    verify?: boolean;
}

export interface FiddleIr {
    version?: string;
    publishConfig?: Record<string, unknown> & { type?: string; _type?: string };
    readmeConfig?: unknown;
    selfHosted?: boolean;
    [key: string]: unknown;
}

class FiddleSimulator {
    /** Every job the command created, in creation order. */
    readonly jobs: FiddleJob[] = [];
    /** The requests the command sent to Fiddle, as `METHOD /path`. */
    readonly requests: string[] = [];
    private defaultOutcome: FiddleOutcome = {};
    private readonly outcomesByGenerator = new Map<string, FiddleOutcome>();
    private readonly jobOutcomes = new Map<string, FiddleOutcome>();
    private readonly artifacts = new Map<string, Buffer>();
    private readonly snippetTexts = new Map<string, string>();
    private readonly irs = new Map<string, Buffer>();
    private readonly started = new Set<string>();
    private readonly specs = new Set<string>();

    /** What every job reports, unless its generator has its own outcome. */
    willFinish(outcome: FiddleOutcome): void {
        this.defaultOutcome = outcome;
    }

    /** What the job of this generator (for example `fernapi/fern-python-sdk`) reports. */
    willFinishFor(generatorId: string, outcome: FiddleOutcome): void {
        this.outcomesByGenerator.set(generatorId, outcome);
    }

    /** The create-job bodies, in order. */
    get requestBodies(): FiddleCreateJobBody[] {
        return this.jobs.map((job) => job.request);
    }

    /** The create-job body for the generator with this id. */
    jobFor(generatorId: string): FiddleJob {
        const job = this.jobs.find((candidate) => candidate.request.generators[0]?.id === generatorId);
        if (job == null) {
            throw new Error(
                `No Fiddle job for ${generatorId}; jobs: ${this.jobs.map((candidate) => candidate.request.generators[0]?.id).join(", ")}`
            );
        }
        return job;
    }

    recordStart(jobId: string, parts: MultipartPart[]): void {
        this.started.add(jobId);
        const ir = parts.find((part) => part.name === "ir");
        if (ir != null) {
            this.irs.set(jobId, ir.body);
        }
        if (parts.some((part) => part.name === "specs")) {
            this.specs.add(jobId);
        }
    }

    outcomeOf(jobId: string): FiddleOutcome {
        return this.jobOutcomes.get(jobId) ?? this.defaultOutcome;
    }

    artifact(key: string): Buffer | undefined {
        return this.artifacts.get(key);
    }

    snippets(key: string): string | undefined {
        return this.snippetTexts.get(key);
    }

    /** Answers a Fiddle request; `undefined` when the request is not Fiddle's. */
    handle(method: string, url: URL, body: unknown): Response | undefined {
        if (url.origin !== FIDDLE_ORIGIN) {
            return undefined;
        }
        this.requests.push(`${method} ${url.pathname}`);
        if (method === "POST" && url.pathname === "/api/remote-gen/create-job-v3") {
            return this.createJob(body as FiddleCreateJobBody);
        }
        const statusMatch = /^\/api\/remote-gen\/jobs\/([^/]+)\/status$/.exec(url.pathname);
        if (statusMatch?.[1] != null) {
            return this.status(statusMatch[1]);
        }
        return json({ error: `unexpected Fiddle request ${method} ${url.pathname}` }, 404);
    }

    private createJob(request: FiddleCreateJobBody): Response {
        const generatorId = request.generators[0]?.id ?? "";
        const outcome = this.outcomesByGenerator.get(generatorId) ?? this.defaultOutcome;
        const jobId = `job-${this.jobs.length + 1}`;
        if (outcome.createJobError != null) {
            // A rejected request is recorded, but no job exists for it.
            this.jobs.push(this.toJob(`rejected-${jobId}`, request));
            return json(outcome.createJobError.body, outcome.createJobError.status);
        }
        this.jobOutcomes.set(jobId, outcome);
        this.jobs.push(this.toJob(jobId, request));
        return json({ jobId, taskIds: [`task-${jobId}`] });
    }

    private toJob(jobId: string, request: FiddleCreateJobBody): FiddleJob {
        const simulator = this;
        return {
            jobId,
            request,
            get started() {
                return simulator.started.has(jobId);
            },
            get hasSpecs() {
                return simulator.specs.has(jobId);
            },
            ir: () => {
                const compressed = simulator.irs.get(jobId);
                if (compressed == null) {
                    throw new Error(`The command never started ${jobId}, so it uploaded no IR`);
                }
                return JSON.parse(gunzipSync(compressed).toString("utf8")) as FiddleIr;
            }
        };
    }

    private status(jobId: string): Response {
        const outcome = this.outcomeOf(jobId);
        const taskId = `task-${jobId}`;
        const artifactKey = `fiddle/${jobId}`;
        this.artifacts.set(artifactKey, createZip(outcome.files ?? { "README.md": "generated" }));
        if (outcome.snippets != null) {
            this.snippetTexts.set(artifactKey, outcome.snippets);
        }
        const packages = (outcome.packages ?? []).map((candidate) => ({
            coordinate: { _type: candidate.type, ...withoutType(candidate) },
            status: candidate.status ?? "PUBLISHED"
        }));
        const task = {
            id: taskId,
            packages,
            logs: outcome.logs ?? [],
            status:
                outcome.failure != null
                    ? { _type: "failed", message: outcome.failure }
                    : {
                          _type: "finished",
                          hasFilesToDownload: outcome.noArtifact !== true,
                          s3PreSignedReadUrl: `https://s3.test/artifact/${artifactKey}`,
                          ...(outcome.noArtifact === true
                              ? {}
                              : { s3PreSignedReadUrlV2: `https://s3.test/artifact/${artifactKey}` }),
                          createdSnippets: outcome.snippets != null,
                          snippetsS3PreSignedReadUrl:
                              outcome.snippets != null ? `https://s3.test/snippets/${artifactKey}` : undefined,
                          actualVersion: outcome.actualVersion,
                          pullRequestUrl: outcome.pullRequestUrl,
                          noChangesDetected: outcome.noChangesDetected
                      }
        };
        return json({ [taskId]: task });
    }
}

function withoutType(candidate: FiddlePackage): Record<string, string> {
    const { type: _type, status: _status, ...rest } = candidate;
    return Object.fromEntries(Object.entries(rest).filter(([, value]) => value != null)) as Record<string, string>;
}

// ---------------------------------------------------------------------------------------------------------------
// sdk-gen-api (SDK Config targets, and generators.yml generators routed to it)
// ---------------------------------------------------------------------------------------------------------------

export interface SdkGenApiTarget {
    targetId: string;
    apiInputId: string;
    language: string;
    sdk: { name: string; version: string; apiVersion?: string };
    fernGenerator: { id: string; version?: string };
    payloadKind: "sdk-config-v1" | "fern-runtime-bundle";
    package?: Record<string, string>;
    invocation: {
        customConfig: Record<string, unknown>;
        keywords: string[];
        smartCasing: boolean;
        disableExamples: boolean;
        audiences?: string[];
        [key: string]: unknown;
    };
    requestedOutput: {
        type: "download" | "github" | "publish";
        repository?: string;
        host?: string;
        branch?: string;
        mode?: string;
        reviewers?: unknown;
        publish?: Record<string, unknown>;
        workflows?: boolean;
        replay?: { enabled: boolean };
        verify?: boolean;
        skipIfNoDiff?: boolean;
    };
}

export interface SdkGenApiRequest {
    protocolVersion: number;
    apiName: string;
    cliVersion?: string;
    idempotencyKey: string;
    credentialSetId?: string;
    apiInputs: Array<{ id: string; specIndexes: "all" | number[] }>;
    targets: SdkGenApiTarget[];
}

export interface SdkGenApiBuild {
    buildId: string;
    request: SdkGenApiRequest;
    /** The publish credentials file, when a target publishes directly. */
    credentials?: { schemaVersion: string; credentialSetId: string; targets: Array<Record<string, unknown>> };
    /** The payload of each target by file name (`<targetId>.json`, or `.json.gz` for a runtime bundle). */
    payloads: Array<{ filename: string; body: Buffer }>;
    headers: Record<string, unknown>;
    hasSources: boolean;
    /** The raw multipart body, for checking that a secret never left the machine. */
    rawText: string;
}

export interface BuildOutcome {
    /** The version the build reports, as an AUTO build would; defaults to the version the CLI asked for. */
    actualVersion?: string;
    snippets?: string;
    /** Makes the build of this target fail with this message (or code and message). */
    failure?: string | { code: string; message: string };
    /** The files in the artifact; defaults to a README.md. */
    files?: Record<string, string>;
    /** Reports the target as succeeded without an artifact link. */
    noArtifact?: boolean;
    /** Makes the artifact download fail. */
    artifactDownloadFails?: boolean;
    /** What delivering to GitHub or a registry reported. */
    publication?:
        | {
              status: "success";
              publishTarget: {
                  type: "github" | "npm" | "maven" | "pypi" | "crates" | "unsupported";
                  identifier: string;
              };
              output: {
                  packageName?: string;
                  pullRequestUrl?: string;
                  branchUrl?: string;
                  noChangesDetected?: boolean;
              };
          }
        | {
              status: "failure";
              publishTarget: {
                  type: "github" | "npm" | "maven" | "pypi" | "crates" | "unsupported";
                  identifier: string;
              };
              error: { code: string; message: string; reason?: string; detail?: string };
          };
    logs?: Array<{ level: string; message: string }>;
}

class SdkGenApiSimulator {
    readonly builds: SdkGenApiBuild[] = [];
    private readonly outcomes = new Map<string, BuildOutcome>();
    private readonly targetsByBuild = new Map<string, SdkGenApiTarget[]>();
    private submissionFailure: { status: number; data: unknown } | undefined;
    private discovery: { compatibleVersion?: string; unavailable?: string } = { compatibleVersion: "9.9.9" };
    /** The version-discovery requests the command made, as the request bodies. */
    readonly discoveryRequests: unknown[] = [];
    private statusFailure = false;
    readonly artifacts = new Map<string, Buffer>();
    readonly snippetTexts = new Map<string, string>();

    /** Every target the command submitted, across builds. */
    get submitted(): SdkGenApiTarget[] {
        return this.builds.flatMap((build) => build.request.targets);
    }

    /** What building the target of this language gives. Targets with no outcome build with defaults. */
    willBuild(language: string, outcome: BuildOutcome): void {
        this.outcomes.set(language, outcome);
    }

    /** Makes submitting a build fail with this HTTP status and body. */
    failSubmission(status: number, data: unknown): void {
        this.submissionFailure = { status, data };
    }

    /** What version discovery (the newest version sdk-gen-api can run for a generator) answers. */
    willDiscover(answer: { compatibleVersion?: string; unavailable?: string }): void {
        this.discovery = answer;
    }

    /** Answers a version discovery request. */
    discover(body: unknown): Response {
        this.discoveryRequests.push(body);
        if (this.discovery.unavailable != null) {
            return json({
                targets: [{ targetId: "generator", state: "UNAVAILABLE", reason: this.discovery.unavailable }]
            });
        }
        return json({
            targets: [{ targetId: "generator", state: "RESOLVED", compatibleVersion: this.discovery.compatibleVersion }]
        });
    }

    /** Makes polling a build fail. */
    failPolling(): void {
        this.statusFailure = true;
    }

    submit(
        url: string,
        form: { getBuffer(): Buffer; getBoundary(): string },
        headers: Record<string, unknown>
    ): unknown {
        if (this.submissionFailure != null) {
            throw axiosError(this.submissionFailure.status, this.submissionFailure.data);
        }
        const parts = parseMultipart(form);
        const requestPart = parts.find((part) => part.name === "request");
        const request = JSON.parse(requestPart?.body.toString("utf8") ?? "{}") as SdkGenApiRequest;
        const credentialsPart = parts.find((part) => part.name === "credentials");
        const buildId = `build-${this.builds.length + 1}`;
        this.builds.push({
            buildId,
            request,
            ...(credentialsPart == null
                ? {}
                : { credentials: JSON.parse(credentialsPart.body.toString("utf8")) as SdkGenApiBuild["credentials"] }),
            payloads: parts
                .filter((part) => part.name === "payloads")
                .map((part) => ({ filename: part.filename ?? "", body: part.body })),
            headers,
            hasSources: parts.some((part) => part.name === "sources"),
            rawText: form.getBuffer().toString("latin1")
        });
        this.targetsByBuild.set(buildId, request.targets);
        assertUrl(url, `${SDK_GEN_API_ORIGIN}/v1/fern/build`);
        return { data: { buildId } };
    }

    status(buildId: string): unknown {
        if (this.statusFailure) {
            throw axiosError(503, { message: "unavailable" });
        }
        const targets = this.targetsByBuild.get(buildId) ?? [];
        const statuses = targets.map((target) => this.targetStatus(target));
        const failed = statuses.filter((status) => status.status === "failed").length;
        return {
            buildId,
            status: failed === 0 ? "succeeded" : failed === statuses.length ? "failed" : "partial_failure",
            targets: statuses
        };
    }

    private targetStatus(target: SdkGenApiTarget): Record<string, unknown> & { status: string } {
        const outcome = this.outcomes.get(target.language) ?? {};
        const logs = outcome.logs ?? [];
        if (outcome.failure != null || outcome.publication?.status === "failure") {
            return {
                targetId: target.targetId,
                status: "failed",
                logs,
                ...(outcome.failure == null
                    ? {}
                    : {
                          error: typeof outcome.failure === "string" ? { message: outcome.failure } : outcome.failure
                      }),
                ...(outcome.publication == null ? {} : { publication: outcome.publication })
            };
        }
        const artifactKey = `sdk/${target.language}/${target.targetId}`;
        this.artifacts.set(artifactKey, createZip(outcome.files ?? { "README.md": "generated" }));
        if (outcome.snippets != null) {
            this.snippetTexts.set(artifactKey, outcome.snippets);
        }
        return {
            targetId: target.targetId,
            status: "succeeded",
            logs,
            result: {
                ...(outcome.noArtifact === true ? {} : { artifactUrl: `https://s3.test/artifact/${artifactKey}` }),
                actualVersion: outcome.actualVersion ?? (isAuto(target.sdk.version) ? undefined : target.sdk.version),
                ...(outcome.snippets != null ? { snippetsUrl: `https://s3.test/snippets/${artifactKey}` } : {})
            },
            ...(outcome.publication == null ? {} : { publication: outcome.publication })
        };
    }

    downloadFails(url: string): boolean {
        const key = url.slice("https://s3.test/artifact/".length);
        const language = key.split("/")[1] ?? "";
        return this.outcomes.get(language)?.artifactDownloadFails === true;
    }
}

const isAuto = (version: string): boolean => version.toUpperCase() === "AUTO";

function assertUrl(actual: string, expected: string): void {
    if (actual !== expected) {
        throw new Error(`Unexpected sdk-gen-api URL ${actual}`);
    }
}

function axiosError(status: number, data: unknown): AxiosError {
    const config = { headers: {} } as InternalAxiosRequestConfig;
    const response = { status, statusText: String(status), data, headers: {}, config } as AxiosResponse;
    return new AxiosError(`Request failed with status code ${status}`, "ERR_BAD_RESPONSE", config, undefined, response);
}

function json(body: unknown, status = 200): Response {
    return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

// ---------------------------------------------------------------------------------------------------------------
// Package registries and GitHub (where the CLI looks up the version to publish next, and whether one exists)
// ---------------------------------------------------------------------------------------------------------------

export type RegistryLanguage = "typescript" | "python" | "java" | "csharp" | "ruby" | "go" | "rust";

/**
 * Stands in for the public registries and the GitHub API behind `fetch`. Nothing is published by default, so a
 * lookup answers 404, like a new package; `publish` and `github` put versions there.
 */
class RegistrySimulator {
    /** Every lookup, as `METHOD url`. */
    readonly requests: string[] = [];
    private readonly packages = new Map<string, string[]>();
    private readonly repositories = new Map<string, { latestRelease?: string; metadataVersion?: string }>();

    /** Makes these versions exist, oldest first, for the package (a Maven coordinate is `group:artifact`). */
    publish(language: RegistryLanguage, packageName: string, versions: string[]): void {
        this.packages.set(`${language}:${packageName}`, versions);
    }

    /** Gives the GitHub repository (`owner/repo`) a latest release and/or the sdkVersion in `.fern/metadata.json`. */
    github(repository: string, state: { latestRelease?: string; metadataVersion?: string }): void {
        this.repositories.set(repository, state);
    }

    handle(method: string, url: URL): Response | undefined {
        const known = [
            "registry.npmjs.org",
            "pypi.org",
            "search.maven.org",
            "api.nuget.org",
            "rubygems.org",
            "proxy.golang.org",
            "crates.io",
            "api.github.com"
        ];
        if (!known.includes(url.hostname)) {
            return undefined;
        }
        this.requests.push(`${method} ${url.origin}${url.pathname}${url.search}`);
        const path = decodeURIComponent(url.pathname);
        switch (url.hostname) {
            case "registry.npmjs.org": {
                const [name, version] = splitNpm(path.slice(1));
                const versions = this.packages.get(`typescript:${name}`);
                if (versions == null) {
                    return notFound();
                }
                if (version != null) {
                    return versions.includes(version) ? json({ name, version }) : notFound();
                }
                return json({
                    name,
                    "dist-tags": { latest: versions[versions.length - 1] },
                    versions: Object.fromEntries(versions.map((candidate) => [candidate, { name, version: candidate }]))
                });
            }
            case "pypi.org": {
                const match = /^\/pypi\/([^/]+)(?:\/([^/]+))?\/json$/.exec(path);
                const versions = match?.[1] == null ? undefined : this.packages.get(`python:${match[1]}`);
                if (versions == null) {
                    return notFound();
                }
                if (match?.[2] != null) {
                    return versions.includes(match[2]) ? json({ info: { version: match[2] } }) : notFound();
                }
                return json({ info: { version: versions[versions.length - 1] } });
            }
            case "search.maven.org": {
                const query = url.searchParams.get("q") ?? "";
                const match = /g:([^ ]+) AND a:([^ ]+)(?: AND v:([^ ]+))?/.exec(query);
                const versions = match == null ? undefined : this.packages.get(`java:${match[1]}:${match[2]}`);
                if (versions == null) {
                    return json({ response: { numFound: 0, docs: [] } });
                }
                if (match?.[3] != null) {
                    return json({ response: { numFound: versions.includes(match[3]) ? 1 : 0, docs: [] } });
                }
                return json({ response: { numFound: 1, docs: [{ latestVersion: versions[versions.length - 1] }] } });
            }
            case "api.nuget.org": {
                const match = /^\/v3-flatcontainer\/([^/]+)\/index\.json$/.exec(path);
                const versions = this.findIgnoringCase("csharp", match?.[1]);
                return versions == null ? notFound() : json({ versions });
            }
            case "rubygems.org": {
                const latest = /^\/api\/v1\/gems\/([^/]+)\.json$/.exec(path);
                if (latest?.[1] != null) {
                    const versions = this.packages.get(`ruby:${latest[1]}`);
                    return versions == null ? notFound() : json({ version: versions[versions.length - 1] });
                }
                const exact = /^\/api\/v2\/rubygems\/([^/]+)\/versions\/(.+)\.json$/.exec(path);
                const versions = exact?.[1] == null ? undefined : this.packages.get(`ruby:${exact[1]}`);
                return versions != null && exact?.[2] != null && versions.includes(exact[2]) ? json({}) : notFound();
            }
            case "proxy.golang.org": {
                const latest = /^\/(.+)\/@latest$/.exec(path);
                if (latest?.[1] != null) {
                    const versions = this.packages.get(`go:${latest[1]}`);
                    return versions == null ? notFound() : json({ Version: `v${versions[versions.length - 1]}` });
                }
                const exact = /^\/(.+)\/@v\/v(.+)\.info$/.exec(path);
                const versions = exact?.[1] == null ? undefined : this.packages.get(`go:${exact[1]}`);
                return versions != null && exact?.[2] != null && versions.includes(exact[2])
                    ? json({ Version: `v${exact[2]}` })
                    : notFound();
            }
            case "crates.io": {
                const match = /^\/api\/v1\/crates\/([^/]+)(?:\/([^/]+))?$/.exec(path);
                const versions = match?.[1] == null ? undefined : this.packages.get(`rust:${match[1]}`);
                if (versions == null) {
                    return notFound();
                }
                if (match?.[2] != null) {
                    return versions.includes(match[2]) ? json({ version: { num: match[2] } }) : notFound();
                }
                return json({ crate: { max_stable_version: versions[versions.length - 1] } });
            }
            default: {
                const release = /^\/repos\/([^/]+\/[^/]+)\/releases\/latest$/.exec(path);
                if (release?.[1] != null) {
                    const tag = this.repositories.get(release[1])?.latestRelease;
                    return tag == null ? notFound() : json({ tag_name: tag });
                }
                const metadata = /^\/repos\/([^/]+\/[^/]+)\/contents\/\.fern\/metadata\.json$/.exec(path);
                const sdkVersion =
                    metadata?.[1] == null ? undefined : this.repositories.get(metadata[1])?.metadataVersion;
                if (sdkVersion == null) {
                    return notFound();
                }
                return json({
                    type: "file",
                    encoding: "base64",
                    content: Buffer.from(JSON.stringify({ sdkVersion })).toString("base64")
                });
            }
        }
    }

    private findIgnoringCase(language: RegistryLanguage, name: string | undefined): string[] | undefined {
        for (const [key, versions] of this.packages) {
            if (key.toLowerCase() === `${language}:${name ?? ""}`.toLowerCase()) {
                return versions;
            }
        }
        return undefined;
    }
}

function splitNpm(rest: string): [string, string | undefined] {
    const parts = rest.split("/");
    if (rest.startsWith("@")) {
        return [`${parts[0]}/${parts[1]}`, parts[2]];
    }
    return [parts[0] ?? "", parts[1]];
}

function notFound(): Response {
    return json({ message: "Not Found" }, 404);
}

// ---------------------------------------------------------------------------------------------------------------
// The world: environment, fakes and a real project
// ---------------------------------------------------------------------------------------------------------------

export class GenerateWorld {
    readonly fdr = new FakeFdr();
    readonly fiddle = new FiddleSimulator();
    readonly sdkGenApi = new SdkGenApiSimulator();
    readonly registry = new RegistrySimulator();
    /** Every axios request, as `METHOD url`, for checking that nothing unexpected was called. */
    readonly axiosRequests: string[] = [];
    /** Fiddle-job starts the command made, by URL. */
    home = "";
    private readonly temporaryDirectories: string[] = [];

    async setup(): Promise<void> {
        resetMocks();
        this.home = await this.makeTemporaryDirectory("fern-generate-home-");
        vi.stubEnv("HOME", this.home);
        vi.stubEnv("USERPROFILE", this.home);
        for (const name of CI_ENVIRONMENT_VARIABLES) {
            vi.stubEnv(name, "");
        }
        vi.stubEnv("FERN_FDR_ORIGIN", FAKE_FDR_ORIGIN);
        vi.stubEnv("FERN_TOKEN", TEST_TOKEN);
        vi.stubEnv("FERN_SDK_GEN_API_ORIGIN", SDK_GEN_API_ORIGIN);
        vi.stubEnv("FERN_USE_SDK_GEN_API", "");
        vi.stubEnv("FERN_UPLOAD_SDK_GEN_SNIPPETS", "");
        this.fdr.install();
        const fdrFetch = globalThis.fetch;
        vi.stubGlobal(
            "fetch",
            vi.fn(async (input: unknown, init?: { method?: string; body?: unknown }) => {
                const isRequest = typeof input === "object" && input != null && "url" in input;
                const url = new URL(isRequest ? (input as Request).url : String(input));
                const method = isRequest ? (input as Request).method : (init?.method ?? "GET");
                if (url.origin === FIDDLE_ORIGIN) {
                    const text = isRequest ? await (input as Request).clone().text() : bodyToText(init?.body);
                    const response = this.fiddle.handle(method, url, text === "" ? undefined : JSON.parse(text));
                    if (response != null) {
                        // Fiddle requests are also recorded by the fake FDR, so tests can read them in one place.
                        this.fdr.requests.push({
                            method,
                            url: `${url.origin}${url.pathname}`,
                            path: url.pathname,
                            body: text === "" ? undefined : JSON.parse(text)
                        });
                        return response;
                    }
                }
                if (url.origin === SDK_GEN_API_ORIGIN && url.pathname === "/v1/fern/generator-versions/discover") {
                    const text = isRequest ? await (input as Request).clone().text() : bodyToText(init?.body);
                    return this.sdkGenApi.discover(text === "" ? undefined : JSON.parse(text));
                }
                const registryResponse = this.registry.handle(method, url);
                if (registryResponse != null) {
                    return registryResponse;
                }
                return fdrFetch(input as never, init as never);
            })
        );
        vi.spyOn(axios, "post").mockImplementation(((
            url: string,
            data: unknown,
            config?: { headers?: Record<string, unknown> }
        ) => {
            this.axiosRequests.push(`POST ${url}`);
            return this.axiosPost(url, data as { getBuffer(): Buffer; getBoundary(): string }, config?.headers ?? {});
        }) as never);
        vi.spyOn(axios, "get").mockImplementation(((url: string) => {
            this.axiosRequests.push(`GET ${url}`);
            return this.axiosGet(url);
        }) as never);
    }

    async teardown(): Promise<void> {
        vi.unstubAllEnvs();
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
        await Promise.all(
            this.temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true }))
        );
    }

    /**
     * Runs the command as a GitHub Actions step: the annotations it prints (`::notice ...`) are collected, and the
     * step summary file is a temporary file the test can read.
     */
    async captureGithubActions(): Promise<{ annotations: () => string[]; summary: () => Promise<string> }> {
        const directory = await this.makeTemporaryDirectory("fern-step-summary-");
        const summaryPath = path.join(directory, "summary.md");
        vi.stubEnv("GITHUB_ACTIONS", "true");
        vi.stubEnv("GITHUB_STEP_SUMMARY", summaryPath);
        const annotations: string[] = [];
        const write = process.stdout.write.bind(process.stdout);
        vi.spyOn(process.stdout, "write").mockImplementation(((chunk: unknown, ...rest: unknown[]) => {
            if (typeof chunk === "string" && chunk.startsWith("::")) {
                annotations.push(chunk.trimEnd());
                return true;
            }
            return (write as (...args: unknown[]) => boolean)(chunk, ...rest);
        }) as never);
        return {
            annotations: () => annotations,
            summary: async () => {
                try {
                    return await readFile(summaryPath, "utf-8");
                } catch {
                    return "";
                }
            }
        };
    }

    async makeTemporaryDirectory(prefix: string): Promise<string> {
        const directory = await mkdtemp(path.join(tmpdir(), prefix));
        this.temporaryDirectories.push(directory);
        return directory;
    }

    private async axiosPost(
        url: string,
        form: { getBuffer(): Buffer; getBoundary(): string },
        headers: Record<string, unknown>
    ): Promise<unknown> {
        if (url === `${SDK_GEN_API_ORIGIN}/v1/fern/build`) {
            return this.sdkGenApi.submit(url, form, headers);
        }
        const start = /^https:\/\/fiddle-coordinator\.buildwithfern\.com\/api\/remote-gen\/jobs\/([^/]+)\/start$/.exec(
            url
        );
        if (start?.[1] != null) {
            const jobId = start[1];
            this.fiddle.recordStart(jobId, parseMultipart(form));
            if (this.fiddle.outcomeOf(jobId).startFails === true) {
                throw axiosError(500, { message: "could not start" });
            }
            return { data: {} };
        }
        throw new Error(`Unexpected axios POST ${url}`);
    }

    private async axiosGet(url: string): Promise<unknown> {
        const build = /^https:\/\/sdk-gen-api\.test\/v1\/fern\/build\/([^/]+)$/.exec(url);
        if (build?.[1] != null) {
            return { data: this.sdkGenApi.status(build[1]) };
        }
        if (url.startsWith("https://s3.test/artifact/")) {
            const key = url.slice("https://s3.test/artifact/".length);
            if (key.startsWith("fiddle/")) {
                const jobId = key.slice("fiddle/".length);
                if (this.fiddle.outcomeOf(jobId).artifactDownloadFails === true) {
                    throw axiosError(403, "expired");
                }
                return { data: Readable.from([this.fiddle.artifact(key) ?? Buffer.alloc(0)]) };
            }
            if (this.sdkGenApi.downloadFails(url)) {
                throw axiosError(403, "expired");
            }
            return { data: Readable.from([this.sdkGenApi.artifacts.get(key) ?? Buffer.alloc(0)]) };
        }
        if (url.startsWith("https://s3.test/snippets/")) {
            const key = url.slice("https://s3.test/snippets/".length);
            return { data: Readable.from([this.fiddle.snippets(key) ?? this.sdkGenApi.snippetTexts.get(key) ?? ""]) };
        }
        throw new Error(`Unexpected axios GET ${url}`);
    }

    /** The requests to FDR, Venus and Fiddle (everything sent over `fetch`) as `METHOD path`. */
    fetchRequests(): string[] {
        return this.fdr.requests.map((request) => `${request.method} ${request.path}`);
    }
}

const CI_ENVIRONMENT_VARIABLES = [
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
    "GITHUB_STEP_SUMMARY"
];

function bodyToText(body: unknown): string {
    if (typeof body === "string") {
        return body;
    }
    if (body instanceof ArrayBuffer) {
        return Buffer.from(body).toString("utf-8");
    }
    return body instanceof Uint8Array ? Buffer.from(body).toString("utf-8") : "";
}

// ---------------------------------------------------------------------------------------------------------------
// A CLI context built on the real task contexts, so failures behave as they do in the CLI: a failed generator is
// swallowed by its task and reported when every sibling has finished.
// ---------------------------------------------------------------------------------------------------------------

export interface PostHogEvent {
    orgId?: string;
    command?: string;
    properties?: Record<string, unknown>;
}

export interface TestCli {
    cliContext: CliContext;
    /** Everything the command logged, as `level: <task prefix>message`. */
    logs: string[];
    logged: (text: string) => boolean;
    /** The messages of one level. */
    logsAt: (level: LogLevel) => string[];
    prompts: Array<{ message: string; defaultValue: boolean | undefined }>;
    postHogEvents: PostHogEvent[];
    /** Whether any task failed, like the CLI's exit code. */
    didSucceed: () => boolean;
}

export function createTestCli({ confirmAnswer = true }: { confirmAnswer?: boolean } = {}): TestCli {
    const entries: Array<{ level: LogLevel; text: string }> = [];
    const prompts: TestCli["prompts"] = [];
    const postHogEvents: PostHogEvent[] = [];
    let didSucceed = true;
    // biome-ignore lint/suspicious/noControlCharactersInRegex: strips ANSI colors from task prefixes
    const stripColors = (text: string): string => text.replace(/\u001B\[[0-9;]*m/g, "");
    const init = (): TaskContextImpl.Init => ({
        logImmediately: (logs) => {
            for (const log of logs) {
                entries.push({ level: log.level, text: stripColors(`${log.prefix ?? ""}${log.parts.join(" ")}`) });
            }
        },
        takeOverTerminal: async (run) => {
            await run();
        },
        shouldBufferLogs: false,
        onResult: (result) => {
            if (result === TaskResult.Failure) {
                didSucceed = false;
            }
        },
        instrumentPostHogEvent: (event) => {
            postHogEvents.push(event as PostHogEvent);
        },
        captureException: () => undefined,
        emitAutomationTelemetryEvent: () => undefined
    });
    const runTask = async <T>(
        taskInit: TaskContextImpl.Init,
        run: (context: TaskContext) => T | Promise<T>
    ): Promise<T> => {
        const context = new TaskContextImpl(taskInit).start();
        try {
            return await run(context);
        } catch (error) {
            const failureMessage =
                error instanceof TaskAbortSignal
                    ? (error.failureMessage ?? context.getLastFailureMessage())
                    : error instanceof Error
                      ? error.message
                      : String(error);
            context.failWithoutThrowing(undefined, error);
            throw new TaskAbortSignal(failureMessage);
        } finally {
            context.finish();
        }
    };
    const logger = createLogger((level, ...parts) => {
        entries.push({ level, text: parts.join(" ") });
    });
    const cliContext = {
        environment: { packageVersion: "0.0.0" },
        logger,
        failAndThrow: (message?: string, error?: unknown) => {
            didSucceed = false;
            if (!(error instanceof TaskAbortSignal)) {
                logErrorMessage({ message, error, logger });
            }
            throw new TaskAbortSignal(
                message ??
                    (error instanceof TaskAbortSignal
                        ? error.failureMessage
                        : error != null
                          ? extractErrorMessage(error)
                          : undefined)
            );
        },
        instrumentPostHogEvent: (event: PostHogEvent) => {
            postHogEvents.push(event);
        },
        confirmPrompt: async (message: string, defaultValue?: boolean) => {
            prompts.push({ message, defaultValue });
            return confirmAnswer;
        },
        runTask: (run: (context: TaskContext) => unknown) => runTask(init(), run),
        runTaskForWorkspace: (_workspace: unknown, run: (context: TaskContext) => unknown) => runTask(init(), run)
    } as unknown as CliContext;
    return {
        cliContext,
        get logs() {
            return entries.map((entry) => `${entry.level}: ${entry.text}`);
        },
        logged: (text) => entries.some((entry) => entry.text.includes(text)),
        logsAt: (level) => entries.filter((entry) => entry.level === level).map((entry) => entry.text),
        prompts,
        postHogEvents,
        didSucceed: () => didSucceed
    };
}

// ---------------------------------------------------------------------------------------------------------------
// Running the command
// ---------------------------------------------------------------------------------------------------------------

type GenerateAPIWorkspacesArgs = Parameters<typeof import("../generateAPIWorkspaces.js").generateAPIWorkspaces>[0];
export type GenerateArgs = Omit<GenerateAPIWorkspacesArgs, "project" | "cliContext">;

export const DEFAULT_ARGS: GenerateArgs = {
    version: undefined,
    groupNames: undefined,
    targetNames: undefined,
    generatorName: undefined,
    generatorIndex: undefined,
    shouldLogS3Url: false,
    keepDocker: false,
    useLocalDocker: false,
    preview: false,
    mode: undefined,
    force: true,
    runner: undefined,
    inspect: false,
    lfsOverride: undefined,
    sdkConfigPath: undefined,
    fernignorePath: undefined,
    skipFernignore: false,
    dynamicIrOnly: false,
    outputDir: undefined,
    noReplay: false,
    verify: false,
    retryRateLimited: false,
    requireEnvVars: true
};

export interface GenerateOptions {
    /** Files of the `fern/` folder; `fern.config.json` is added when missing. */
    files: Record<string, string>;
    /** Files outside `fern/`, relative to the project directory. */
    outsideFiles?: Record<string, string>;
    /** The `--api` selection the project is loaded with. */
    api?: string | string[];
    /** The arguments of `generateAPIWorkspaces`; a function gets the project directory (for absolute paths). */
    args?: Partial<GenerateArgs> | ((directory: string) => Partial<GenerateArgs>);
    /** Runs after the project is written and before the command runs (to put files in an output directory). */
    before?: (directory: string) => Promise<void>;
    /** Whether the confirmation prompt answers yes. */
    confirmAnswer?: boolean;
    /** Runs the command with this directory (relative to the project directory) as the working directory. */
    cwd?: string;
}

export interface GenerateResult {
    directory: string;
    fernDirectory: string;
    cli: TestCli;
    logs: string[];
    logged: (text: string) => boolean;
    /**
     * Whether the command failed, as the CLI's exit code would say: it threw, or a task it ran failed. A failed
     * generator does not make `generateAPIWorkspaces` throw (its task swallows the failure), but it does fail the run.
     */
    failed: boolean;
    /** Whether `generateAPIWorkspaces` itself threw (configuration errors do; a failed generator does not). */
    threw: boolean;
    /** What the failure said: the thrown message, or else the last error the command logged. */
    failureMessage: string | undefined;
    /** Every message the command logged at error level. */
    errors: string[];
    /** Every message the command logged at warn level. */
    warnings: string[];
    error: unknown;
    /** Reads a file below the project directory. */
    read: (relativePath: string) => Promise<string>;
    /** The files below a directory of the project (relative paths, sorted); empty when it does not exist. */
    list: (relativePath: string) => Promise<string[]>;
    /** Like `list`, but only the files below a `generated/` folder: what generation wrote, not what the project had. */
    generated: (relativePath: string) => Promise<string[]>;
}

export async function generate(world: GenerateWorld, options: GenerateOptions): Promise<GenerateResult> {
    const directory = await world.makeTemporaryDirectory("fern-generate-");
    const fernDirectory = path.join(directory, "fern");
    const files = { "fern.config.json": FERN_CONFIG, ...options.files };
    for (const [relativePath, content] of Object.entries(files)) {
        await writeInto(path.join(fernDirectory, relativePath), content);
    }
    for (const [relativePath, content] of Object.entries(options.outsideFiles ?? {})) {
        await writeInto(path.join(directory, relativePath), content);
    }
    await options.before?.(directory);
    const project: Project = await loadProjectFromDirectory({
        absolutePathToFernDirectory: AbsoluteFilePath.of(fernDirectory),
        cliName: "fern",
        cliVersion: "0.0.0",
        commandLineApiWorkspace: options.api,
        defaultToAllApiWorkspaces: true,
        context: createMockTaskContext()
    });
    const cli = createTestCli({ confirmAnswer: options.confirmAnswer });
    const extra = typeof options.args === "function" ? options.args(directory) : options.args;
    if (options.cwd != null) {
        vi.spyOn(process, "cwd").mockReturnValue(path.join(directory, options.cwd));
    }
    const { generateAPIWorkspaces } = await import("../generateAPIWorkspaces.js");
    let error: unknown;
    let threw = false;
    try {
        await generateAPIWorkspaces({ project, cliContext: cli.cliContext, ...DEFAULT_ARGS, ...extra });
    } catch (caught) {
        threw = true;
        error = caught;
    }
    // A failed task also logs a bare "Failed." when it finishes; that line carries no information.
    const errors = cli.logsAt(LogLevel.Error).filter((text) => !/(^|\s)Failed\.$/.test(text));
    return {
        directory,
        fernDirectory,
        cli,
        logs: cli.logs,
        logged: cli.logged,
        failed: threw || !cli.didSucceed(),
        threw,
        failureMessage:
            (error instanceof TaskAbortSignal
                ? error.failureMessage
                : error instanceof Error
                  ? error.message
                  : error == null
                    ? undefined
                    : String(error)) ?? errors[errors.length - 1],
        errors,
        warnings: cli.logsAt(LogLevel.Warn),
        error,
        read: (relativePath) => readFile(path.join(directory, relativePath), "utf-8"),
        list: (relativePath) => listFiles(path.join(directory, relativePath)),
        generated: async (relativePath) =>
            (await listFiles(path.join(directory, relativePath))).filter((file) =>
                file.split(path.sep).includes("generated")
            )
    };
}

async function writeInto(absolutePath: string, content: string): Promise<void> {
    await mkdir(path.dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, content);
}

async function listFiles(directory: string): Promise<string[]> {
    let entries: Dirent[];
    try {
        entries = await readdir(directory, { withFileTypes: true, recursive: true, encoding: "utf8" });
    } catch {
        return [];
    }
    return entries
        .filter((entry) => entry.isFile())
        .map((entry) => path.relative(directory, path.join(entry.parentPath, entry.name)))
        .sort();
}

// ---------------------------------------------------------------------------------------------------------------
// Configuration builders
// ---------------------------------------------------------------------------------------------------------------

/** An sdk-config.yml with one OpenAPI source; `targets` is the YAML of the `targets:` list items. */
export function sdkConfigYml(targets: string, header = ""): string {
    return `schemaVersion: sdk-config/v1
sdkName: acme
sdkVersion: 1.0.0
source:
  specs:
    - id: pets
      type: openapi
      path: ./openapi/openapi.yml
${header}targets:
${targets}`;
}

/** An SDK Config target with files delivery into ./generated/<language>. */
export function filesTarget(language: string, extra = ""): string {
    return `  - language: ${language}
${extra}    output:
      delivery: files
      path: ./generated/${language}
`;
}

/** The generators.yml of one group of generators; `generators` is the YAML of the list items (indented 6). */
export function generatorsYml({
    groups,
    defaultGroup,
    extra = ""
}: {
    groups: Record<string, string[]>;
    defaultGroup?: string;
    extra?: string;
}): string {
    const groupYaml = Object.entries(groups)
        .map(([name, generators]) => `  ${name}:\n    generators:\n${generators.join("")}`)
        .join("");
    return `${defaultGroup == null ? "" : `default-group: ${defaultGroup}\n`}api:
  specs:
    - openapi: openapi/openapi.yml
${extra}groups:
${groupYaml}`;
}

/**
 * One generators.yml generator with local-file-system output, indented to sit in a group's `generators:` list.
 * `body` is extra YAML lines for the generator, already indented by 8 spaces.
 */
export function localGenerator(name: string, version: string, outputPath: string, body = ""): string {
    return `      - name: ${name}
        version: ${version}
${body}        output:
          location: local-file-system
          path: ${outputPath}
`;
}

/** One generators.yml generator with an arbitrary `output:` / `github:` section (indented by 8 spaces). */
export function generator(name: string, version: string, body: string): string {
    return `      - name: ${name}
        version: ${version}
${body}`;
}
