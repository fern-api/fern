import { assertNever, errorMessageOrString, nonEmpty } from "@fern-api/core-utils";
import type { APIV1Write } from "@fern-api/fdr-sdk";
import type { SdkRequest } from "@fern-api/fdr-sdk/orpc-client";
import type { Logger } from "@fern-api/logger";

import { getFernSdkGenApiOrigin } from "./fernSdkGenApi.js";
import { findSdkGenSnippetsUrls, type SdkGenSnippetsQuery } from "./findSdkGenSnippets.js";
import { normalizeGoPackageForLookup } from "./normalizeRepoUrl.js";
import { downloadSnippetsJson, isUploadSdkGenSnippetsEnabled, parseSdkSnippetsJson } from "./uploadSdkGenSnippets.js";

type ApiDefinition = APIV1Write.ApiDefinition;
type Endpoint = APIV1Write.EndpointDefinition;
type CodeSample = APIV1Write.CustomCodeSample;
type SnippetsConfig = APIV1Write.SnippetsConfig;

/** The code of one SDK's snippets, by endpoint, keyed like `GET /pet/{petId}`. */
type CodeByEndpoint = ReadonlyMap<string, string>;

/** The languages FDR's snippet store holds. */
const SDK_LANGUAGES = ["typescript", "python", "java", "go", "ruby", "csharp"] as const;
type SdkLanguage = (typeof SDK_LANGUAGES)[number];

/** The lookup for the docs.yml `snippets:` entry of a language, if the entry exists and names a package. */
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
            const githubRepo = nonEmpty(normalizeGoPackageForLookup(sdk?.githubRepo ?? ""));
            return sdk == null || githubRepo == null
                ? undefined
                : { type: language, githubRepo, version: nonEmpty(sdk.version) };
        }
        case "java": {
            const sdk = config.javaSdk;
            const [group, artifact] = sdk?.coordinate.split(":").map(nonEmpty) ?? [];
            return sdk == null || group == null || artifact == null
                ? undefined
                : { type: language, group, artifact, version: nonEmpty(sdk.version) };
        }
        default:
            assertNever(language);
    }
}

/** The store is keyed by package and version, so an entry without a version names no SDK. */
const hasVersion = (request: SdkRequest | null | undefined): request is SdkRequest => request?.version != null;

/** The SDKs whose snippets to look up, one per docs.yml `snippets:` entry. */
export function getSdkRequests(config: SnippetsConfig): SdkRequest[] {
    return SDK_LANGUAGES.map((language) => toSdkRequest(language, config)).filter(hasVersion);
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
    getOrigin?: () => string | undefined;
    findSnippetsUrls?: (query: SdkGenSnippetsQuery) => Promise<Map<string, string>>;
    readSnippets?: (snippetsUrl: string) => Promise<string>;
    isEnabled?: () => boolean;
}

/** One sdk-gen-api lookup: the languages of an SDK name and version whose snippets the docs ask for. */
interface SnippetsLookup {
    sdkName: string;
    version: string;
    languages: string[];
}

const getLookupKey = (sdkName: string, version: string): string => `${sdkName}\n${version}`;

/** One lookup per sdkName and version, so an SDK's languages are found with a single request. */
function getLookups(requests: SdkRequest[], sdkNames: Record<string, string[]>): Map<string, SnippetsLookup> {
    const lookups = new Map<string, SnippetsLookup>();
    for (const { type, version } of requests) {
        if (version == null) {
            continue;
        }
        for (const sdkName of sdkNames[type] ?? []) {
            const key = getLookupKey(sdkName, version);
            const lookup = lookups.get(key) ?? { sdkName, version, languages: [] };
            lookups.set(key, { ...lookup, languages: [...lookup.languages, type] });
        }
    }
    return lookups;
}

/**
 * Reads the snippets sdk-gen saved with the builds of the SDKs the docs.yml `snippets:` entries name, found through the
 * sdk-gen-api, and adds them to the API definition as code samples. Does nothing unless FERN_UPLOAD_SDK_GEN_SNIPPETS is
 * `true`. A snippet problem must not fail the docs publish, so a failure only logs a warning.
 */
export async function attachSdkGenSnippets(
    {
        token,
        organization,
        apiDefinition,
        snippetsConfig,
        sdkNames = {},
        logger
    }: {
        token: string;
        organization: string;
        apiDefinition: ApiDefinition;
        snippetsConfig: SnippetsConfig;
        /** The sdkNames of each language's SDK in the sdk-config.yml; a language without one has no snippets to read. */
        sdkNames?: Record<string, string[]>;
        logger: Pick<Logger, "debug" | "info" | "warn">;
    },
    {
        getOrigin = getFernSdkGenApiOrigin,
        findSnippetsUrls = (query) => findSdkGenSnippetsUrls(query),
        readSnippets = downloadSnippetsJson,
        isEnabled = isUploadSdkGenSnippetsEnabled
    }: AttachSdkGenSnippetsDependencies = {}
): Promise<ApiDefinition> {
    const requests = getSdkRequests(snippetsConfig);
    if (!isEnabled() || requests.length === 0) {
        return apiDefinition;
    }
    const origin = getOrigin();
    if (origin == null) {
        logger.warn(
            "FERN_SDK_GEN_API_ORIGIN is not set, so the SDK snippets cannot be read (the docs are not affected)"
        );
        return apiDefinition;
    }

    const urlsByLookup = new Map(
        await Promise.all(
            [...getLookups(requests, sdkNames)].map(async ([key, lookup]) => {
                try {
                    return [key, await findSnippetsUrls({ origin, token, organization, ...lookup })] as const;
                } catch (error) {
                    logger.warn(
                        `Could not find the snippets of SDK "${lookup.sdkName}" ${lookup.version} in the sdk-gen-api (the docs are not affected): ${errorMessageOrString(error)}`
                    );
                    return [key, new Map<string, string>()] as const;
                }
            })
        )
    );

    const codeByLanguage = new Map(
        await Promise.all(
            requests.map(async ({ type, version }) => {
                if (version == null) {
                    return [type, new Map<string, string>()] as const;
                }
                const names = sdkNames[type] ?? [];
                const snippetsUrl = names
                    .map((sdkName) => urlsByLookup.get(getLookupKey(sdkName, version))?.get(type))
                    .find((url): url is string => url != null);
                if (snippetsUrl == null) {
                    if (names.length > 0) {
                        logger.warn(
                            `No built ${type} SDK ${version} with snippets was found (the docs are not affected)`
                        );
                    }
                    return [type, new Map<string, string>()] as const;
                }
                try {
                    const endpoints = parseSdkSnippetsJson(await readSnippets(snippetsUrl));
                    return [
                        type,
                        new Map(endpoints.map(({ method, path, code }) => [`${method} ${path}`, code]))
                    ] as const;
                } catch (error) {
                    logger.warn(
                        `Could not read the ${type} snippets (the docs are not affected): ${errorMessageOrString(error)}`
                    );
                    return [type, new Map<string, string>()] as const;
                }
            })
        )
    );
    const counts = [...codeByLanguage].map(([language, codeByEndpoint]) => `${language}: ${codeByEndpoint.size}`);
    if ([...codeByLanguage.values()].some((codeByEndpoint) => codeByEndpoint.size > 0)) {
        logger.info(`Loaded SDK snippets (${counts.join(", ")})`);
    }
    return mapEndpoints(apiDefinition, (endpoint) => addCodeSamples(endpoint, codeByLanguage));
}
