import { assertNever, errorMessageOrString } from "@fern-api/core-utils";
import { CliError, InstructionsTopic } from "@fern-api/task-context";

import { CliContext } from "../../cli-context/CliContext.js";

export const INSTRUCTIONS_BASE_URL = "https://buildwithfern.com/learn/home/fern-instructions";

const FETCH_TIMEOUT_MS = 15_000;
const TOPIC_SEGMENT_PATTERN = /^[a-z0-9][a-z0-9-]*$/;
const H1_PATTERN = /^#[ \t]+\S/;
const FENCE_PATTERN = /^ {0,3}(`{3,}|~{3,})/;

type FetchFn = (input: string, init?: RequestInit) => Promise<Response>;

export type InstructionsPageResult =
    | { type: "found"; markdown: string }
    | { type: "notFound" }
    | { type: "error"; message: string };

/**
 * Splits topic words into URL path segments. Accepts `docs publish domain`
 * as separate arguments, as one quoted argument, or as `docs/publish/domain`.
 * The reserved `index` topic maps to no segments, the topic list itself.
 */
export function parseTopicSegments(topic: string[]): string[] {
    const segments = topic
        .flatMap((part) => part.split(/[\s/]+/))
        .map((segment) => segment.trim().toLowerCase())
        .filter((segment) => segment.length > 0);
    return segments.length === 1 && segments[0] === InstructionsTopic.Index ? [] : segments;
}

export function getInstructionsUrl(segments: string[], baseUrl: string = INSTRUCTIONS_BASE_URL): string {
    if (segments.length === 0) {
        return `${baseUrl}.md`;
    }
    return `${baseUrl}/${segments.map(encodeURIComponent).join("/")}.md`;
}

/**
 * Removes the preamble the docs platform adds above every `.md` page (page
 * audience line, `.md`/`llms.txt` hints, page directive). The platform emits
 * `preamble → # <title> → > <description> → body`, so everything before the
 * first H1 outside a code fence is dropped regardless of how the preamble is
 * worded. Pages without an H1 fall back to dropping leading blockquotes.
 */
export function stripGlobalHeader(markdown: string): string {
    const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
    const titleIndex = findFirstH1LineIndex(lines);
    const contentLines = titleIndex != null ? lines.slice(titleIndex) : dropLeadingBlockquotes(lines);
    const content = contentLines.join("\n").trim();
    return content.length > 0 ? `${content}\n` : "";
}

function findFirstH1LineIndex(lines: string[]): number | undefined {
    let openFence: string | undefined;
    for (const [index, line] of lines.entries()) {
        const fence = FENCE_PATTERN.exec(line)?.[1];
        if (openFence != null) {
            if (fence != null && fence[0] === openFence[0] && fence.length >= openFence.length) {
                openFence = undefined;
            }
            continue;
        }
        if (fence != null) {
            openFence = fence;
            continue;
        }
        if (H1_PATTERN.test(line)) {
            return index;
        }
    }
    return undefined;
}

function dropLeadingBlockquotes(lines: string[]): string[] {
    let index = 0;
    while (index < lines.length) {
        const line = lines[index]?.trim() ?? "";
        if (line.length > 0 && !line.startsWith(">")) {
            break;
        }
        index++;
    }
    return lines.slice(index);
}

/**
 * Fetches an instructions page, following `docs.yml` redirects. A missing
 * `.md` page is not always a 404: the docs site can answer with a 200
 * `text/plain` "page not found" or Ask Fern prompt, so only `text/markdown`
 * responses count as a page.
 */
export async function fetchInstructionsPage({
    url,
    fetchFn = fetch,
    timeoutMs = FETCH_TIMEOUT_MS
}: {
    url: string;
    fetchFn?: FetchFn;
    timeoutMs?: number;
}): Promise<InstructionsPageResult> {
    let response: Response;
    try {
        response = await fetchFn(url, {
            redirect: "follow",
            headers: { accept: "text/markdown" },
            signal: AbortSignal.timeout(timeoutMs)
        });
    } catch (error) {
        return { type: "error", message: describeFetchError(error, timeoutMs) };
    }

    if (response.status === 404 || response.status === 410) {
        return { type: "notFound" };
    }
    if (!response.ok) {
        return { type: "error", message: `the docs site returned HTTP ${response.status}` };
    }
    if (!isMarkdownContentType(response.headers.get("content-type"))) {
        return { type: "notFound" };
    }
    return { type: "found", markdown: await response.text() };
}

function isMarkdownContentType(contentType: string | null): boolean {
    return contentType?.split(";")[0]?.trim().toLowerCase() === "text/markdown";
}

function describeFetchError(error: unknown, timeoutMs: number): string {
    if (error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError")) {
        return `the request timed out after ${timeoutMs / 1000}s`;
    }
    return errorMessageOrString(error);
}

export async function instructions({
    cliContext,
    topic,
    fetchFn
}: {
    cliContext: CliContext;
    topic: string[];
    fetchFn?: FetchFn;
}): Promise<void> {
    const segments = parseTopicSegments(topic);
    const topicName = segments.join(" ");
    if (segments.some((segment) => !TOPIC_SEGMENT_PATTERN.test(segment))) {
        return cliContext.failAndThrow(
            `"${topic.join(" ")}" is not a valid topic. Run \`fern instructions\` to list topics.`,
            undefined,
            { code: CliError.Code.UserError }
        );
    }

    const url = getInstructionsUrl(segments);
    const result = await fetchInstructionsPage({ url, fetchFn });
    switch (result.type) {
        case "found":
            cliContext.writeTextToStdout(stripGlobalHeader(result.markdown));
            return;
        case "notFound":
            if (segments.length === 0) {
                return cliContext.failAndThrow(`Could not find the instructions index at ${url}.`, undefined, {
                    code: CliError.Code.NetworkError
                });
            }
            return cliContext.failAndThrow(
                `No instructions found for "${topicName}". Run \`fern instructions\` to list topics.`,
                undefined,
                { code: CliError.Code.UserError }
            );
        case "error":
            return cliContext.failAndThrow(`Failed to fetch ${url}: ${result.message}`, undefined, {
                code: CliError.Code.NetworkError
            });
        default:
            assertNever(result);
    }
}
