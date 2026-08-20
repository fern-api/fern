import { stripCliConfigKeys } from "@fern-api/api-workspace-commons";
import { FernToken } from "@fern-api/auth";
import { generatorsYml } from "@fern-api/configuration";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { isAutoVersion } from "@fern-api/generator-cli/autoversion";
import { CliError, InteractiveTaskContext } from "@fern-api/task-context";
import { FernFiddle } from "@fern-fern/fiddle-sdk";
import axios, { AxiosError } from "axios";
import { createHash } from "crypto";
import FormData from "form-data";
import path from "path";
import { downloadFilesForTask } from "./RemoteTaskHandler.js";

const POLL_INTERVAL_MS = 2_000;
const POLL_TIMEOUT_MS = 15 * 60 * 1_000;
const REQUEST_TIMEOUT_MS = 60_000;
const LOOPBACK_HOSTNAMES = new Set(["localhost", "127.0.0.1", "[::1]", "::1"]);

export type FernSdkGenApiLanguage =
    | "typescript"
    | "python"
    | "java"
    | "kotlin"
    | "go"
    | "csharp"
    | "php"
    | "ruby"
    | "rust"
    | "swift"
    | "cli";

export type FernSdkGenApiPublishRegistry =
    | "npm"
    | "pypi"
    | "maven"
    | "nuget"
    | "rubygems"
    | "crates"
    | "go"
    | "composer";

export interface FernSdkGenApiPublishConfig {
    registry: FernSdkGenApiPublishRegistry;
    url?: string;
}

export interface FernSdkGenApiPackageConfig {
    packageName?: string;
    moduleName?: string;
    modulePath?: string;
    namespace?: string;
    groupId?: string;
    artifactId?: string;
}

export type FernSdkGenApiRequestedOutput =
    | { type: "download" }
    | {
          type: "github";
          repository: string;
          host?: string;
          branch?: string;
          mode?: "release" | "pull-request" | "push";
          reviewers?: { teams?: string[]; users?: string[] };
          publish?: FernSdkGenApiPublishConfig;
      }
    | { type: "publish"; publish: FernSdkGenApiPublishConfig };

/**
 * First-party Fern SDK generators that can be represented by the shared SDK Config IR target
 * languages. Keep aliases here because existing generators.yml files remain valid during the
 * backend migration.
 */
const FERN_SDK_GENERATOR_LANGUAGES: Readonly<Record<string, FernSdkGenApiLanguage>> = {
    "fernapi/fern-typescript": "typescript",
    "fernapi/fern-typescript-sdk": "typescript",
    "fernapi/fern-typescript-node-sdk": "typescript",
    "fernapi/fern-typescript-browser-sdk": "typescript",
    "fernapi/fern-python-sdk": "python",
    "fernapi/fern-java-sdk": "java",
    "fernapi/fern-kotlin-sdk": "kotlin",
    "fernapi/fern-go-sdk": "go",
    "fernapi/fern-csharp-sdk": "csharp",
    "fernapi/fern-php-sdk": "php",
    "fernapi/fern-ruby-sdk": "ruby",
    "fernapi/fern-ruby-sdk-v2": "ruby",
    "fernapi/fern-rust-sdk": "rust",
    "fernapi/fern-swift-sdk": "swift",
    "fernapi/fern-cli": "cli",
    "fernapi/fern-cli-generator": "cli"
};

interface FernBuildStatus {
    buildId: string;
    status: "queued" | "running" | "succeeded" | "failed" | "partial_failure";
    targets: Array<{
        targetId: string;
        status: "queued" | "running" | "succeeded" | "failed";
        logs: Array<{ level: string; message: string }>;
        result?: { artifactUrl: string; actualVersion?: string };
        error?: { message: string };
    }>;
}

export interface FernSdkGenApiRequest {
    protocolVersion: 1;
    apiName: string;
    cliVersion?: string;
    idempotencyKey: string;
    apiInputs: Array<{ id: string; specIndexes: "all" }>;
    targets: Array<{
        targetId: string;
        apiInputId: string;
        language: FernSdkGenApiLanguage;
        sdk: { name: string; version: string };
        fernGenerator: { id: string; version: string };
        package?: FernSdkGenApiPackageConfig;
        invocation: {
            customConfig: Record<string, unknown>;
            keywords: string[];
            smartCasing: boolean;
            smartCasingDigitWordBoundary: boolean;
            disableExamples: boolean;
            audiences?: string[];
            readme?: Record<string, unknown>;
            settings?: Record<string, unknown>;
            apiOverride?: Record<string, unknown>;
        };
        requestedOutput: FernSdkGenApiRequestedOutput;
    }>;
}

export function isFernSdkGenApiEnabled(): boolean {
    const configured = process.env.FERN_USE_SDK_GEN_API ?? process.env.DEFAULT_USE_SDK_GEN_API ?? "false";
    return configured.trim().toLowerCase() === "true";
}

export function getFernSdkGenApiOrigin(): string | undefined {
    const configured = process.env.FERN_SDK_GEN_API_ORIGIN ?? process.env.DEFAULT_SDK_GEN_API_ORIGIN;
    if (configured == null) {
        return undefined;
    }

    let origin: URL;
    try {
        origin = new URL(configured);
    } catch {
        throw new Error("FERN_SDK_GEN_API_ORIGIN must be a valid URL");
    }
    if (origin.username.length > 0 || origin.password.length > 0) {
        throw new Error("FERN_SDK_GEN_API_ORIGIN must not contain credentials");
    }
    const isLoopbackHttp = origin.protocol === "http:" && LOOPBACK_HOSTNAMES.has(origin.hostname);
    if (origin.protocol !== "https:" && !isLoopbackHttp) {
        throw new Error("FERN_SDK_GEN_API_ORIGIN must use HTTPS unless it targets localhost");
    }
    return origin.toString().replace(/\/$/, "");
}

export function getFernSdkGenApiLanguage(generatorName: string): FernSdkGenApiLanguage | undefined {
    return FERN_SDK_GENERATOR_LANGUAGES[generatorName];
}

interface FernSdkGenApiOutputMapping {
    package?: FernSdkGenApiPackageConfig;
    requestedOutput: FernSdkGenApiRequestedOutput;
}

/**
 * Preserves Fern's delivery and publication intent without forwarding credentials. The shared
 * config contract carries externally managed credential references; resolving Fern secrets into
 * those references belongs to the downstream distribution workstream.
 */
export function mapFernSdkGenApiOutput(
    generatorInvocation: generatorsYml.GeneratorInvocation
): FernSdkGenApiOutputMapping {
    const outputMode = generatorInvocation.outputMode;
    switch (outputMode.type) {
        case "downloadFiles":
            return { requestedOutput: { type: "download" } };
        case "github":
            return mapGithubOutput({
                owner: outputMode.owner,
                repo: outputMode.repo,
                branch: outputMode.branch,
                mode: outputMode.makePr === true ? "pull-request" : "release",
                publishInfo: outputMode.publishInfo
            });
        case "githubV2": {
            const github = outputMode.githubV2;
            return mapGithubOutput({
                owner: github.owner,
                repo: github.repo,
                host: github.host,
                branch: github.branch,
                mode: github.type === "pullRequest" ? "pull-request" : github.type === "push" ? "push" : "release",
                reviewers: github.type === "pullRequest" ? mapGithubReviewers(github.reviewers) : undefined,
                publishInfo: github.publishInfo
            });
        }
        case "publishV2": {
            const mapped = mapPublishOutputV2(outputMode.publishV2);
            return {
                ...(mapped.package != null ? { package: mapped.package } : {}),
                requestedOutput: { type: "publish", publish: mapped.publish }
            };
        }
        case "publish": {
            const mapped = mapLegacyPublishOutput(generatorInvocation, outputMode.registryOverrides);
            return {
                ...(mapped.package != null ? { package: mapped.package } : {}),
                requestedOutput: { type: "publish", publish: mapped.publish }
            };
        }
    }
}

function mapGithubOutput({
    owner,
    repo,
    host,
    branch,
    mode,
    reviewers,
    publishInfo
}: {
    owner: string;
    repo: string;
    host?: string;
    branch?: string;
    mode: "release" | "pull-request" | "push";
    reviewers?: { teams?: string[]; users?: string[] };
    publishInfo?: FernFiddle.GithubPublishInfo;
}): FernSdkGenApiOutputMapping {
    const publication = publishInfo != null ? mapGithubPublishInfo(publishInfo) : undefined;
    // TODO: Before broadly enabling this route, require downstream credential resolution to bind
    // credentials to approved GitHub installations/repositories and registry hosts/package namespaces.
    return {
        ...(publication?.package != null ? { package: publication.package } : {}),
        requestedOutput: {
            type: "github",
            repository: `${owner}/${repo}`,
            ...(host != null ? { host } : {}),
            ...(branch != null ? { branch } : {}),
            mode,
            ...(reviewers != null ? { reviewers } : {}),
            ...(publication != null ? { publish: publication.publish } : {})
        }
    };
}

function mapGithubReviewers(
    reviewers: FernFiddle.GithubPullRequestReviewer[] | undefined
): { teams?: string[]; users?: string[] } | undefined {
    if (reviewers == null) {
        return undefined;
    }
    const teams = reviewers.filter((reviewer) => reviewer.type === "team").map((reviewer) => reviewer.name);
    const users = reviewers.filter((reviewer) => reviewer.type === "user").map((reviewer) => reviewer.name);
    if (teams.length === 0 && users.length === 0) {
        return undefined;
    }
    return {
        ...(teams.length > 0 ? { teams } : {}),
        ...(users.length > 0 ? { users } : {})
    };
}

interface FernSdkGenApiPublicationMapping {
    package?: FernSdkGenApiPackageConfig;
    publish: FernSdkGenApiPublishConfig;
}

function mapPublishOutputV2(publish: FernFiddle.PublishOutputModeV2): FernSdkGenApiPublicationMapping {
    switch (publish.type) {
        case "npmOverride":
            return mapNpmPublish(publish.npmOverride);
        case "mavenOverride":
            return mapMavenPublish(publish.mavenOverride);
        case "pypiOverride":
            return mapPypiPublish(publish.pypiOverride);
        case "rubyGemsOverride":
            return mapNamedPublish("rubygems", publish.rubyGemsOverride);
        case "nugetOverride":
            return mapNamedPublish("nuget", publish.nugetOverride);
        case "cratesOverride":
            return mapNamedPublish("crates", publish.cratesOverride);
        case "postman":
            throw new Error("sdk-gen-api does not support Postman collection publication as an SDK output");
    }
}

function mapGithubPublishInfo(publish: FernFiddle.GithubPublishInfo): FernSdkGenApiPublicationMapping {
    switch (publish.type) {
        case "npm":
            return mapNpmPublish(publish);
        case "maven":
            return mapMavenPublish(publish);
        case "pypi":
            return mapPypiPublish(publish);
        case "rubygems":
            return mapNamedPublish("rubygems", publish);
        case "nuget":
            return mapNamedPublish("nuget", publish);
        case "crates":
            return mapNamedPublish("crates", publish);
        case "postman":
            throw new Error("sdk-gen-api does not support Postman collection publication as an SDK output");
    }
}

function mapNpmPublish(
    output: Pick<FernFiddle.NpmOutput, "registryUrl" | "packageName"> | undefined
): FernSdkGenApiPublicationMapping {
    return {
        ...(output?.packageName ? { package: { packageName: output.packageName } } : {}),
        publish: {
            registry: "npm",
            ...(output?.registryUrl ? { url: output.registryUrl } : {})
        }
    };
}

function mapPypiPublish(
    output:
        | Pick<FernFiddle.PypiOutput, "registryUrl" | "coordinate">
        | Pick<FernFiddle.PyPiOutputWithOptionalCreds, "registryUrl" | "packageName">
        | undefined
): FernSdkGenApiPublicationMapping {
    const packageName = output != null && "coordinate" in output ? output.coordinate : output?.packageName;
    return {
        ...(packageName ? { package: { packageName } } : {}),
        publish: {
            registry: "pypi",
            ...(output?.registryUrl ? { url: output.registryUrl } : {})
        }
    };
}

function mapMavenPublish(
    output: Pick<FernFiddle.MavenOutput, "registryUrl" | "coordinate"> | undefined
): FernSdkGenApiPublicationMapping {
    const packageConfig = output?.coordinate != null ? packageFromMavenCoordinate(output.coordinate) : undefined;
    return {
        ...(packageConfig != null ? { package: packageConfig } : {}),
        publish: {
            registry: "maven",
            ...(output?.registryUrl ? { url: output.registryUrl } : {})
        }
    };
}

function mapNamedPublish(
    registry: "nuget" | "rubygems" | "crates",
    output: { registryUrl: string; packageName: string } | undefined
): FernSdkGenApiPublicationMapping {
    return {
        ...(output?.packageName ? { package: { packageName: output.packageName } } : {}),
        publish: {
            registry,
            ...(output?.registryUrl ? { url: output.registryUrl } : {})
        }
    };
}

function packageFromMavenCoordinate(coordinate: string): FernSdkGenApiPackageConfig {
    const [groupId, artifactId] = coordinate.split(":");
    if (!groupId || !artifactId) {
        throw new Error(`Invalid Maven coordinate for sdk-gen-api: ${coordinate}`);
    }
    return { groupId, artifactId };
}

function mapLegacyPublishOutput(
    generatorInvocation: generatorsYml.GeneratorInvocation,
    overrides: FernFiddle.RegistryOverrides
): FernSdkGenApiPublicationMapping {
    const language = getFernSdkGenApiLanguage(generatorInvocation.name);
    if (language === "typescript" && overrides.npm != null) {
        return mapNpmPublish(overrides.npm);
    }
    if ((language === "java" || language === "kotlin") && overrides.maven != null) {
        return mapMavenPublish(overrides.maven);
    }
    const registry = defaultPublishRegistry(language);
    if (registry == null) {
        throw new Error(`sdk-gen-api cannot infer a registry for ${language ?? generatorInvocation.name}`);
    }
    return { publish: { registry } };
}

function defaultPublishRegistry(language: FernSdkGenApiLanguage | undefined): FernSdkGenApiPublishRegistry | undefined {
    switch (language) {
        case "typescript":
            return "npm";
        case "python":
            return "pypi";
        case "java":
        case "kotlin":
            return "maven";
        case "go":
            return "go";
        case "csharp":
            return "nuget";
        case "php":
            return "composer";
        case "ruby":
            return "rubygems";
        case "rust":
            return "crates";
        case "swift":
        case "cli":
        case undefined:
            return undefined;
    }
}

export interface FernSdkGenApiCandidate {
    generatorInvocation: generatorsYml.GeneratorInvocation;
    sdkVersion: string | undefined;
    specsTarGzBuffer: Buffer | undefined;
    whitelabel?: FernFiddle.WhitelabelConfig;
}

export interface EligibleFernSdkGenApiCandidate extends FernSdkGenApiCandidate {
    sdkVersion: string;
    specsTarGzBuffer: Buffer;
}

export function isEligibleForFernSdkGenApi(
    candidate: FernSdkGenApiCandidate
): candidate is EligibleFernSdkGenApiCandidate {
    const { generatorInvocation, sdkVersion, specsTarGzBuffer, whitelabel } = candidate;
    const language = getFernSdkGenApiLanguage(generatorInvocation.name);
    // Fiddle currently replaces AUTO after generation. Until that step moves into the shared
    // pipeline, forwarding AUTO would write the literal placeholder into generated packages.
    const hasConcreteVersion = sdkVersion != null && sdkVersion.trim().length > 0 && !isAutoVersion(sdkVersion);
    return (
        language != null &&
        (generatorInvocation.language == null || generatorInvocation.language === language) &&
        hasConcreteVersion &&
        specsTarGzBuffer != null &&
        whitelabel == null
    );
}

export interface FernSdkGenApiBuildParameters {
    apiName: string;
    organization: string;
    cliVersion: string | undefined;
    generatorInvocation: generatorsYml.GeneratorInvocation;
    sdkVersion: string;
    token: FernToken;
    specsTarGzBuffer: Buffer;
    absolutePathToPreview: AbsoluteFilePath | undefined;
    context: InteractiveTaskContext;
    targetIdSeed?: string;
    audiences?: string[];
    skipFernignore?: boolean;
}

export interface FernSdkGenApiBuildResponse {
    createdSnippets: false;
    snippetsS3PreSignedReadUrl: undefined;
    actualVersion: string;
    pullRequestUrl: undefined;
    noChangesDetected: undefined;
    publishTarget: undefined;
}

interface FernSdkGenApiBatchParticipant extends FernSdkGenApiBuildParameters {
    resolve: (response: FernSdkGenApiBuildResponse) => void;
    reject: (error: unknown) => void;
}

/**
 * Coordinates the generators in one Fern group so they remain one multi-target backend build.
 * Each generator keeps its own task context and output directory, while submission and polling
 * happen once for the group.
 */
export class FernSdkGenApiBatch {
    private expectedTargets: number;
    private readonly participants: FernSdkGenApiBatchParticipant[] = [];
    private terminalError: unknown;
    private dispatched = false;

    public constructor(expectedTargets: number) {
        if (expectedTargets < 1) {
            throw new Error("A Fern sdk-gen-api batch must expect at least one target");
        }
        this.expectedTargets = expectedTargets;
    }

    public run(parameters: FernSdkGenApiBuildParameters): Promise<FernSdkGenApiBuildResponse> {
        if (this.terminalError != null) {
            return Promise.reject(this.terminalError);
        }
        if (this.dispatched) {
            return Promise.reject(new Error("The Fern sdk-gen-api batch was already dispatched"));
        }
        return new Promise((resolve, reject) => {
            this.participants.push({ ...parameters, resolve, reject });
            this.dispatchIfReady();
        });
    }

    /** Removes a statically selected target that became ineligible after SDK-version/source resolution. */
    public skip(): void {
        if (this.dispatched || this.terminalError != null) {
            return;
        }
        this.expectedTargets -= 1;
        this.dispatchIfReady();
    }

    /** Prevents siblings waiting at the batch barrier from hanging if preparation of one fails. */
    public cancel(error: unknown): void {
        if (this.dispatched || this.terminalError != null) {
            return;
        }
        this.terminalError = error;
        for (const participant of this.participants) {
            participant.reject(error);
        }
    }

    private dispatchIfReady(): void {
        if (this.dispatched || this.terminalError != null || this.participants.length !== this.expectedTargets) {
            return;
        }
        this.dispatched = true;
        void this.dispatch();
    }

    private async dispatch(): Promise<void> {
        try {
            const results = await executeFernSdkGenApiBuild(this.participants);
            results.forEach((result, index) => {
                const participant = this.participants[index];
                if (result.status === "fulfilled") {
                    participant?.resolve(result.value);
                } else {
                    participant?.reject(result.reason);
                }
            });
        } catch (error) {
            this.terminalError = error;
            for (const participant of this.participants) {
                participant.reject(error);
            }
        }
    }
}

export async function runFernSdkGenApiBuild(
    parameters: FernSdkGenApiBuildParameters
): Promise<FernSdkGenApiBuildResponse> {
    const [result] = await executeFernSdkGenApiBuild([parameters]);
    if (result?.status === "fulfilled") {
        return result.value;
    }
    throw result?.reason ?? new Error("sdk-gen-api did not return the requested target");
}

async function executeFernSdkGenApiBuild(
    participants: FernSdkGenApiBuildParameters[]
): Promise<PromiseSettledResult<FernSdkGenApiBuildResponse>[]> {
    const first = participants[0];
    if (first == null) {
        throw new Error("Cannot submit an empty Fern sdk-gen-api build");
    }
    let origin: string | undefined;
    try {
        origin = getFernSdkGenApiOrigin();
    } catch (error) {
        return first.context.failAndThrow(
            error instanceof Error ? error.message : "Invalid sdk-gen-api origin",
            error,
            {
                code: CliError.Code.ConfigError
            }
        );
    }
    if (!origin) {
        return first.context.failAndThrow(
            "FERN_SDK_GEN_API_ORIGIN is required when FERN_USE_SDK_GEN_API=true",
            undefined,
            { code: CliError.Code.ConfigError }
        );
    }

    assertSameBatchInput(participants);
    const request = createFernSdkGenApiBatchRequest({
        apiName: first.apiName,
        organization: first.organization,
        cliVersion: first.cliVersion,
        specsTarGzBuffer: first.specsTarGzBuffer,
        targets: participants.map((participant) => ({
            generatorInvocation: participant.generatorInvocation,
            sdkVersion: participant.sdkVersion,
            targetIdSeed: participant.targetIdSeed,
            audiences: participant.audiences
        }))
    });

    const form = new FormData();
    form.append("request", JSON.stringify(request));
    form.append("sources", first.specsTarGzBuffer, {
        filename: "specs.tar.gz",
        contentType: "application/gzip"
    });

    let buildId: string;
    try {
        const response = await axios.post<{ buildId: string }>(`${origin}/v1/fern/build`, form, {
            headers: {
                ...form.getHeaders(),
                // TODO: Replace the reusable Fern bearer token with a short-lived, audience-restricted
                // sdk-generation token once cross-service token exchange is available.
                Authorization: `Bearer ${first.token.value}`,
                "X-Fern-Organization-Id": first.organization
            },
            maxBodyLength: 30 * 1024 * 1024,
            timeout: REQUEST_TIMEOUT_MS
        });
        buildId = response.data.buildId;
    } catch (error) {
        const axiosError = error as AxiosError<{ message?: string }>;
        return first.context.failAndThrow(
            `Failed to submit sdk-gen-api build: ${axiosError.response?.data?.message ?? axiosError.message}`,
            error,
            { code: CliError.Code.NetworkError }
        );
    }

    for (const participant of participants) {
        participant.context.logger.debug(`sdk-gen-api build ID: ${buildId}`);
    }
    const loggedByTarget = new Map<string, number>();
    const pollDeadline = Date.now() + POLL_TIMEOUT_MS;
    for (;;) {
        let status: FernBuildStatus;
        try {
            const response = await axios.get<FernBuildStatus>(`${origin}/v1/fern/build/${buildId}`, {
                headers: {
                    Authorization: `Bearer ${first.token.value}`,
                    "X-Fern-Organization-Id": first.organization
                },
                timeout: REQUEST_TIMEOUT_MS
            });
            status = response.data;
        } catch (error) {
            return first.context.failAndThrow("Failed to poll sdk-gen-api build", error, {
                code: CliError.Code.NetworkError
            });
        }

        const missingTarget = request.targets.find(
            (requestTarget) => !status.targets.some((target) => target.targetId === requestTarget.targetId)
        );
        if (missingTarget != null) {
            return first.context.failAndThrow(
                `sdk-gen-api response did not contain target ${missingTarget.targetId}`,
                undefined,
                { code: CliError.Code.InternalError }
            );
        }

        for (const [index, requestTarget] of request.targets.entries()) {
            const target = status.targets.find((candidate) => candidate.targetId === requestTarget.targetId);
            const context = participants[index]?.context;
            if (target == null || context == null) {
                continue;
            }
            const logged = loggedByTarget.get(target.targetId) ?? 0;
            for (const log of target.logs.slice(logged)) {
                context.logger.info(log.message);
            }
            loggedByTarget.set(target.targetId, target.logs.length);
        }

        const allTargetsTerminal = request.targets.every((requestTarget) => isTerminal(status, requestTarget.targetId));
        if (allTargetsTerminal || status.status === "failed" || status.status === "succeeded") {
            return Promise.allSettled(
                participants.map((participant, index) =>
                    finishFernSdkGenApiTarget(participant, request.targets[index]?.targetId, status)
                )
            );
        }
        if (Date.now() >= pollDeadline) {
            return first.context.failAndThrow(
                `Timed out waiting for sdk-gen-api build ${buildId} after ${POLL_TIMEOUT_MS / 60_000} minutes`,
                undefined,
                { code: CliError.Code.NetworkError }
            );
        }
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    }
}

function isTerminal(status: FernBuildStatus, targetId: string): boolean {
    const target = status.targets.find((candidate) => candidate.targetId === targetId);
    return target?.status === "failed" || target?.status === "succeeded";
}

async function finishFernSdkGenApiTarget(
    participant: FernSdkGenApiBuildParameters,
    targetId: string | undefined,
    status: FernBuildStatus
): Promise<FernSdkGenApiBuildResponse> {
    const target = status.targets.find((candidate) => candidate.targetId === targetId);
    if (target == null) {
        return participant.context.failAndThrow(
            "sdk-gen-api response did not contain the requested target",
            undefined,
            {
                code: CliError.Code.InternalError
            }
        );
    }
    if (target.status === "failed") {
        return participant.context.failAndThrow(target.error?.message ?? "sdk-gen-api generation failed", undefined, {
            code: CliError.Code.ContainerError
        });
    }
    if (target.status !== "succeeded") {
        return participant.context.failAndThrow(
            `sdk-gen-api build ended with status ${status.status} while target ${target.targetId} remained ${target.status}`,
            undefined,
            { code: CliError.Code.InternalError }
        );
    }
    if (target.result?.artifactUrl == null) {
        return participant.context.failAndThrow("sdk-gen-api target completed without an artifact URL", undefined, {
            code: CliError.Code.InternalError
        });
    }
    const outputPath =
        participant.absolutePathToPreview != null
            ? join(
                  participant.absolutePathToPreview,
                  RelativeFilePath.of(path.basename(participant.generatorInvocation.name))
              )
            : participant.generatorInvocation.absolutePathToLocalOutput;
    if (outputPath != null) {
        await downloadFilesForTask({
            s3PreSignedReadUrl: target.result.artifactUrl,
            absolutePathToLocalOutput: outputPath,
            context: participant.context,
            skipFernignore: participant.skipFernignore
        });
    }
    return {
        createdSnippets: false,
        snippetsS3PreSignedReadUrl: undefined,
        actualVersion: target.result.actualVersion ?? participant.sdkVersion,
        pullRequestUrl: undefined,
        noChangesDetected: undefined,
        publishTarget: undefined
    };
}

function assertSameBatchInput(participants: FernSdkGenApiBuildParameters[]): void {
    const first = participants[0];
    if (first == null) {
        return;
    }
    const sourceHash = createHash("sha256").update(first.specsTarGzBuffer).digest("hex");
    for (const participant of participants.slice(1)) {
        const participantSourceHash = createHash("sha256").update(participant.specsTarGzBuffer).digest("hex");
        if (
            participant.apiName !== first.apiName ||
            participant.organization !== first.organization ||
            participant.token.value !== first.token.value ||
            participantSourceHash !== sourceHash
        ) {
            throw new Error("Fern sdk-gen-api batch targets must share API, organization, token, and sources");
        }
    }
}

export function createFernSdkGenApiRequest({
    apiName,
    organization,
    cliVersion,
    generatorInvocation,
    sdkVersion,
    specsTarGzBuffer
}: {
    apiName: string;
    organization: string;
    cliVersion: string | undefined;
    generatorInvocation: generatorsYml.GeneratorInvocation;
    sdkVersion: string;
    specsTarGzBuffer: Buffer;
}): FernSdkGenApiRequest {
    return createFernSdkGenApiBatchRequest({
        apiName,
        organization,
        cliVersion,
        specsTarGzBuffer,
        targets: [{ generatorInvocation, sdkVersion }]
    });
}

export function createFernSdkGenApiBatchRequest({
    apiName,
    organization,
    cliVersion,
    specsTarGzBuffer,
    targets
}: {
    apiName: string;
    organization: string;
    cliVersion: string | undefined;
    specsTarGzBuffer: Buffer;
    targets: Array<{
        generatorInvocation: generatorsYml.GeneratorInvocation;
        sdkVersion: string;
        targetIdSeed?: string;
        audiences?: string[];
    }>;
}): FernSdkGenApiRequest {
    if (targets.length === 0) {
        throw new Error("Cannot create an empty Fern sdk-gen-api request");
    }
    const requestTargets = targets.map(({ generatorInvocation, sdkVersion, targetIdSeed, audiences }, index) => {
        const language = getFernSdkGenApiLanguage(generatorInvocation.name);
        if (language == null) {
            throw new Error(`Unsupported Fern SDK generator: ${generatorInvocation.name}`);
        }
        const output = mapFernSdkGenApiOutput(generatorInvocation);
        const targetId = createHash("sha256")
            .update(
                `${apiName}:${generatorInvocation.name}:${generatorInvocation.version}:${targetIdSeed ?? index.toString()}`
            )
            .digest("hex")
            .slice(0, 20);
        return {
            targetId,
            apiInputId: "default",
            language,
            sdk: { name: apiName, version: sdkVersion },
            fernGenerator: {
                id: generatorInvocation.name,
                version: generatorInvocation.version
            },
            ...(output.package != null ? { package: output.package } : {}),
            invocation: {
                customConfig: (stripCliConfigKeys(generatorInvocation.config) ?? {}) as Record<string, unknown>,
                keywords: generatorInvocation.keywords ?? [],
                smartCasing: generatorInvocation.smartCasing,
                smartCasingDigitWordBoundary: generatorInvocation.smartCasingDigitWordBoundary,
                disableExamples: generatorInvocation.disableExamples,
                ...(audiences != null ? { audiences } : {}),
                ...(generatorInvocation.readme != null
                    ? { readme: generatorInvocation.readme as Record<string, unknown> }
                    : {}),
                ...(generatorInvocation.settings != null
                    ? {
                          settings: generatorInvocation.settings as Record<string, unknown>
                      }
                    : {}),
                ...(generatorInvocation.apiOverride != null
                    ? {
                          apiOverride: generatorInvocation.apiOverride as Record<string, unknown>
                      }
                    : {})
            },
            requestedOutput: output.requestedOutput
        };
    });
    const apiInputs: FernSdkGenApiRequest["apiInputs"] = [{ id: "default", specIndexes: "all" }];
    const idempotencyKey = createHash("sha256")
        .update(specsTarGzBuffer)
        .update(
            JSON.stringify({
                protocolVersion: 1,
                organization,
                apiName,
                apiInputs,
                targets: requestTargets
            })
        )
        .digest("hex");

    return {
        protocolVersion: 1,
        apiName,
        ...(cliVersion ? { cliVersion } : {}),
        idempotencyKey,
        apiInputs,
        targets: requestTargets
    };
}
