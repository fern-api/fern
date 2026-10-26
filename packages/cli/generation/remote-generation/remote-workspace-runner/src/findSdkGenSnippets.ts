import axios from "axios";

/** The most the sdk-gen-api lists in one page. */
const PAGE_SIZE = 50;
/** The pages looked through, newest SDKs first, before giving up on a language. */
const MAX_PAGES = 4;
const REQUEST_TIMEOUT_MS = 60_000;

interface ListedArtifact {
    language: string;
    snippetsUrl?: string;
}

interface ArtifactPage {
    data: ListedArtifact[];
    pages: number;
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
    const headers = { Authorization: `Bearer ${token}`, "X-Fern-Organization-Id": organization };
    const urls = new Map<string, string>();
    for (let page = 0; page < MAX_PAGES; page++) {
        const query = new URLSearchParams({
            sdkName,
            version,
            status: "SUCCESS",
            limit: String(PAGE_SIZE),
            offset: String(page * PAGE_SIZE)
        });
        for (const language of languages) {
            query.append("language", language);
        }
        const { data: listed } = await axios.get<ArtifactPage>(`${origin}/v1/fern/artifacts?${query}`, {
            headers,
            timeout: REQUEST_TIMEOUT_MS
        });
        for (const { language, snippetsUrl } of listed.data) {
            if (snippetsUrl != null && !urls.has(language)) {
                urls.set(language, snippetsUrl);
            }
        }
        if (languages.every((language) => urls.has(language)) || page + 1 >= listed.pages) {
            break;
        }
    }
    return urls;
}
