import { errorMessageOrString, nonEmpty } from "@fern-api/core-utils";
import type { APIV1Write } from "@fern-api/fdr-sdk";
import type { Logger } from "@fern-api/logger";
import { targetLanguageSchema } from "@postman/sdk-config";
import { omit } from "lodash-es";

import { getFernSdkGenApiOrigin } from "./fernSdkGenApi.js";
import { findSdkGenSnippetsUrls, type SdkGenSnippetsQuery } from "./findSdkGenSnippets.js";
import { downloadSnippetsJson, parseSdkSnippetsJson } from "./sdkGenSnippets.js";

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

/** One warning per SDK the docs ask for, naming it, for when reading its snippets failed in a way no lookup handled. */
export function describeSdkSnippetsReadFailures({
    snippetsConfig,
    sdkNames = {},
    error
}: {
    snippetsConfig: SnippetsConfig;
    sdkNames?: Record<string, string[]>;
    error: unknown;
}): string[] {
    const reason = errorMessageOrString(error);
    const requests = getSdkRequests(snippetsConfig);
    if (requests.length === 0) {
        return [`Failed to read sdk snippets, error: ${reason}`];
    }
    return requests.map(({ type, version }) => {
        const names = sdkNames[type] ?? [];
        const sdkName = names.length > 0 ? names.join(", ") : "unknown";
        return `Failed to read sdk snippets for sdk: ${sdkName}, language: ${type}, version: ${version}, error: ${reason}`;
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

/** The code of every language whose snippets were read from sdk-gen, by language. */
export type SdkGenSnippets = ReadonlyMap<string, CodeByEndpoint>;

/**
 * The snippets config without the SDKs of these languages. FDR looks up each SDK `snippetsConfiguration` names in its
 * own snippet store, which holds no sdk-gen SDK, and fails the registration when it finds none; and a language
 * left in the config gets a dynamic IR built for it. The languages sdk-gen serves need neither.
 */
export function omitSdkLanguages(config: SnippetsConfig, languages: Iterable<string>): SnippetsConfig {
    return omit(config, ...[...languages].map((language) => `${language}Sdk`));
}

/** One line saying where the snippets of each language come from, for the publish log. */
export function describeSnippetSources({
    sdkGenLanguages,
    dynamicIrLanguages
}: {
    sdkGenLanguages: Iterable<string>;
    dynamicIrLanguages: Iterable<string>;
}): string | undefined {
    const sources = [
        ...[...sdkGenLanguages].map((language) => `${language}: sdk-gen`),
        ...[...dynamicIrLanguages].map((language) => `${language}: Fern dynamic IR`)
    ];
    return sources.length === 0 ? undefined : `SDK snippet sources (${sources.join(", ")})`;
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

/** The sdk-gen-api origin, or `undefined` (after a warning) when it is not set or not usable. */
function readOrigin(getOrigin: () => string | undefined, logger: Pick<Logger, "warn">): string | undefined {
    try {
        const origin = getOrigin();
        if (origin == null) {
            logger.warn(
                "FERN_SDK_GEN_API_ORIGIN is not set, so the SDK snippets cannot be read (the docs are not affected)"
            );
        }
        return origin;
    } catch (error) {
        logger.warn(
            `The sdk-gen-api origin is not usable, so the SDK snippets cannot be read (the docs are not affected): ${errorMessageOrString(error)}`
        );
        return undefined;
    }
}

/**
 * Reads the snippets sdk-gen saved with the builds of the SDKs the docs.yml `snippets:` entries name, found through the
 * sdk-gen-api. A language with no snippets is left out of the result, so the docs fall back to Fern's dynamic IR for it.
 * A snippet problem must not fail the docs publish, so a failure only logs a warning.
 */
export async function readSdkGenSnippets(
    {
        token,
        organization,
        snippetsConfig,
        sdkNames = {},
        logger
    }: {
        token: string;
        organization: string;
        snippetsConfig: SnippetsConfig;
        /** The sdkNames of each language's SDK in the sdk-config.yml; a language without one has no snippets to read. */
        sdkNames?: Record<string, string[]>;
        logger: Pick<Logger, "debug" | "info" | "warn">;
    },
    {
        getOrigin = getFernSdkGenApiOrigin,
        findSnippetsUrls = (query) => findSdkGenSnippetsUrls(query),
        readSnippets = downloadSnippetsJson
    }: AttachSdkGenSnippetsDependencies = {}
): Promise<SdkGenSnippets> {
    const requests = getSdkRequests(snippetsConfig);
    if (requests.length === 0) {
        return new Map();
    }
    const origin = readOrigin(getOrigin, logger);
    if (origin == null) {
        return new Map();
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
    const loaded = new Map([...codeByLanguage].filter(([, codeByEndpoint]) => codeByEndpoint.size > 0));
    if (loaded.size > 0) {
        const counts = [...loaded].map(([language, codeByEndpoint]) => `${language}: ${codeByEndpoint.size}`);
        logger.info(`Loaded SDK snippets (${counts.join(", ")})`);
    }
    return loaded;
}

/**
 * Adds the snippets read from sdk-gen to the API definition as code samples, and drops those languages from its
 * `snippetsConfiguration` (see {@link omitSdkLanguages}).
 */
export function attachSdkGenSnippets(apiDefinition: ApiDefinition, snippets: SdkGenSnippets): ApiDefinition {
    if (snippets.size === 0) {
        return apiDefinition;
    }
    const { snippetsConfiguration } = apiDefinition;
    return {
        ...mapEndpoints(apiDefinition, (endpoint) => addCodeSamples(endpoint, snippets)),
        snippetsConfiguration:
            snippetsConfiguration == null ? undefined : omitSdkLanguages(snippetsConfiguration, snippets.keys())
    };
}
