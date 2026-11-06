import { describe, expect, it, vi } from "vitest";

import { createTestCliContext } from "../../generate/__test__/commandHarness.js";
import {
    fetchInstructionsPage,
    getInstructionsUrl,
    INSTRUCTIONS_BASE_URL,
    instructions,
    parseTopicSegments,
    stripGlobalHeader
} from "../instructions.js";

const PAGE_BODY = `# Custom domains

> Point a custom domain or subpath at a Fern docs site.

## Workflow

1. Add \`custom-domain\` to \`docs.yml\`.

\`\`\`bash
# Publish to production
fern generate --docs
\`\`\`
`;

// Shape of the Next.js renderer's output, as served by buildwithfern.com.
const NEXT_PAGE = `> This page is for Home.

> For clean Markdown content of this page, append .md to this URL. For the complete documentation index, see https://buildwithfern.com/learn/llms.txt. For task-scoped instructions for coding agents working in a Fern project, see https://buildwithfern.com/learn/home/fern-instructions.md.

${PAGE_BODY}`;

// Shape of the Astro renderer's output: a multi-line directive and no audience line.
const ASTRO_PAGE = `> For clean Markdown of any page, append .md to the page URL.
> For a complete documentation index, see https://example.docs.buildwithfern.com/llms.txt.
>
> For AI client integration (Claude Code, Cursor, etc.), connect to the MCP server at https://example.docs.buildwithfern.com/_mcp/server.

${PAGE_BODY}`;

function markdownResponse(body: string, contentType = "text/markdown; charset=utf-8", status = 200): Response {
    return new Response(body, { status, headers: { "content-type": contentType } });
}

describe("stripGlobalHeader", () => {
    it("drops the Next.js preamble and keeps the title, description and body", () => {
        expect(stripGlobalHeader(NEXT_PAGE)).toBe(PAGE_BODY);
    });

    it("drops the Astro preamble", () => {
        expect(stripGlobalHeader(ASTRO_PAGE)).toBe(PAGE_BODY);
    });

    it("drops a preamble with unfamiliar wording", () => {
        const page = `Some new preamble line.\n\n> Another hint for agents.\n\n${PAGE_BODY}`;
        expect(stripGlobalHeader(page)).toBe(PAGE_BODY);
    });

    it("returns a page without a preamble unchanged", () => {
        expect(stripGlobalHeader(PAGE_BODY)).toBe(PAGE_BODY);
    });

    it("handles CRLF line endings", () => {
        expect(stripGlobalHeader(NEXT_PAGE.replace(/\n/g, "\r\n"))).toBe(PAGE_BODY);
    });

    it("ignores `#` lines inside code fences", () => {
        const page =
            "> Preamble.\n\n~~~bash\n# not a title\n~~~\n\n````md\n```\n# still not a title\n```\n````\n\n# Title\n\nBody\n";
        expect(stripGlobalHeader(page)).toBe("# Title\n\nBody\n");
    });

    it("falls back to dropping leading blockquotes when the page has no H1", () => {
        const page = "> Preamble.\n> More preamble.\n\nBody text.\n\n```bash\n# comment\n```\n";
        expect(stripGlobalHeader(page)).toBe("Body text.\n\n```bash\n# comment\n```\n");
    });

    it("does not treat `##` headings or hashtags as the title", () => {
        const page = "> Preamble.\n\n#hashtag\n\n## Section\n\nBody\n";
        expect(stripGlobalHeader(page)).toBe("#hashtag\n\n## Section\n\nBody\n");
    });
});

describe("parseTopicSegments", () => {
    it("accepts separate words, one quoted argument, or a path", () => {
        expect(parseTopicSegments(["docs", "publish", "domain"])).toEqual(["docs", "publish", "domain"]);
        expect(parseTopicSegments(["docs publish  domain"])).toEqual(["docs", "publish", "domain"]);
        expect(parseTopicSegments(["docs/publish/domain"])).toEqual(["docs", "publish", "domain"]);
        expect(parseTopicSegments(["SDKs", "Python"])).toEqual(["sdks", "python"]);
        expect(parseTopicSegments([])).toEqual([]);
    });
});

describe("getInstructionsUrl", () => {
    it("builds the index URL when there is no topic", () => {
        expect(getInstructionsUrl([])).toBe(`${INSTRUCTIONS_BASE_URL}.md`);
    });

    it("builds a topic URL from the topic words", () => {
        expect(getInstructionsUrl(["docs", "publish", "domain"])).toBe(
            `${INSTRUCTIONS_BASE_URL}/docs/publish/domain.md`
        );
    });
});

describe("fetchInstructionsPage", () => {
    it("returns Markdown pages and follows redirects", async () => {
        const fetchFn = vi.fn(async () => markdownResponse(NEXT_PAGE));
        const result = await fetchInstructionsPage({ url: "https://docs.test/a.md", fetchFn });
        expect(result).toEqual({ type: "found", markdown: NEXT_PAGE });
        expect(fetchFn).toHaveBeenCalledWith("https://docs.test/a.md", expect.objectContaining({ redirect: "follow" }));
    });

    it("treats a 200 text/plain response as a missing page", async () => {
        // The docs site answers a missing `.md` with 200 text/plain ("Page Not Found" or an Ask Fern prompt).
        const fetchFn = vi.fn(async () => markdownResponse("# Page Not Found", "text/plain; charset=utf-8"));
        expect(await fetchInstructionsPage({ url: "https://docs.test/a.md", fetchFn })).toEqual({
            type: "notFound"
        });
    });

    it("treats a 404 as a missing page", async () => {
        const fetchFn = vi.fn(async () => markdownResponse("Not found", "text/markdown", 404));
        expect(await fetchInstructionsPage({ url: "https://docs.test/a.md", fetchFn })).toEqual({
            type: "notFound"
        });
    });

    it("reports server errors", async () => {
        const fetchFn = vi.fn(async () => markdownResponse("oops", "text/plain", 503));
        expect(await fetchInstructionsPage({ url: "https://docs.test/a.md", fetchFn })).toEqual({
            type: "error",
            message: "the docs site returned HTTP 503"
        });
    });

    it("reports network errors and timeouts", async () => {
        const networkError = vi.fn(async () => {
            throw new TypeError("fetch failed");
        });
        expect(await fetchInstructionsPage({ url: "https://docs.test/a.md", fetchFn: networkError })).toEqual({
            type: "error",
            message: "fetch failed"
        });

        const hangs = vi.fn(
            (_url: string, init?: RequestInit) =>
                new Promise<Response>((_resolve, reject) => {
                    init?.signal?.addEventListener("abort", () => reject(init.signal?.reason));
                })
        );
        expect(await fetchInstructionsPage({ url: "https://docs.test/a.md", fetchFn: hangs, timeoutMs: 10 })).toEqual({
            type: "error",
            message: "the request timed out after 0.01s"
        });
    });
});

describe("instructions", () => {
    function setup(response: Response) {
        const { cliContext, logged } = createTestCliContext();
        const writeTextToStdout = vi.fn();
        cliContext.writeTextToStdout = writeTextToStdout;
        const fetchFn = vi.fn(async () => response);
        return { cliContext, logged, writeTextToStdout, fetchFn };
    }

    it("prints the index without the preamble", async () => {
        const { cliContext, writeTextToStdout, fetchFn } = setup(markdownResponse(NEXT_PAGE));
        await instructions({ cliContext, topic: [], fetchFn });
        expect(fetchFn).toHaveBeenCalledWith(`${INSTRUCTIONS_BASE_URL}.md`, expect.anything());
        expect(writeTextToStdout).toHaveBeenCalledWith(PAGE_BODY);
    });

    it("prints a topic page", async () => {
        const { cliContext, writeTextToStdout, fetchFn } = setup(markdownResponse(ASTRO_PAGE));
        await instructions({ cliContext, topic: ["docs", "publish", "domain"], fetchFn });
        expect(fetchFn).toHaveBeenCalledWith(`${INSTRUCTIONS_BASE_URL}/docs/publish/domain.md`, expect.anything());
        expect(writeTextToStdout).toHaveBeenCalledWith(PAGE_BODY);
    });

    it("points to the topic list when a topic doesn't exist", async () => {
        const { cliContext, logged, writeTextToStdout, fetchFn } = setup(markdownResponse("Ask Fern", "text/plain"));
        await expect(instructions({ cliContext, topic: ["nope"], fetchFn })).rejects.toBeDefined();
        expect(logged('No instructions found for "nope". Run `fern instructions` to list topics.')).toBe(true);
        expect(writeTextToStdout).not.toHaveBeenCalled();
    });

    it("rejects topics that aren't URL path segments without fetching", async () => {
        const { cliContext, logged, fetchFn } = setup(markdownResponse(NEXT_PAGE));
        await expect(instructions({ cliContext, topic: ["..", "secrets"], fetchFn })).rejects.toBeDefined();
        expect(logged('".. secrets" is not a valid topic')).toBe(true);
        expect(fetchFn).not.toHaveBeenCalled();
    });

    it("reports network failures", async () => {
        const { cliContext, logged, fetchFn } = setup(markdownResponse("oops", "text/plain", 500));
        await expect(instructions({ cliContext, topic: ["overview"], fetchFn })).rejects.toBeDefined();
        expect(logged(`Failed to fetch ${INSTRUCTIONS_BASE_URL}/overview.md: the docs site returned HTTP 500`)).toBe(
            true
        );
    });
});
