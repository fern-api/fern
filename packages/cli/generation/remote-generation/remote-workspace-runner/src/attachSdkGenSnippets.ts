import { createFdrService } from "@fern-api/core";
import { assertNever, isPlainObject, nonEmpty } from "@fern-api/core-utils";
import type { APIV1Write, FdrClient } from "@fern-api/fdr-sdk";
import type { SdkRequest } from "@fern-api/fdr-sdk/orpc-client";
import type { Logger } from "@fern-api/logger";

import { normalizeGoPackageForLookup } from "./normalizeRepoUrl.js";
import { isUploadSdkGenSnippetsEnabled } from "./uploadSdkGenSnippets.js";

type ApiDefinition = APIV1Write.ApiDefinition;
type Endpoint = APIV1Write.EndpointDefinition;
type CodeSample = APIV1Write.CustomCodeSample;
type SnippetsConfig = APIV1Write.SnippetsConfig;

/** The code of one SDK's snippets, by endpoint, keyed like `GET /pet/{petId}`. */
type CodeByEndpoint = ReadonlyMap<string, string>;

/** The languages FDR's snippet store holds. */
const SDK_LANGUAGES = ["typescript", "python", "java", "go", "ruby", "csharp"] as const;
type SdkLanguage = (typeof SDK_LANGUAGES)[number];

/** The lookup for the docs.yml `snippets:` entry of a language, if the entry exists. */
function toSdkRequest(language: SdkLanguage, config: SnippetsConfig): SdkRequest | null | undefined {
    switch (language) {
        case "typescript":
        case "python":
        case "csharp": {
            const sdk = config[`${language}Sdk` as const];
            return sdk && { type: language, package: sdk.package, version: nonEmpty(sdk.version) };
        }
        case "ruby": {
            const sdk = config.rubySdk;
            return sdk && { type: language, gem: sdk.gem, version: nonEmpty(sdk.version) };
        }
        case "go": {
            const sdk = config.goSdk;
            const githubRepo = normalizeGoPackageForLookup(sdk?.githubRepo ?? "");
            return sdk && { type: language, githubRepo, version: nonEmpty(sdk.version) };
        }
        case "java": {
            const sdk = config.javaSdk;
            const [group = "", artifact = ""] = sdk?.coordinate.split(":") ?? [];
            return sdk && { type: language, group, artifact, version: nonEmpty(sdk.version) };
        }
        default:
            assertNever(language);
    }
}

/** The store is keyed by package and version, so an entry without a version names no SDK. */
const hasVersion = (request: SdkRequest | null | undefined): request is SdkRequest => request?.version != null;

/** The SDKs to look up in FDR's snippet store, one per docs.yml `snippets:` entry. */
export function getSdkRequests(config: SnippetsConfig): SdkRequest[] {
    return SDK_LANGUAGES.map((language) => toSdkRequest(language, config)).filter(hasVersion);
}

/** Python and Java store a sync and an async client, and sdk-gen writes the same code for both. */
function getCodeField(language: string): string {
    return language === "python" || language === "java" ? "sync_client" : "client";
}

function getFirstCode(snippets: unknown[] = [], codeField: string): string | undefined {
    return snippets
        .map((snippet) => (isPlainObject(snippet) ? snippet[codeField] : undefined))
        .find((code): code is string => typeof code === "string" && nonEmpty(code) != null);
}

/** FDR returns snippets by path, then HTTP method, untyped. This is the one place that reads that shape. */
function toCodeByEndpoint(
    snippets: Record<string, Partial<Record<string, unknown[]>>>,
    codeField: string
): CodeByEndpoint {
    const snippetsByEndpoint = Object.entries(snippets).flatMap(([path, snippetsByMethod]) =>
        Object.entries(snippetsByMethod).map(([method, list]) => [`${method} ${path}`, list] as const)
    );
    return new Map(
        snippetsByEndpoint.flatMap(([endpoint, list]) => {
            const code = getFirstCode(list, codeField);
            return code == null ? [] : [[endpoint, code] as const];
        })
    );
}

/** The snippets of one SDK, or nothing when FDR cannot be read: a snippet problem must not fail the docs publish. */
async function loadCodeByEndpoint({
    fdr,
    organization,
    request,
    logger
}: {
    fdr: Pick<FdrClient, "snippets">;
    organization: string;
    request: SdkRequest;
    logger: Pick<Logger, "warn">;
}): Promise<CodeByEndpoint> {
    try {
        // Leaving out the API id makes FDR pick the organization's only API with stored snippets.
        const response = await fdr.snippets.load({ orgId: organization, sdks: [request] });
        if (response.next != null) {
            logger.warn(`FDR has more ${request.type} snippets than the first page; the rest are not added`);
        }
        return toCodeByEndpoint(response.snippets, getCodeField(request.type));
    } catch (error) {
        logger.warn(`Could not read ${request.type} snippets from FDR (the docs are not affected): ${error}`);
        return new Map();
    }
}

const toPathSegment = (part: Endpoint["path"]["parts"][number]): string =>
    part.type === "literal" ? part.value : `{${part.value}}`;

function getEndpointKey({ method, path }: Endpoint): string {
    return `${method} ${path.parts.map(toPathSegment).join("")}`;
}

/** Appends the samples whose language the existing ones lack, so a sample the customer wrote wins. */
function mergeSamples(existing: CodeSample[] = [], samples: CodeSample[]): CodeSample[] {
    return [...existing, ...samples.filter((sample) => !existing.some(({ language }) => language === sample.language))];
}

function addCodeSamples(endpoint: Endpoint, codeByLanguage: ReadonlyMap<string, CodeByEndpoint>): Endpoint {
    const key = getEndpointKey(endpoint);
    const samples = [...codeByLanguage].flatMap(([language, codeByEndpoint]) => {
        const code = codeByEndpoint.get(key);
        return code == null ? [] : [{ language, code }];
    });
    if (samples.length === 0) {
        return endpoint;
    }
    const examples = endpoint.examples.map((example) => ({
        ...example,
        codeSamples: mergeSamples(example.codeSamples ?? undefined, samples)
    }));
    return { ...endpoint, examples };
}

function mapEndpoints(apiDefinition: ApiDefinition, update: (endpoint: Endpoint) => Endpoint): ApiDefinition {
    const updatePackage = <T extends { endpoints: Endpoint[] }>(apiPackage: T): T => ({
        ...apiPackage,
        endpoints: apiPackage.endpoints.map(update)
    });
    const subpackages = Object.entries(apiDefinition.subpackages).map(([id, subpackage]) => [
        id,
        updatePackage(subpackage)
    ]);
    return {
        ...apiDefinition,
        rootPackage: updatePackage(apiDefinition.rootPackage),
        subpackages: Object.fromEntries(subpackages)
    };
}

export interface AttachSdkGenSnippetsDependencies {
    createFdr?: (token: string) => Pick<FdrClient, "snippets">;
    isEnabled?: () => boolean;
}

/**
 * Reads the snippets that `fern generate` stored in FDR for the SDKs the docs.yml `snippets:` entries name, and adds
 * them to the API definition as code samples. Does nothing unless FERN_UPLOAD_SDK_GEN_SNIPPETS is `true`.
 */
export async function attachSdkGenSnippets(
    {
        token,
        organization,
        apiDefinition,
        snippetsConfig,
        logger
    }: {
        token: string;
        organization: string;
        apiDefinition: ApiDefinition;
        snippetsConfig: SnippetsConfig;
        logger: Pick<Logger, "info" | "warn">;
    },
    {
        createFdr = (value) => createFdrService({ token: value }),
        isEnabled = isUploadSdkGenSnippetsEnabled
    }: AttachSdkGenSnippetsDependencies = {}
): Promise<ApiDefinition> {
    const requests = getSdkRequests(snippetsConfig);
    if (!isEnabled() || requests.length === 0) {
        return apiDefinition;
    }
    const fdr = createFdr(token);
    const codeByLanguage = new Map(
        await Promise.all(
            requests.map(async (request) => {
                const codeByEndpoint = await loadCodeByEndpoint({ fdr, organization, request, logger });
                return [request.type, codeByEndpoint] as const;
            })
        )
    );
    const counts = [...codeByLanguage].map(([language, codeByEndpoint]) => `${language}: ${codeByEndpoint.size}`);
    logger.info(`Loaded SDK snippets from FDR (${counts.join(", ")})`);
    return mapEndpoints(apiDefinition, (endpoint) => addCodeSamples(endpoint, codeByLanguage));
}
