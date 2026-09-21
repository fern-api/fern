// cspell:ignore kotlin
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
import { gunzipSync } from "zlib";
import { type PublishTarget } from "./publishTarget.js";
import { downloadArchiveForTask, downloadFilesForTask } from "./RemoteTaskHandler.js";
import {
    type GenerationConfigKind,
    type GenerationConfigRoute,
    type GenerationPayloadKind,
    GeneratorConfigCompatibilityError,
    type GeneratorLanguage,
    getGeneratorLanguage,
    validateGeneratorConfigCompatibility
} from "./sdk-gen-client/index.js";

const POLL_INTERVAL_MS = 2_000;
const POLL_TIMEOUT_MS = 15 * 60 * 1_000;
const REQUEST_TIMEOUT_MS = 60_000;
const MAX_PAYLOADS = 64;
const MAX_SOURCE_COMPRESSED_BYTES = 25 * 1024 * 1024;
const MAX_SOURCE_DECOMPRESSED_BYTES = 25 * 1024 * 1024;
const MAX_RUNTIME_BUNDLE_COMPRESSED_BYTES = 5 * 1024 * 1024;
const MAX_PAYLOAD_BYTES = 25 * 1024 * 1024;
const MAX_TOTAL_RUNTIME_BUNDLE_COMPRESSED_BYTES = 25 * 1024 * 1024;
const MAX_TOTAL_PAYLOAD_BYTES = 100 * 1024 * 1024;
const MAX_RUNTIME_BUNDLE_DECOMPRESSED_BYTES = MAX_TOTAL_PAYLOAD_BYTES;
const MAX_TOTAL_UPLOAD_FILE_BYTES = 50 * 1024 * 1024;
const MAX_REQUEST_FIELD_BYTES = 1024 * 1024;
const MAX_MULTIPART_BODY_BYTES = 60 * 1024 * 1024;
const MAX_PUBLISH_CREDENTIAL_FIELD_LENGTH = 16 * 1024;
const MAX_PUBLISH_CREDENTIALS_BYTES = 64 * 1024;
const LOOPBACK_HOSTNAMES = new Set(["localhost", "127.0.0.1", "[::1]", "::1"]);
const TARGET_ID_SEED_COLLATOR = new Intl.Collator("en", { numeric: true });

export type FernSdkGenApiLanguage = GeneratorLanguage;

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

export function resolveSdkConfigRequestedOutput(
    requestedOutput: FernSdkGenApiRequestedOutput | undefined,
    isPreview: boolean
): FernSdkGenApiRequestedOutput | undefined {
    return isPreview ? { type: "download" } : requestedOutput;
}

interface FernBuildStatus {
    buildId: string;
    status: "queued" | "running" | "succeeded" | "failed" | "partial_failure";
    targets: Array<{
        targetId: string;
        status: "queued" | "running" | "publishing" | "succeeded" | "failed";
        logs: Array<{ level: string; message: string }>;
        result?: { artifactUrl: string; actualVersion?: string };
        error?: { message: string };
        publication?:
            | {
                  status: "success";
                  publishTarget: {
                      type: "github" | "npm" | "maven" | "pypi" | "crates" | "unsupported";
                      identifier: string;
                  };
                  output: { packageName?: string };
              }
            | {
                  status: "failure";
                  publishTarget: {
                      type: "github" | "npm" | "maven" | "pypi" | "crates" | "unsupported";
                      identifier: string;
                  };
                  error: { code: string; message: string };
              };
    }>;
}

class FernSdkGenApiSubmissionError extends Error {
    public readonly status: number | undefined;
    public readonly code: string | undefined;

    public constructor(message: string, status: number | undefined, code: string | undefined) {
        super(message);
        this.name = "FernSdkGenApiSubmissionError";
        this.status = status;
        this.code = code;
    }
}

export interface FernSdkGenApiRequest {
    protocolVersion: 2;
    apiName: string;
    cliVersion?: string;
    idempotencyKey: string;
    credentialSetId?: string;
    apiInputs: Array<{ id: string; specIndexes: "all" | number[] }>;
    targets: Array<{
        targetId: string;
        apiInputId: string;
        language: FernSdkGenApiLanguage;
        sdk: { name: string; version: string; apiVersion?: string };
        fernGenerator: { id: string; version: string };
        payloadKind: GenerationPayloadKind;
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

export type FernSdkGenApiPublishCredential =
    | { targetId: string; registry: "npm"; token: string }
    | { targetId: string; registry: "crates"; token: string }
    | { targetId: string; registry: "pypi"; username: string; password: string }
    | {
          targetId: string;
          registry: "maven";
          username: string;
          password: string;
          signature?: { keyId: string; password: string; secretKey: string };
      };

export interface FernSdkGenApiPublishCredentials {
    schemaVersion: "fern-publish-credentials/v1";
    credentialSetId: string;
    targets: FernSdkGenApiPublishCredential[];
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
    return getGeneratorLanguage(generatorName);
}

/** Validates a legacy Fern target and selects its compatible payload route without remote work. */
export function selectFernSdkGenApiRoute(
    generatorInvocation: generatorsYml.GeneratorInvocation,
    configKind: GenerationConfigKind = "legacy-fern"
): GenerationConfigRoute | undefined {
    const language = getFernSdkGenApiLanguage(generatorInvocation.name);
    if (language == null) {
        return undefined;
    }
    return validateGeneratorConfigCompatibility({
        generatorId: generatorInvocation.name,
        language: generatorInvocation.language ?? language,
        requestedVersion: generatorInvocation.version,
        configKind
    });
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
    if ((language === "typescript" || language === "mcp") && overrides.npm != null) {
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
        case "mcp":
            return "npm";
        case "swift":
        case "cli":
        case undefined:
            return undefined;
    }
}

function getDirectPublishCredential(
    targetId: string,
    generatorInvocation: generatorsYml.GeneratorInvocation
): FernSdkGenApiPublishCredential | undefined {
    const outputMode = generatorInvocation.outputMode;
    if (outputMode.type !== "publish" && outputMode.type !== "publishV2") {
        return undefined;
    }
    const requestedOutput = mapFernSdkGenApiOutput(generatorInvocation).requestedOutput;
    if (requestedOutput.type === "publish" && requestedOutput.publish.url != null) {
        assertSafeDirectPublishUrl(requestedOutput.publish.url);
    }
    if (outputMode.type === "publish") {
        const language = getFernSdkGenApiLanguage(generatorInvocation.name);
        if ((language === "typescript" || language === "mcp") && outputMode.registryOverrides.npm != null) {
            return npmCredential(targetId, outputMode.registryOverrides.npm.token);
        }
        if ((language === "java" || language === "kotlin") && outputMode.registryOverrides.maven != null) {
            return mavenCredential(targetId, outputMode.registryOverrides.maven);
        }
        const registry = defaultPublishRegistry(language);
        if (registry == null || !isSupportedDirectRegistry(registry)) {
            throw new Error(`sdk-gen-api does not support direct ${registry ?? "unknown"} registry publication`);
        }
        throw new Error(`Direct ${registry} publication through sdk-gen-api requires publish credentials`);
    }
    const publish = outputMode.publishV2;
    switch (publish.type) {
        case "npmOverride": {
            const output = requirePublishOverride("npm", publish.npmOverride);
            return npmCredential(targetId, output.token);
        }
        case "mavenOverride": {
            const output = requirePublishOverride("maven", publish.mavenOverride);
            return mavenCredential(targetId, output);
        }
        case "pypiOverride": {
            const output = requirePublishOverride("pypi", publish.pypiOverride);
            return pypiCredential(targetId, output.username, output.password);
        }
        case "cratesOverride": {
            const output = requirePublishOverride("crates", publish.cratesOverride);
            return tokenCredential(targetId, "crates", output.token);
        }
        case "rubyGemsOverride":
            throw new Error("sdk-gen-api does not support direct rubygems registry publication");
        case "nugetOverride":
            throw new Error("sdk-gen-api does not support direct nuget registry publication");
        case "postman":
            throw new Error("sdk-gen-api does not support Postman collection publication as an SDK output");
    }
}

function requirePublishOverride<T>(registry: string, output: T | undefined): T {
    if (output == null) {
        throw new Error(`Direct ${registry} publication through sdk-gen-api is missing its registry configuration`);
    }
    return output;
}

function npmCredential(targetId: string, token: string): FernSdkGenApiPublishCredential {
    return tokenCredential(targetId, "npm", token);
}

function tokenCredential(targetId: string, registry: "npm" | "crates", token: string): FernSdkGenApiPublishCredential {
    assertDirectCredential(registry, "token", token);
    return { targetId, registry, token };
}

function pypiCredential(targetId: string, username: string, password: string): FernSdkGenApiPublishCredential {
    assertDirectCredential("pypi", "username", username);
    assertDirectCredential("pypi", "password", password);
    return { targetId, registry: "pypi", username, password };
}

function mavenCredential(
    targetId: string,
    output: {
        username?: string;
        password?: string;
        signature?: { keyId: string; password: string; secretKey: string } | null;
    }
): FernSdkGenApiPublishCredential {
    assertDirectCredential("maven", "username", output.username);
    assertDirectCredential("maven", "password", output.password);
    const signature = output.signature ?? undefined;
    if (signature != null) {
        assertDirectCredential("maven", "signature.keyId", signature.keyId);
        assertDirectCredential("maven", "signature.password", signature.password);
        assertDirectCredential("maven", "signature.secretKey", signature.secretKey);
    }
    return {
        targetId,
        registry: "maven",
        username: output.username,
        password: output.password,
        ...(signature != null ? { signature } : {})
    };
}

function assertDirectCredential(registry: string, field: string, value: string | undefined): asserts value is string {
    if (value == null || value.trim().length === 0) {
        throw new Error(`Direct ${registry} publication through sdk-gen-api requires ${field}`);
    }
    if (value === "OIDC" || value === "<USE_OIDC>") {
        throw new Error(`Direct ${registry} publication through sdk-gen-api does not support OIDC credentials`);
    }
    if (Buffer.byteLength(value, "utf8") > MAX_PUBLISH_CREDENTIAL_FIELD_LENGTH) {
        throw new Error(`Direct ${registry} publication through sdk-gen-api ${field} exceeds the 16 KiB field limit`);
    }
}

function assertSafeDirectPublishUrl(value: string): void {
    try {
        const url = new URL(value);
        if (url.protocol === "https:" && url.username.length === 0 && url.password.length === 0) {
            return;
        }
    } catch {
        // Invalid URLs use the same credential-safe diagnostic as other rejected URL forms.
    }
    throw new Error("Direct registry URL must use HTTPS and must not contain user information");
}

function isSupportedDirectRegistry(
    registry: FernSdkGenApiPublishRegistry
): registry is "npm" | "maven" | "pypi" | "crates" {
    return registry === "npm" || registry === "maven" || registry === "pypi" || registry === "crates";
}

export function createFernSdkGenApiPublishCredentials(
    request: FernSdkGenApiRequest,
    generatorInvocations: generatorsYml.GeneratorInvocation[]
): FernSdkGenApiPublishCredentials | undefined {
    const targets = request.targets.flatMap((target, index) => {
        const generatorInvocation = generatorInvocations[index];
        if (generatorInvocation == null) {
            throw new Error(`Cannot pair sdk-gen-api target ${target.targetId} with publish credentials`);
        }
        const credential = getDirectPublishCredential(target.targetId, generatorInvocation);
        return credential != null ? [credential] : [];
    });
    if (targets.length === 0) {
        return undefined;
    }
    if (targets.length > MAX_PAYLOADS) {
        throw new Error(`sdk-gen-api supports at most ${MAX_PAYLOADS} direct publish credential targets`);
    }
    if (request.credentialSetId == null) {
        throw new Error("sdk-gen-api direct registry targets require a credentialSetId");
    }
    return {
        schemaVersion: "fern-publish-credentials/v1",
        credentialSetId: request.credentialSetId,
        targets
    };
}

export function validateFernSdkGenApiDirectPublishCredentials(
    generatorInvocation: generatorsYml.GeneratorInvocation
): void {
    getDirectPublishCredential("preflight", generatorInvocation);
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
    return language != null && hasConcreteVersion && specsTarGzBuffer != null && whitelabel == null;
}

export interface FernSdkGenApiPayload {
    payloadKind: GenerationPayloadKind;
    body: Buffer;
    package?: FernSdkGenApiPackageConfig;
}

/** Validated customer SDK Config metadata plus its JSON wire payload for sdk-gen-api. */
export interface FernSdkConfigV1Payload {
    body: Buffer;
    sdkName: string;
    sdkVersion: string;
    apiVersion?: string;
    /** Undefined selects all audiences; a present empty array selects only untagged API elements. */
    audiences?: string[];
    clientPathParameterStyle?: "inline" | "wrapped" | "language-default";
    targets: Array<{
        language: string;
        generatorVersion?: string;
        sdkName?: string;
        sdkVersion?: string;
        clientPathParameterStyle?: "inline" | "wrapped" | "language-default";
        requestedOutput?: FernSdkGenApiRequestedOutput;
        /** Local-only destination for a requested ZIP artifact; never serialized to sdk-gen-api. */
        absolutePathToLocalOutputArchive?: AbsoluteFilePath;
        package?: FernSdkGenApiPackageConfig;
    }>;
}

export interface FernSdkGenApiBuildParameters {
    apiName: string;
    organization: string;
    cliVersion: string | undefined;
    generatorInvocation: generatorsYml.GeneratorInvocation;
    sdkName?: string;
    sdkVersion: string;
    apiVersion?: string;
    token: FernToken;
    specsTarGzBuffer: Buffer;
    payload: FernSdkGenApiPayload;
    requestedOutput?: FernSdkGenApiRequestedOutput;
    absolutePathToLocalOutputArchive?: AbsoluteFilePath;
    absolutePathToPreview: AbsoluteFilePath | undefined;
    context: InteractiveTaskContext;
    targetIdSeed?: string;
    sourceSpecIndexes?: number[];
    audiences?: string[];
    skipFernignore?: boolean;
}

export interface FernSdkGenApiBuildResponse {
    createdSnippets: false;
    snippetsS3PreSignedReadUrl: undefined;
    actualVersion: string;
    pullRequestUrl: undefined;
    noChangesDetected: undefined;
    publishTarget: PublishTarget | undefined;
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
    private readonly removedTargetIds = new Set<string>();
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
        if (parameters.targetIdSeed != null && this.removedTargetIds.has(parameters.targetIdSeed)) {
            return Promise.reject(new Error(`Fern sdk-gen-api target ${parameters.targetIdSeed} was removed`));
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

    /** Removes one failed automation target while preserving undispatched siblings. */
    public remove(targetIdSeed: string, error: unknown): boolean {
        if (this.dispatched || this.terminalError != null) {
            return false;
        }
        if (this.removedTargetIds.has(targetIdSeed)) {
            return false;
        }
        this.removedTargetIds.add(targetIdSeed);
        const participantIndex = this.participants.findIndex(
            (participant) => participant.targetIdSeed === targetIdSeed
        );
        const [participant] = participantIndex >= 0 ? this.participants.splice(participantIndex, 1) : [];
        participant?.reject(error);
        this.expectedTargets -= 1;
        this.dispatchIfReady();
        return true;
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
        if (
            this.dispatched ||
            this.terminalError != null ||
            this.expectedTargets === 0 ||
            this.participants.length !== this.expectedTargets
        ) {
            return;
        }
        this.dispatched = true;
        void this.dispatch();
    }

    private async dispatch(): Promise<void> {
        const orderedParticipants = [...this.participants].sort(compareFernSdkGenApiParticipants);
        try {
            const results = await executeFernSdkGenApiBuild(orderedParticipants);
            results.forEach((result, index) => {
                const participant = orderedParticipants[index];
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

/** Holds every selected target before remote mutations until local payload preparation settles. */
export class FernSdkGenApiPreparationBatch {
    private readonly expectedTargetIds: Set<string>;
    private readonly settledTargetIds = new Set<string>();
    private readonly waiters: Array<{
        resolve: () => void;
        reject: (error: unknown) => void;
    }> = [];
    private readonly preflightParticipants: FernSdkGenApiBuildParameters[] = [];
    private terminalError: unknown;
    private didRunPreflight = false;

    public constructor(targetIds: string[]) {
        this.expectedTargetIds = new Set(targetIds);
        if (this.expectedTargetIds.size !== targetIds.length) {
            throw new Error("Fern sdk-gen-api preparation target IDs must be unique");
        }
    }

    public ready(targetId: string, preflightParameters?: FernSdkGenApiBuildParameters): Promise<void> {
        this.assertExpected(targetId);
        if (this.settledTargetIds.has(targetId)) {
            throw new Error(`Fern sdk-gen-api target ${targetId} prepared more than once`);
        }
        this.settledTargetIds.add(targetId);
        if (preflightParameters != null) {
            this.preflightParticipants.push(preflightParameters);
        }
        return new Promise((resolve, reject) => {
            this.waiters.push({ resolve, reject });
            this.finishIfSettled();
        });
    }

    /** Returns true only when this call newly settles a target that failed before preparation. */
    public fail(targetId: string, error: unknown, isolateFailure: boolean): boolean {
        this.assertExpected(targetId);
        if (this.settledTargetIds.has(targetId)) {
            return false;
        }
        this.settledTargetIds.add(targetId);
        if (!isolateFailure) {
            this.terminalError = error;
        }
        this.finishIfSettled();
        return true;
    }

    private assertExpected(targetId: string): void {
        if (!this.expectedTargetIds.has(targetId)) {
            throw new Error(`Unexpected Fern sdk-gen-api preparation target ${targetId}`);
        }
    }

    private finishIfSettled(): void {
        if (this.settledTargetIds.size !== this.expectedTargetIds.size) {
            return;
        }
        if (!this.didRunPreflight && this.terminalError == null && this.preflightParticipants.length > 0) {
            this.didRunPreflight = true;
            try {
                prepareFernSdkGenApiSubmission(this.preflightParticipants);
            } catch (error) {
                this.terminalError = error;
            }
        }
        for (const waiter of this.waiters) {
            if (this.terminalError != null) {
                waiter.reject(this.terminalError);
            } else {
                waiter.resolve();
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

/** Runs every synchronous submission check and constructs multipart bytes without remote I/O. */
export function preflightFernSdkGenApiBuild(parameters: FernSdkGenApiBuildParameters): void {
    prepareFernSdkGenApiSubmission([parameters]);
}

export function validateFernSdkGenApiTargetCount(targetCount: number): void {
    if (targetCount > MAX_PAYLOADS) {
        throw new Error(
            `sdk-gen-api supports at most ${MAX_PAYLOADS} target payloads per build; received ${targetCount}`
        );
    }
}

function prepareFernSdkGenApiSubmission(participants: FernSdkGenApiBuildParameters[]): {
    first: FernSdkGenApiBuildParameters;
    origin: string;
    request: FernSdkGenApiRequest;
    form: FormData;
    sensitiveValues: string[];
} {
    const first = participants[0];
    if (first == null) {
        throw new Error("Cannot submit an empty Fern sdk-gen-api build");
    }
    assertGeneratorConfigCompatibility(participants);
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
    validateProtocolInputs(participants, first);
    const request = createFernSdkGenApiBatchRequest({
        apiName: first.apiName,
        organization: first.organization,
        cliVersion: first.cliVersion,
        specsTarGzBuffer: first.specsTarGzBuffer,
        targets: participants.map((participant) => ({
            generatorInvocation: participant.generatorInvocation,
            sdkName: participant.sdkName,
            sdkVersion: participant.sdkVersion,
            apiVersion: participant.apiVersion,
            targetIdSeed: participant.targetIdSeed,
            sourceSpecIndexes: participant.sourceSpecIndexes,
            audiences: participant.audiences,
            payload: participant.payload,
            requestedOutput: participant.requestedOutput
        }))
    });
    const credentials = createFernSdkGenApiPublishCredentials(
        request,
        participants.map((participant) => participant.generatorInvocation)
    );
    const credentialsBody = credentials != null ? Buffer.from(JSON.stringify(credentials)) : undefined;
    if (credentialsBody != null && credentialsBody.length > MAX_PUBLISH_CREDENTIALS_BYTES) {
        return first.context.failAndThrow(
            `sdk-gen-api publish credentials file is ${formatKiB(credentialsBody.length)}, exceeding the 64 KiB limit`,
            undefined,
            { code: CliError.Code.ConfigError }
        );
    }
    const aggregateUploadBytes =
        first.specsTarGzBuffer.length +
        participants.reduce((total, participant) => total + participant.payload.body.length, 0) +
        (credentialsBody?.length ?? 0);
    if (aggregateUploadBytes > MAX_TOTAL_UPLOAD_FILE_BYTES) {
        return first.context.failAndThrow(
            `sdk-gen-api source archive, target payloads, and publish credentials total ${formatMiB(aggregateUploadBytes)}, exceeding the 50 MiB in-memory upload limit`,
            undefined,
            { code: CliError.Code.ConfigError }
        );
    }
    const serializedRequest = JSON.stringify(request);
    const serializedRequestBytes = Buffer.byteLength(serializedRequest, "utf8");
    if (serializedRequestBytes > MAX_REQUEST_FIELD_BYTES) {
        return first.context.failAndThrow(
            `sdk-gen-api serialized request field is ${formatMiB(serializedRequestBytes)}, exceeding the 1 MiB UTF-8 field limit; reduce generator customConfig, readme, settings, or API override metadata`,
            undefined,
            { code: CliError.Code.ConfigError }
        );
    }

    const form = new FormData();
    form.append("request", serializedRequest);
    form.append("sources", first.specsTarGzBuffer, {
        filename: "specs.tar.gz",
        contentType: "application/gzip"
    });
    participants.forEach((participant, index) => {
        const target = request.targets[index];
        if (target == null) {
            throw new Error(`Cannot pair sdk-gen-api payload at index ${index} with a target`);
        }
        const isRuntimeBundle = participant.payload.payloadKind === "fern-runtime-bundle";
        // sdk-gen-api correlates payloads by this filename; ordering is only deterministic batching.
        form.append("payloads", participant.payload.body, {
            filename: `${target.targetId}.json${isRuntimeBundle ? ".gz" : ""}`,
            contentType: isRuntimeBundle ? "application/gzip" : "application/json"
        });
    });
    if (credentialsBody != null) {
        form.append("credentials", credentialsBody, {
            filename: "publish-credentials.v1.json",
            contentType: "application/json"
        });
    }
    const multipartBodyLength = form.getLengthSync();
    if (multipartBodyLength > MAX_MULTIPART_BODY_BYTES) {
        return first.context.failAndThrow(
            `sdk-gen-api multipart request is ${formatMiB(multipartBodyLength)}, exceeding the 60 MiB limit; reduce source or target payload size`,
            undefined,
            { code: CliError.Code.ConfigError }
        );
    }
    return {
        first,
        origin,
        request,
        form,
        sensitiveValues: [first.token.value, ...getCredentialSecretValues(credentials)]
    };
}

async function executeFernSdkGenApiBuild(
    participants: FernSdkGenApiBuildParameters[]
): Promise<PromiseSettledResult<FernSdkGenApiBuildResponse>[]> {
    const { first, origin, request, form, sensitiveValues } = prepareFernSdkGenApiSubmission(participants);

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
            maxBodyLength: MAX_MULTIPART_BODY_BYTES,
            timeout: REQUEST_TIMEOUT_MS
        });
        buildId = response.data.buildId;
    } catch (error) {
        const sanitizedError = sanitizeFernSdkGenApiSubmissionError(error, sensitiveValues);
        return first.context.failAndThrow(
            `Failed to submit sdk-gen-api build: ${sanitizedError.message}`,
            sanitizedError,
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
            const sanitizedError = sanitizeFernSdkGenApiSubmissionError(error, sensitiveValues);
            return first.context.failAndThrow("Failed to poll sdk-gen-api build", sanitizedError, {
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

function sanitizeFernSdkGenApiSubmissionError(error: unknown, sensitiveValues: string[]): FernSdkGenApiSubmissionError {
    if (!(error instanceof AxiosError)) {
        return new FernSdkGenApiSubmissionError(
            redactSensitiveValues(error instanceof Error ? error.message : "Unknown submission error", sensitiveValues),
            undefined,
            undefined
        );
    }
    const responseMessage =
        typeof error.response?.data === "object" &&
        error.response.data != null &&
        "message" in error.response.data &&
        typeof error.response.data.message === "string"
            ? error.response.data.message
            : undefined;
    return new FernSdkGenApiSubmissionError(
        redactSensitiveValues(responseMessage ?? error.message, sensitiveValues),
        error.response?.status ?? error.status,
        error.code
    );
}

function getCredentialSecretValues(credentials: FernSdkGenApiPublishCredentials | undefined): string[] {
    return (credentials?.targets ?? []).flatMap((target) => {
        if (target.registry === "npm" || target.registry === "crates") {
            return [target.token];
        }
        if (target.registry === "pypi") {
            return [target.username, target.password];
        }
        return [
            target.username,
            target.password,
            ...(target.signature != null
                ? [target.signature.keyId, target.signature.password, target.signature.secretKey]
                : [])
        ];
    });
}

function redactSensitiveValues(message: string, sensitiveValues: string[]): string {
    return sensitiveValues.reduce(
        (redacted, value) => (value.length > 0 ? redacted.replaceAll(value, "[REDACTED]") : redacted),
        message
    );
}

function assertGeneratorConfigCompatibility(participants: FernSdkGenApiBuildParameters[]): void {
    for (const participant of participants) {
        const { generatorInvocation } = participant;
        const language = generatorInvocation.language ?? getFernSdkGenApiLanguage(generatorInvocation.name);
        if (language == null) {
            participant.context.failAndThrow(
                `Cannot submit SDK generation to sdk-gen-api: generator language is unknown for ${generatorInvocation.name}`,
                undefined,
                { code: CliError.Code.ConfigError }
            );
        }
        try {
            validateGeneratorConfigCompatibility({
                generatorId: generatorInvocation.name,
                language,
                requestedVersion: generatorInvocation.version,
                configKind: participant.payload.payloadKind === "fern-runtime-bundle" ? "legacy-fern" : "sdk-config-v1"
            });
        } catch (error) {
            if (!(error instanceof GeneratorConfigCompatibilityError)) {
                throw error;
            }
            participant.context.failAndThrow(formatGeneratorConfigCompatibilityError(error), undefined, {
                code: CliError.Code.ConfigError
            });
        }
    }
}

export function formatGeneratorConfigCompatibilityError(error: GeneratorConfigCompatibilityError): string {
    const diagnostic = [
        error.code,
        `generator=${error.generatorId}`,
        `language=${error.language}`,
        `requestedVersion=${error.requestedVersion}`,
        `cutoverVersion=${error.cutoverVersion ?? "n/a"}`,
        `receivedConfigKind=${String(error.receivedConfigKind)}`,
        `expectedConfigKind=${error.expectedConfigKind ?? "n/a"}`,
        `expectedLanguage=${error.expectedLanguage ?? "n/a"}`,
        `retryable=${error.retryable}`,
        `recommendedAction=${error.recommendedAction}`
    ].join("; ");
    const migrationHint =
        error.recommendedAction === "USE_SDK_CONFIG_V1"
            ? " Run `fern sdk migrate`, then pass the generated document with `fern generate --sdk-config <path>` before using this generator version."
            : "";
    return `Cannot submit SDK generation to sdk-gen-api: ${error.message} [${diagnostic}].${migrationHint}`;
}

function compareFernSdkGenApiParticipants(
    left: FernSdkGenApiBuildParameters,
    right: FernSdkGenApiBuildParameters
): number {
    const seedComparison = TARGET_ID_SEED_COLLATOR.compare(left.targetIdSeed ?? "", right.targetIdSeed ?? "");
    if (seedComparison !== 0) {
        return seedComparison;
    }
    const generatorComparison = left.generatorInvocation.name.localeCompare(right.generatorInvocation.name);
    if (generatorComparison !== 0) {
        return generatorComparison;
    }
    const versionComparison = left.generatorInvocation.version.localeCompare(right.generatorInvocation.version);
    if (versionComparison !== 0) {
        return versionComparison;
    }
    return left.sdkVersion.localeCompare(right.sdkVersion);
}

function validateProtocolInputs(
    participants: FernSdkGenApiBuildParameters[],
    first: FernSdkGenApiBuildParameters
): void {
    if (participants.length > MAX_PAYLOADS) {
        first.context.failAndThrow(
            `sdk-gen-api supports at most ${MAX_PAYLOADS} target payloads per build; received ${participants.length}`,
            undefined,
            { code: CliError.Code.ConfigError }
        );
    }
    if (first.specsTarGzBuffer.length > MAX_SOURCE_COMPRESSED_BYTES) {
        first.context.failAndThrow(
            `sdk-gen-api source archive is ${formatMiB(first.specsTarGzBuffer.length)}, exceeding the 25 MiB compressed limit`,
            undefined,
            { code: CliError.Code.ConfigError }
        );
    }
    const oversizedPayloadIndex = participants.findIndex(
        (participant) =>
            participant.payload.body.length >
            (participant.payload.payloadKind === "fern-runtime-bundle"
                ? MAX_RUNTIME_BUNDLE_COMPRESSED_BYTES
                : MAX_PAYLOAD_BYTES)
    );
    if (oversizedPayloadIndex >= 0) {
        const participant = participants[oversizedPayloadIndex];
        const maxBytes =
            participant?.payload.payloadKind === "fern-runtime-bundle"
                ? MAX_RUNTIME_BUNDLE_COMPRESSED_BYTES
                : MAX_PAYLOAD_BYTES;
        first.context.failAndThrow(
            `sdk-gen-api ${payloadLabel(participant, oversizedPayloadIndex)} is ${formatMiB(participant?.payload.body.length ?? 0)}, exceeding the ${formatMiB(maxBytes)} upload limit`,
            undefined,
            { code: CliError.Code.ConfigError }
        );
    }
    const totalUploadFileBytes = participants.reduce(
        (total, participant) => total + participant.payload.body.length,
        first.specsTarGzBuffer.length
    );
    if (totalUploadFileBytes > MAX_TOTAL_UPLOAD_FILE_BYTES) {
        first.context.failAndThrow(
            `sdk-gen-api source archive and target payloads total ${formatMiB(totalUploadFileBytes)}, exceeding the 50 MiB in-memory upload limit; reduce the source archive size, target payload size, or number of targets`,
            undefined,
            { code: CliError.Code.ConfigError }
        );
    }
    const totalRuntimeBundleBytes = participants.reduce(
        (total, participant) =>
            participant.payload.payloadKind === "fern-runtime-bundle" ? total + participant.payload.body.length : total,
        0
    );
    if (totalRuntimeBundleBytes > MAX_TOTAL_RUNTIME_BUNDLE_COMPRESSED_BYTES) {
        first.context.failAndThrow(
            `sdk-gen-api runtime bundles total ${formatMiB(totalRuntimeBundleBytes)}, exceeding the 25 MiB compressed limit; reduce the number or size of targets`,
            undefined,
            { code: CliError.Code.ConfigError }
        );
    }
    getBoundedGzipSize({
        buffer: first.specsTarGzBuffer,
        maxBytes: MAX_SOURCE_DECOMPRESSED_BYTES,
        label: "source archive",
        context: first.context
    });
    let totalPayloadBytes = 0;
    for (const [index, participant] of participants.entries()) {
        totalPayloadBytes +=
            participant.payload.payloadKind === "fern-runtime-bundle"
                ? getBoundedGzipSize({
                      buffer: participant.payload.body,
                      maxBytes: MAX_RUNTIME_BUNDLE_DECOMPRESSED_BYTES,
                      label: payloadLabel(participant, index),
                      context: first.context
                  })
                : participant.payload.body.length;
        if (totalPayloadBytes > MAX_TOTAL_PAYLOAD_BYTES) {
            first.context.failAndThrow(
                `sdk-gen-api target payloads total ${formatMiB(totalPayloadBytes)}, exceeding the 100 MiB decoded limit; reduce the number or size of targets`,
                undefined,
                { code: CliError.Code.ConfigError }
            );
        }
    }
}

function payloadLabel(participant: FernSdkGenApiBuildParameters | undefined, index: number): string {
    const kind = participant?.payload.payloadKind ?? "target payload";
    return `${kind} ${participant?.targetIdSeed ?? index.toString()}`;
}

function getBoundedGzipSize({
    buffer,
    maxBytes,
    label,
    context
}: {
    buffer: Buffer;
    maxBytes: number;
    label: string;
    context: InteractiveTaskContext;
}): number {
    let decompressed: Buffer;
    try {
        decompressed = gunzipSync(buffer, { maxOutputLength: maxBytes + 1 });
    } catch (error) {
        if (isMaxOutputLengthError(error)) {
            return context.failAndThrow(
                `sdk-gen-api ${label} exceeds the ${formatMiB(maxBytes)} decompressed limit`,
                undefined,
                { code: CliError.Code.ConfigError }
            );
        }
        return context.failAndThrow(`sdk-gen-api ${label} is malformed gzip; regenerate it and retry`, error, {
            code: CliError.Code.ConfigError
        });
    }
    if (decompressed.length > maxBytes) {
        return context.failAndThrow(
            `sdk-gen-api ${label} is ${formatMiB(decompressed.length)} decompressed, exceeding the ${formatMiB(maxBytes)} decompressed limit`,
            undefined,
            { code: CliError.Code.ConfigError }
        );
    }
    return decompressed.length;
}

function isMaxOutputLengthError(error: unknown): boolean {
    return error instanceof Error && "code" in error && error.code === "ERR_BUFFER_TOO_LARGE";
}

function formatMiB(bytes: number): string {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MiB`;
}

function formatKiB(bytes: number): string {
    return `${(bytes / 1024).toFixed(2)} KiB`;
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
        if (target.publication?.status === "failure") {
            return participant.context.failAndThrow(
                `sdk-gen-api publication failed (${target.publication.error.code}): ${target.publication.error.message}`,
                undefined,
                { code: CliError.Code.ContainerError }
            );
        }
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
    if (participant.absolutePathToPreview != null) {
        await downloadFilesForTask({
            s3PreSignedReadUrl: target.result.artifactUrl,
            absolutePathToLocalOutput: join(
                participant.absolutePathToPreview,
                RelativeFilePath.of(path.basename(participant.generatorInvocation.name))
            ),
            context: participant.context,
            skipFernignore: participant.skipFernignore
        });
    } else if (participant.absolutePathToLocalOutputArchive != null) {
        await downloadArchiveForTask({
            s3PreSignedReadUrl: target.result.artifactUrl,
            absolutePathToLocalOutput: participant.absolutePathToLocalOutputArchive,
            context: participant.context
        });
    } else if (participant.generatorInvocation.absolutePathToLocalOutput != null) {
        await downloadFilesForTask({
            s3PreSignedReadUrl: target.result.artifactUrl,
            absolutePathToLocalOutput: participant.generatorInvocation.absolutePathToLocalOutput,
            context: participant.context,
            skipFernignore: participant.skipFernignore
        });
    }
    const actualVersion = target.result.actualVersion ?? participant.sdkVersion;
    return {
        createdSnippets: false,
        snippetsS3PreSignedReadUrl: undefined,
        actualVersion,
        pullRequestUrl: undefined,
        noChangesDetected: undefined,
        publishTarget: mapFernSdkGenApiPublishTarget(target, actualVersion)
    };
}

function mapFernSdkGenApiPublishTarget(
    target: FernBuildStatus["targets"][number],
    version: string
): PublishTarget | undefined {
    if (target.publication?.status !== "success") {
        return undefined;
    }
    const registry = target.publication.publishTarget.type;
    const identifier = target.publication.publishTarget.identifier;
    const url = getSafePublicationUrl(identifier);
    switch (registry) {
        case "npm":
            return {
                registry,
                label: "npm",
                version,
                identifier,
                ...(url != null ? { url } : {})
            };
        case "pypi":
            return {
                registry,
                label: "PyPI",
                version,
                identifier,
                ...(url != null ? { url } : {})
            };
        case "crates":
            return {
                registry,
                label: "crates.io",
                version,
                identifier,
                ...(url != null ? { url } : {})
            };
        case "maven":
            return {
                registry,
                label: "Maven Central",
                version,
                identifier,
                ...(url != null ? { url } : {})
            };
        case "github":
        case "unsupported":
            return undefined;
    }
}

function getSafePublicationUrl(identifier: string): string | undefined {
    try {
        const url = new URL(identifier);
        return url.protocol === "https:" && url.username.length === 0 && url.password.length === 0
            ? identifier
            : undefined;
    } catch {
        return undefined;
    }
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
    sdkName,
    sdkVersion,
    apiVersion,
    specsTarGzBuffer,
    payload,
    requestedOutput
}: {
    apiName: string;
    organization: string;
    cliVersion: string | undefined;
    generatorInvocation: generatorsYml.GeneratorInvocation;
    sdkName?: string;
    sdkVersion: string;
    apiVersion?: string;
    specsTarGzBuffer: Buffer;
    payload: FernSdkGenApiPayload;
    requestedOutput?: FernSdkGenApiRequestedOutput;
}): FernSdkGenApiRequest {
    return createFernSdkGenApiBatchRequest({
        apiName,
        organization,
        cliVersion,
        specsTarGzBuffer,
        targets: [{ generatorInvocation, sdkName, sdkVersion, apiVersion, payload, requestedOutput }]
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
        sdkName?: string;
        sdkVersion: string;
        apiVersion?: string;
        targetIdSeed?: string;
        sourceSpecIndexes?: number[];
        audiences?: string[];
        payload: FernSdkGenApiPayload;
        requestedOutput?: FernSdkGenApiRequestedOutput;
    }>;
}): FernSdkGenApiRequest {
    if (targets.length === 0) {
        throw new Error("Cannot create an empty Fern sdk-gen-api request");
    }
    const apiInputs: FernSdkGenApiRequest["apiInputs"] = [];
    const apiInputIds = targets.map(({ targetIdSeed, sourceSpecIndexes }, index) => {
        if (sourceSpecIndexes == null) {
            if (!apiInputs.some((input) => input.id === "default")) {
                apiInputs.push({ id: "default", specIndexes: "all" });
            }
            return "default";
        }
        const id = `target-${targetIdSeed ?? index.toString()}`;
        apiInputs.push({ id, specIndexes: sourceSpecIndexes });
        return id;
    });
    const requestTargets = targets.map(
        (
            { generatorInvocation, sdkName, sdkVersion, apiVersion, targetIdSeed, audiences, payload, requestedOutput },
            index
        ) => {
            const language = getFernSdkGenApiLanguage(generatorInvocation.name);
            if (language == null) {
                throw new Error(`Unsupported Fern SDK generator: ${generatorInvocation.name}`);
            }
            const output = mapFernSdkGenApiOutput(generatorInvocation);
            // SDK Config is the package configuration authority. Legacy output-derived package
            // identity must not overwrite a customer-edited SDK Config document.
            const packageConfig = payload.payloadKind === "fern-runtime-bundle" ? output.package : payload.package;
            const targetId = createHash("sha256")
                .update(
                    `${apiName}:${generatorInvocation.name}:${generatorInvocation.version}:${targetIdSeed ?? index.toString()}`
                )
                .digest("hex")
                .slice(0, 20);
            return {
                targetId,
                apiInputId: apiInputIds[index] ?? "default",
                language,
                sdk: {
                    name: sdkName ?? apiName,
                    version: sdkVersion,
                    ...(apiVersion != null ? { apiVersion } : {})
                },
                fernGenerator: {
                    id: generatorInvocation.name,
                    version: generatorInvocation.version
                },
                payloadKind: payload.payloadKind,
                ...(packageConfig != null ? { package: packageConfig } : {}),
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
                requestedOutput: requestedOutput ?? output.requestedOutput
            };
        }
    );
    const payloadHashes = targets.map((target) => createHash("sha256").update(target.payload.body).digest("hex"));
    const stableRequestIdentity = JSON.stringify({
        protocolVersion: 2,
        organization,
        apiName,
        apiInputs,
        targets: requestTargets,
        payloadHashes,
        sourceHash: createHash("sha256").update(specsTarGzBuffer).digest("hex")
    });
    const credentialSetId = requestTargets.some((target) => target.requestedOutput.type === "publish")
        ? deterministicUuid(stableRequestIdentity)
        : undefined;
    const idempotencyKey = createHash("sha256")
        .update(specsTarGzBuffer)
        .update(
            JSON.stringify({
                protocolVersion: 2,
                organization,
                apiName,
                credentialSetId,
                apiInputs,
                targets: requestTargets,
                payloadHashes
            })
        )
        .digest("hex");

    return {
        protocolVersion: 2,
        apiName,
        ...(cliVersion ? { cliVersion } : {}),
        idempotencyKey,
        ...(credentialSetId != null ? { credentialSetId } : {}),
        apiInputs,
        targets: requestTargets
    };
}

function deterministicUuid(value: string): string {
    const bytes = createHash("sha256").update(value).digest().subarray(0, 16);
    bytes[6] = ((bytes[6] ?? 0) & 0x0f) | 0x80;
    bytes[8] = ((bytes[8] ?? 0) & 0x3f) | 0x80;
    const hex = bytes.toString("hex");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
