import { FernToken } from "@fern-api/auth";
import { askToLogin } from "@fern-api/login";
import { getFernSdkGenApiLanguage, getFernSdkGenApiOrigin } from "@fern-api/remote-workspace-runner";
import { isVersionAhead, parseVersion } from "@fern-api/semver-utils";
import { CliError, TaskContext } from "@fern-api/task-context";
import semver from "semver";

import { CliContext } from "../../cli-context/CliContext.js";

interface GeneratorVersions {
    compatibleVersion?: string;
    withheldMajorVersion?: string;
}

interface DiscoveryResult extends GeneratorVersions {
    targetId: string;
    state: "RESOLVED";
}

interface UnavailableResult {
    targetId: string;
    state: "UNAVAILABLE";
    reason: "IDENTITY_UNAVAILABLE" | "LANGUAGE_MISMATCH" | "VERSION_UNAVAILABLE";
}

export type GeneratorVersionComparison = -1 | 0 | 1;
export type GetSdkGenApiToken = () => Promise<FernToken>;

export function createSdkGenApiTokenProvider(cliContext: CliContext): GetSdkGenApiToken {
    let token: Promise<FernToken> | undefined;
    return () => {
        token ??= cliContext.runTask((context) => askToLogin(context));
        return token;
    };
}

export function compareGeneratorVersions({
    generatorId,
    candidateVersion,
    currentVersion
}: {
    generatorId: string;
    candidateVersion: string;
    currentVersion: string;
}): GeneratorVersionComparison {
    if (!isValidGeneratorVersion(candidateVersion) || !isValidGeneratorVersion(currentVersion)) {
        throw new CliError({
            message:
                `Cannot compare versions for generator "${generatorId}": configured version ` +
                `"${currentVersion}", candidate version "${candidateVersion}". ` +
                "Use valid semantic versions such as 1.2.3.",
            code: CliError.Code.VersionError
        });
    }
    try {
        if (candidateVersion === currentVersion) {
            return 0;
        }
        if (isVersionAhead(candidateVersion, currentVersion)) {
            return 1;
        }
        return isVersionAhead(currentVersion, candidateVersion) ? -1 : 0;
    } catch {
        const candidateSemver = semver.valid(candidateVersion);
        const currentSemver = semver.valid(currentVersion);
        if (candidateSemver != null && currentSemver != null) {
            return Math.sign(semver.compare(candidateSemver, currentSemver)) as GeneratorVersionComparison;
        }
        throw new CliError({
            message:
                `Cannot compare versions for generator "${generatorId}": configured version ` +
                `"${currentVersion}", candidate version "${candidateVersion}". ` +
                "Use valid semantic versions such as 1.2.3.",
            code: CliError.Code.VersionError
        });
    }
}

function isValidGeneratorVersion(version: string): boolean {
    if (version === "latest" || semver.valid(version) != null) {
        return true;
    }
    try {
        parseVersion(version);
        return true;
    } catch {
        return false;
    }
}

export async function getSdkGenApiGeneratorVersions({
    generatorId,
    currentVersion,
    includeMajor,
    channel,
    organization,
    getToken,
    context
}: {
    generatorId: string;
    currentVersion: string;
    includeMajor: boolean;
    channel?: string;
    organization: string;
    getToken: GetSdkGenApiToken;
    context: TaskContext;
}): Promise<GeneratorVersions> {
    if (channel != null) {
        throw new Error(
            `SDK Gen API generator version discovery does not support the requested upgrade channel "${channel}". ` +
                "Remove --channel to use executable index versions, or disable FERN_USE_SDK_GEN_API to use FDR channel metadata."
        );
    }
    const origin = getFernSdkGenApiOrigin();
    if (origin == null) {
        throw new Error("FERN_SDK_GEN_API_ORIGIN is required when FERN_USE_SDK_GEN_API=true");
    }
    const language = getFernSdkGenApiLanguage(generatorId);
    if (language == null) {
        context.logger.error(
            `SDK Gen API cannot discover versions for unsupported generator ${generatorId}. ` +
                "Use a canonical first-party SDK generator name or disable FERN_USE_SDK_GEN_API."
        );
        return {};
    }
    const token = await getToken();

    const endpoint = new URL("v1/fern/generator-versions/discover", `${origin.replace(/\/+$/, "")}/`);
    let response: Response;
    try {
        response = await fetch(endpoint, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token.value}`,
                "X-Fern-Organization-Id": organization,
                "content-type": "application/json"
            },
            body: JSON.stringify({
                targets: [
                    {
                        targetId: "generator",
                        generatorId,
                        language,
                        currentVersion,
                        includeMajor
                    }
                ]
            })
        });
    } catch (error) {
        throw new Error(
            `SDK Gen API version discovery failed for ${generatorId}@${currentVersion} because the API could not be reached. ` +
                "Verify FERN_SDK_GEN_API_ORIGIN and the selected environment.",
            { cause: error }
        );
    }
    if (!response.ok) {
        throw new Error(
            `SDK Gen API version discovery failed for ${generatorId}@${currentVersion} ` +
                `with HTTP ${response.status}. Verify FERN_SDK_GEN_API_ORIGIN and the selected environment.`
        );
    }

    const body: unknown = await response.json();
    const result = parseDiscoveryResult(body);
    if (result.state === "UNAVAILABLE") {
        context.logger.error(
            `SDK Gen API cannot resolve an executable version for ${generatorId}@${currentVersion} ` +
                `(${result.reason}). Publish the coordinate to this environment or choose a supported generator version.`
        );
        return {};
    }
    return {
        compatibleVersion: result.compatibleVersion,
        withheldMajorVersion: result.withheldMajorVersion
    };
}

function parseDiscoveryResult(body: unknown): DiscoveryResult | UnavailableResult {
    if (!hasExactKeys(body, ["targets"]) || !Array.isArray(body.targets) || body.targets.length !== 1) {
        throw new Error("SDK Gen API returned an invalid generator version discovery response");
    }
    const result: unknown = body.targets[0];
    if (!isRecord(result) || result.targetId !== "generator") {
        throw new Error("SDK Gen API returned an invalid generator version discovery target");
    }
    if (result.state === "UNAVAILABLE") {
        if (
            !hasExactKeys(result, ["targetId", "state", "reason"]) ||
            (result.reason !== "IDENTITY_UNAVAILABLE" &&
                result.reason !== "LANGUAGE_MISMATCH" &&
                result.reason !== "VERSION_UNAVAILABLE")
        ) {
            throw new Error("SDK Gen API returned an invalid unavailable generator version result");
        }
        return {
            targetId: "generator",
            state: "UNAVAILABLE",
            reason: result.reason
        };
    }
    if (result.state !== "RESOLVED") {
        throw new Error("SDK Gen API returned an unknown generator version discovery state");
    }
    if (!hasOnlyKeys(result, ["targetId", "state", "compatibleVersion", "withheldMajorVersion"])) {
        throw new Error("SDK Gen API returned an invalid resolved generator version result");
    }
    const compatibleVersion = optionalExactSemver(result, "compatibleVersion");
    const withheldMajorVersion = optionalExactSemver(result, "withheldMajorVersion");
    if (compatibleVersion == null && withheldMajorVersion == null) {
        throw new Error("SDK Gen API returned an empty generator version discovery result");
    }
    return {
        targetId: "generator",
        state: "RESOLVED",
        ...(compatibleVersion == null ? {} : { compatibleVersion }),
        ...(withheldMajorVersion == null ? {} : { withheldMajorVersion })
    };
}

function optionalExactSemver(value: Record<string, unknown>, key: string): string | undefined {
    if (!Object.hasOwn(value, key)) {
        return undefined;
    }
    const version = value[key];
    if (typeof version !== "string" || semver.valid(version) !== version) {
        throw new CliError({
            message:
                `SDK Gen API returned invalid ${key} ${JSON.stringify(version)}. ` +
                "Expected an exact semantic version such as 1.2.3.",
            code: CliError.Code.VersionError
        });
    }
    return version;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value != null && !Array.isArray(value);
}

function hasExactKeys(value: unknown, keys: string[]): value is Record<string, unknown> {
    return isRecord(value) && Object.keys(value).length === keys.length && hasOnlyKeys(value, keys);
}

function hasOnlyKeys(value: Record<string, unknown>, keys: string[]): boolean {
    const allowed = new Set(keys);
    return Object.keys(value).every((key) => allowed.has(key));
}
