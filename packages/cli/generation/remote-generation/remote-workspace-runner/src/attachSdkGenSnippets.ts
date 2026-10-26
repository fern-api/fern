import { errorMessageOrString, nonEmpty } from "@fern-api/core-utils";
import type { APIV1Write } from "@fern-api/fdr-sdk";
import type { Logger } from "@fern-api/logger";
import { targetLanguageSchema } from "@postman/sdk-config";

import { getFernSdkGenApiOrigin } from "./fernSdkGenApi.js";
import { findSdkGenSnippetsUrls, type SdkGenSnippetsQuery } from "./findSdkGenSnippets.js";
import { downloadSnippetsJson, isSdkGenSnippetsEnabled, parseSdkSnippetsJson } from "./sdkGenSnippets.js";

type ApiDefinition = APIV1Write.ApiDefinition;
type Endpoint = APIV1Write.EndpointDefinition;
type CodeSample = APIV1Write.CustomCodeSample;
type SnippetsConfig = APIV1Write.SnippetsConfig;

/** The code of one SDK's snippets, by endpoint, keyed like `GET /pet/{petId}`. */
type CodeByEndpoint = ReadonlyMap<string, string>;

/** The targets sdk-gen builds that are not SDKs, so docs.yml `snippets:` has no entry for them. */
const NON_SDK_LANGUAGES = ["cli", "mcp", "terraform"];
const SDK_LANGUAGES = new Set<string>(targetLanguageSchema.options);
for (const language of NON_SDK_LANGUAGES) {
    SDK_LANGUAGES.delete(language);
}

/** The SDK of one language, at one version, that the docs ask for. */
interface SdkRequest {
    type: string;
    version: string;
}

/** The SDKs whose snippets to look up: the docs.yml `snippets:` entry of each SDK language, when it names a version. */
export function getSdkRequests(config: SnippetsConfig): SdkRequest[] {
    const entries: Record<string, { version?: string | null } | null | undefined> = config;
    return [...SDK_LANGUAGES].flatMap((type) => {
        const version = nonEmpty(entries[`${type}Sdk`]?.version);
        return version == null ? [] : [{ type, version }];
    });
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
        isEnabled = isSdkGenSnippetsEnabled
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
