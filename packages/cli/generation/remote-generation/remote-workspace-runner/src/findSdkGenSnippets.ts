import axios from "axios";

/** The most the sdk-gen-api lists in one page: the newest builds of the SDK, far more than its languages. */
const LIMIT = 50;
const REQUEST_TIMEOUT_MS = 60_000;

interface ArtifactPage {
    data: Array<{ language: string; placeholdersSnippetsUrl?: string }>;
}

export interface SdkGenSnippetsQuery {
    origin: string;
    token: string;
    organization: string;
    /** How the sdk-gen-api names the SDK: the `sdkName` of the sdk-config.yml target it was built from. */
    sdkName: string;
    version: string;
    languages: string[];
}

/**
 * The links to the snippets files of one SDK version, by language: from the newest successfully built SDK of each
 * language that has one. The sdk-gen-api lists the organization's SDKs, newest first, filtered by the sdkName, version
 * and languages the docs ask for, so nothing is needed from the machine that built the SDK. A language with no link
 * is missing from the result.
 */
export async function findSdkGenSnippetsUrls({
    origin,
    token,
    organization,
    sdkName,
    version,
    languages
}: SdkGenSnippetsQuery): Promise<Map<string, string>> {
    const query = new URLSearchParams({ sdkName, version, status: "SUCCESS", limit: String(LIMIT) });
    for (const language of languages) {
        query.append("language", language);
    }
    const { data: listed } = await axios.get<ArtifactPage>(`${origin}/v1/fern/artifacts?${query}`, {
        headers: { Authorization: `Bearer ${token}`, "X-Fern-Organization-Id": organization },
        timeout: REQUEST_TIMEOUT_MS
    });
    const urls = new Map<string, string>();
    for (const { language, placeholdersSnippetsUrl } of listed.data) {
        // The newest build comes first, so a language keeps the first link it gets.
        if (placeholdersSnippetsUrl != null && !urls.has(language)) {
            urls.set(language, placeholdersSnippetsUrl);
        }
    }
    return urls;
}
