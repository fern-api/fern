import { FernToken } from "@fern-api/auth";
import semver from "semver";

export interface SdkGenApiGeneratorVersions {
    compatibleVersion?: string;
    withheldMajorVersion?: string;
}

interface DiscoveryResult extends SdkGenApiGeneratorVersions {
    targetId: string;
    state: "RESOLVED";
}

interface UnavailableResult {
    targetId: string;
    state: "UNAVAILABLE";
    reason: "IDENTITY_UNAVAILABLE" | "LANGUAGE_MISMATCH" | "VERSION_UNAVAILABLE";
}

const latestDiscoveryRequests = new Map<string, Promise<DiscoveryResult | UnavailableResult>>();

export async function discoverLatestSdkGenApiGeneratorVersions({
    origin,
    organization,
    token,
    generatorId,
    language
}: {
    origin: string;
    organization: string;
    token: FernToken;
    generatorId: string;
    language: string;
}): Promise<DiscoveryResult | UnavailableResult> {
    const key = JSON.stringify([origin, organization, generatorId, language]);
    const inFlight = latestDiscoveryRequests.get(key);
    if (inFlight != null) {
        return inFlight;
    }
    const request = discoverSdkGenApiGeneratorVersions({
        origin,
        organization,
        token,
        generatorId,
        language,
        includeMajor: true
    });
    latestDiscoveryRequests.set(key, request);
    try {
        return await request;
    } finally {
        if (latestDiscoveryRequests.get(key) === request) {
            latestDiscoveryRequests.delete(key);
        }
    }
}

export async function discoverSdkGenApiGeneratorVersions({
    origin,
    organization,
    token,
    generatorId,
    language,
    currentVersion,
    includeMajor
}: {
    origin: string;
    organization: string;
    token: FernToken;
    generatorId: string;
    language: string;
    currentVersion?: string;
    includeMajor: boolean;
}): Promise<DiscoveryResult | UnavailableResult> {
    const endpoint = new URL("v1/fern/generator-versions/discover", `${origin.replace(/\/+$/, "")}/`);
    const versionLabel = currentVersion == null ? generatorId : `${generatorId}@${currentVersion}`;
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
                        ...(currentVersion == null ? {} : { currentVersion }),
                        includeMajor
                    }
                ]
            })
        });
    } catch (error) {
        throw new Error(
            `SDK Gen API version discovery failed for ${versionLabel} because the API could not be reached. ` +
                "Verify FERN_SDK_GEN_API_ORIGIN and the selected environment.",
            { cause: error }
        );
    }
    if (!response.ok) {
        throw new Error(
            `SDK Gen API version discovery failed for ${versionLabel} ` +
                `with HTTP ${response.status}. Verify FERN_SDK_GEN_API_ORIGIN and the selected environment.`
        );
    }

    return parseDiscoveryResult(await response.json());
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
        throw new Error(
            `SDK Gen API returned invalid ${key} ${JSON.stringify(version)}. ` +
                "Expected an exact semantic version such as 1.2.3."
        );
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
