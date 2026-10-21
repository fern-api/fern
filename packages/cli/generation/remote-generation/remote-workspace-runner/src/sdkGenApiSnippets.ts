import { FernToken } from "@fern-api/auth";
import { APIV1Write } from "@fern-api/fdr-sdk";
import { TaskContext } from "@fern-api/task-context";
import axios from "axios";

import { getFernSdkGenApiOrigin } from "./fernSdkGenApi";

const REQUEST_TIMEOUT_MS = 30_000;

const SNIPPET_LANGUAGE_BY_CONFIG_KEY: Record<string, string> = {
    typescriptSdk: "typescript",
    pythonSdk: "python",
    javaSdk: "java",
    goSdk: "go",
    rubySdk: "ruby",
    csharpSdk: "csharp",
    phpSdk: "php",
    swiftSdk: "swift",
    rustSdk: "rust",
    cliSdk: "cli"
};

interface SdkGenApiSnippets {
    version: number;
    language: string;
    endpoints: SdkGenApiEndpointSnippets[];
}

interface SdkGenApiEndpointSnippets {
    path: string;
    method: string;
    codeSamples: { language: string; code: string }[];
}

export function getSdkGenApiSnippetLanguages(snippetsConfig: APIV1Write.SnippetsConfig): string[] {
    const fromEnv = process.env.FERN_SDK_GEN_API_SNIPPET_LANGUAGES;
    if (fromEnv != null && fromEnv.trim().length > 0) {
        return fromEnv
            .split(",")
            .map((language) => language.trim())
            .filter((language) => language.length > 0);
    }
    return Object.entries(snippetsConfig)
        .filter(([key, value]) => value != null && SNIPPET_LANGUAGE_BY_CONFIG_KEY[key] != null)
        .map(([key]) => SNIPPET_LANGUAGE_BY_CONFIG_KEY[key] as string);
}

export async function fetchSdkGenApiSnippets({
    organization,
    token,
    languages,
    context
}: {
    organization: string;
    token: FernToken;
    languages: string[];
    context: TaskContext;
}): Promise<Record<string, SdkGenApiSnippets>> {
    const origin = getFernSdkGenApiOrigin();
    const snippetsByLanguage: Record<string, SdkGenApiSnippets> = {};
    if (origin == null || languages.length === 0) {
        return snippetsByLanguage;
    }
    for (const language of languages) {
        try {
            const response = await axios.get<SdkGenApiSnippets>(`${origin}/v1/fern/build/snippets/${language}`, {
                headers: {
                    Authorization: `Bearer ${token.value}`,
                    "X-Fern-Organization-Id": organization
                },
                timeout: REQUEST_TIMEOUT_MS
            });
            snippetsByLanguage[language] = response.data;
            context.logger.debug(`Fetched ${language} SDK snippets from sdk-gen-api`);
        } catch (error) {
            const status = axios.isAxiosError(error) ? error.response?.status : undefined;
            context.logger.debug(
                `No ${language} SDK snippets from sdk-gen-api${status != null ? ` (HTTP ${status})` : ""}; skipping`
            );
        }
    }
    return snippetsByLanguage;
}

export function addSdkGenApiSnippets({
    apiDefinition,
    snippetsByLanguage,
    context
}: {
    apiDefinition: APIV1Write.ApiDefinition;
    snippetsByLanguage: Record<string, SdkGenApiSnippets>;
    context: TaskContext;
}): void {
    const languages = Object.keys(snippetsByLanguage);
    if (languages.length === 0) {
        return;
    }
    const packages: APIV1Write.ApiDefinitionPackage[] = [
        apiDefinition.rootPackage,
        ...Object.values(apiDefinition.subpackages)
    ];
    let added = 0;
    for (const apiPackage of packages) {
        for (const endpoint of apiPackage.endpoints) {
            added += addSnippetsToEndpoint(endpoint, snippetsByLanguage);
        }
    }
    context.logger.info(`Added ${added} sdk-gen SDK snippet(s) (${languages.join(", ")}) to the API reference`);
}

function addSnippetsToEndpoint(
    endpoint: APIV1Write.EndpointDefinition,
    snippetsByLanguage: Record<string, SdkGenApiSnippets>
): number {
    const path = endpoint.path.parts.map((part) => (part.type === "literal" ? part.value : `{${part.value}}`)).join("");
    const method = endpoint.method.toUpperCase();
    let added = 0;
    for (const snippets of Object.values(snippetsByLanguage)) {
        const match = findEndpoint(snippets.endpoints, path, method);
        if (match == null) {
            continue;
        }
        for (const example of endpoint.examples) {
            const existing = example.codeSamples ?? [];
            const toAdd = match.codeSamples.filter(
                (sample) => !existing.some((other) => other.language.toLowerCase() === sample.language.toLowerCase())
            );
            if (toAdd.length === 0) {
                continue;
            }
            example.codeSamples = [...existing, ...toAdd];
            added += toAdd.length;
        }
    }
    return added;
}

function findEndpoint(
    endpoints: SdkGenApiEndpointSnippets[],
    path: string,
    method: string
): SdkGenApiEndpointSnippets | undefined {
    const sameMethod = endpoints.filter((candidate) => candidate.method.toUpperCase() === method);
    return (
        sameMethod.find((candidate) => candidate.path === path) ??
        sameMethod.find((candidate) => path.endsWith(candidate.path) || candidate.path.endsWith(path))
    );
}
