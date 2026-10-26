import { isPlainObject } from "@fern-api/core-utils";
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

type HttpGet = (
    url: string,
    options: { headers: Record<string, string>; timeout: number }
) => Promise<{ data: unknown }>;

function isArtifactPage(value: unknown): value is ArtifactPage {
    return (
        isPlainObject(value) &&
        typeof value.pages === "number" &&
        Array.isArray(value.data) &&
        value.data.every(
            (artifact) =>
                isPlainObject(artifact) &&
                typeof artifact.language === "string" &&
                (artifact.snippetsUrl === undefined || typeof artifact.snippetsUrl === "string")
        )
    );
}

/**
 * The links to the snippets files of one SDK version, by language: from the newest successfully built SDK of each
 * language that has one. The sdk-gen-api lists the organization's SDKs, newest first, filtered by the sdkName, version
 * and languages the docs ask for, so nothing is needed from the machine that built the SDK. A language with no link
 * is missing from the result.
 */
export async function findSdkGenSnippetsUrls(
    { origin, token, organization, sdkName, version, languages }: SdkGenSnippetsQuery,
    get: HttpGet = axios.get
): Promise<Map<string, string>> {
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
        const { data: listed } = await get(`${origin}/v1/fern/artifacts?${query}`, {
            headers,
            timeout: REQUEST_TIMEOUT_MS
        });
        if (!isArtifactPage(listed)) {
            throw new Error("sdk-gen-api returned an unexpected artifact list");
        }
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
