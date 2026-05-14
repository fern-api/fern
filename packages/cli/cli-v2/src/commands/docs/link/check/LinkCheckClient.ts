/**
 * SSE client for consuming the link-checker CLI endpoint.
 *
 * Uses the full-run mode (no phase parameter) which handles scraping and
 * checking in a single long-lived SSE connection. This is appropriate for
 * the CLI since the endpoint has maxDuration=800s.
 */

export interface BrokenLink {
    url: string;
    statusCode: number | null;
    isInternal: boolean;
    sourcePages: string[];
    sourcePageIds?: string[];
    error?: string;
}

export interface LinkCheckResult {
    totalPages: number;
    totalLinks: number;
    workingLinks: number;
    brokenLinks: BrokenLink[];
    blockedLinks: BrokenLink[];
    durationMs: number;
}

export interface LinkCheckCallbacks {
    onSitemapFetched?: (data: { totalPages: number }) => void;
    onPageScraped?: (data: { pageUrl: string; linksFound: number; pageIndex: number; totalPages: number }) => void;
    onLinkChecked?: (data: { linksChecked: number; totalLinks: number }) => void;
    onStreamInterrupted?: (data: {
        phase: string;
        pagesScraped: number;
        totalPages: number;
        linksChecked: number;
        totalLinks: number;
    }) => void;
}

interface ParsedSseEvent {
    type: string;
    data: Record<string, unknown>;
}

export class LinkCheckClient {
    private readonly baseUrl: string;
    private readonly token: string;

    constructor({ dashboardUrl, token }: { dashboardUrl: string; token: string }) {
        const base = dashboardUrl.replace(/\/+$/, "");
        this.baseUrl = `${base}/api/link-checker/cli`;
        this.token = token;
    }

    public async run(domain: string, callbacks: LinkCheckCallbacks): Promise<LinkCheckResult> {
        const startTime = Date.now();
        const brokenLinks: BrokenLink[] = [];
        const blockedLinks: BrokenLink[] = [];
        let totalPages = 0;
        let totalLinks = 0;
        let workingLinks = 0;
        let pagesScrapedSoFar = 0;
        let linksCheckedSoFar = 0;
        let serverError: string | undefined;
        let sawComplete = false;

        const url = `${this.baseUrl}?${new URLSearchParams({ domain }).toString()}`;
        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${this.token}`,
                Accept: "text/event-stream"
            }
        });

        if (!response.ok) {
            let errorMessage: string;
            try {
                const body: unknown = await response.json();
                if (typeof body === "object" && body != null) {
                    const obj = body as Record<string, unknown>;
                    if (typeof obj.message === "string") {
                        errorMessage = obj.message;
                    } else if (typeof obj.error === "string") {
                        errorMessage = obj.error;
                    } else {
                        errorMessage = response.statusText;
                    }
                } else {
                    errorMessage = response.statusText;
                }
            } catch {
                // JSON parse failed — fall back to HTTP status text
                errorMessage = response.statusText;
            }
            throw new LinkCheckError(response.status, errorMessage);
        }

        const reader = response.body?.getReader();
        if (reader == null) {
            throw new LinkCheckError(0, "No response body received from server.");
        }

        const decoder = new TextDecoder();
        let buffer = "";

        const processLine = (line: string): void => {
            let payload: string;
            if (line.startsWith("data: ")) {
                payload = line.slice(6);
            } else if (line.startsWith("data:")) {
                payload = line.slice(5);
            } else {
                return;
            }

            let event: ParsedSseEvent;
            try {
                const parsed: unknown = JSON.parse(payload);
                if (
                    parsed == null ||
                    typeof parsed !== "object" ||
                    !("type" in parsed) ||
                    typeof (parsed as Record<string, unknown>).type !== "string" ||
                    !("data" in parsed) ||
                    typeof (parsed as Record<string, unknown>).data !== "object" ||
                    (parsed as Record<string, unknown>).data == null
                ) {
                    // Malformed SSE payload (null, primitive, or missing type/data fields)
                    return;
                }
                event = parsed as ParsedSseEvent;
            } catch {
                // Skip non-JSON SSE lines (comments, partial chunks)
                return;
            }

            switch (event.type) {
                case "sitemap_fetched": {
                    if (isSitemapFetchedData(event.data)) {
                        totalPages = event.data.totalPages;
                        callbacks.onSitemapFetched?.({ totalPages: event.data.totalPages });
                    }
                    break;
                }
                case "page_scraped": {
                    if (isPageScrapedData(event.data)) {
                        totalPages = event.data.totalPages;
                        pagesScrapedSoFar = event.data.pageIndex + 1;
                        callbacks.onPageScraped?.({
                            ...event.data,
                            pageIndex: event.data.pageIndex + 1
                        });
                    }
                    break;
                }
                case "links_check_started": {
                    if (isLinksCheckStartedData(event.data)) {
                        totalLinks = event.data.totalLinks;
                    }
                    break;
                }
                case "link_check_progress": {
                    if (isLinkCheckProgressData(event.data)) {
                        totalLinks = event.data.totalLinks;
                        linksCheckedSoFar = event.data.linksChecked;
                        callbacks.onLinkChecked?.(event.data);
                    }
                    break;
                }
                case "link_checked": {
                    if (isLinkCheckedData(event.data)) {
                        brokenLinks.push(toBrokenLink(event.data));
                    }
                    break;
                }
                case "complete": {
                    if (isCompleteData(event.data)) {
                        sawComplete = true;
                        totalPages = event.data.totalPages;
                        totalLinks = event.data.totalLinks;
                        workingLinks = event.data.workingLinks;
                        brokenLinks.length = 0;
                        for (const link of event.data.brokenLinks) {
                            if (typeof link !== "object" || link == null) {
                                continue;
                            }
                            if (isLinkCheckedData(link as Record<string, unknown>)) {
                                brokenLinks.push(toBrokenLink(link as Record<string, unknown>));
                            }
                        }
                        blockedLinks.length = 0;
                        for (const link of event.data.blockedLinks) {
                            if (typeof link !== "object" || link == null) {
                                continue;
                            }
                            if (isLinkCheckedData(link as Record<string, unknown>)) {
                                blockedLinks.push(toBrokenLink(link as Record<string, unknown>));
                            }
                        }
                    }
                    break;
                }
                case "error": {
                    if (isErrorData(event.data)) {
                        serverError = event.data.message;
                    }
                    break;
                }
            }
        };

        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                break;
            }

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";

            for (const line of lines) {
                processLine(line);
            }
        }

        // Flush remaining decoder bytes and process any trailing buffer content
        buffer += decoder.decode();
        if (buffer.length > 0) {
            for (const line of buffer.split("\n")) {
                processLine(line);
            }
        }

        if (serverError != null) {
            throw new LinkCheckError(0, serverError);
        }

        if (!sawComplete) {
            const phase = totalLinks > 0 ? "checking links" : pagesScrapedSoFar > 0 ? "scraping pages" : "connecting";

            if (brokenLinks.length > 0 || blockedLinks.length > 0) {
                callbacks.onStreamInterrupted?.({
                    phase,
                    pagesScraped: pagesScrapedSoFar,
                    totalPages,
                    linksChecked: linksCheckedSoFar,
                    totalLinks
                });

                return {
                    totalPages: pagesScrapedSoFar,
                    totalLinks: linksCheckedSoFar,
                    workingLinks: Math.max(0, linksCheckedSoFar - brokenLinks.length - blockedLinks.length),
                    brokenLinks,
                    blockedLinks,
                    durationMs: Date.now() - startTime
                };
            }

            const detail =
                phase === "connecting"
                    ? "The server closed the connection before sending any data. This may indicate a timeout or network issue."
                    : `The connection was lost while ${phase} (${pagesScrapedSoFar} pages scraped, ${linksCheckedSoFar}/${totalLinks} links checked). This is usually caused by a server timeout.`;
            throw new LinkCheckError(0, detail);
        }

        return {
            totalPages,
            totalLinks,
            workingLinks,
            brokenLinks,
            blockedLinks,
            durationMs: Date.now() - startTime
        };
    }
}

// Type guards for SSE event data

function isSitemapFetchedData(data: Record<string, unknown>): data is { totalPages: number } {
    return typeof data.totalPages === "number";
}

function isPageScrapedData(
    data: Record<string, unknown>
): data is { pageUrl: string; linksFound: number; pageIndex: number; totalPages: number } {
    return (
        typeof data.pageUrl === "string" &&
        typeof data.linksFound === "number" &&
        typeof data.pageIndex === "number" &&
        typeof data.totalPages === "number"
    );
}

function isLinksCheckStartedData(data: Record<string, unknown>): data is { totalLinks: number } {
    return typeof data.totalLinks === "number";
}

function isLinkCheckProgressData(data: Record<string, unknown>): data is { linksChecked: number; totalLinks: number } {
    return typeof data.linksChecked === "number" && typeof data.totalLinks === "number";
}

function isLinkCheckedData(data: Record<string, unknown>): data is {
    url: string;
    statusCode: number | null;
    isInternal: boolean;
    sourcePages: string[];
    sourcePageIds?: string[];
    error?: string;
} {
    return (
        typeof data.url === "string" &&
        (data.statusCode === null || data.statusCode === undefined || typeof data.statusCode === "number") &&
        (data.isInternal === undefined || typeof data.isInternal === "boolean") &&
        Array.isArray(data.sourcePages) &&
        data.sourcePages.every((page: unknown) => typeof page === "string") &&
        (data.sourcePageIds === undefined ||
            (Array.isArray(data.sourcePageIds) && data.sourcePageIds.every((id: unknown) => typeof id === "string"))) &&
        (data.error === undefined || typeof data.error === "string")
    );
}

function isCompleteData(data: Record<string, unknown>): data is Record<string, unknown> & {
    totalPages: number;
    totalLinks: number;
    workingLinks: number;
    brokenLinks: unknown[];
    blockedLinks: unknown[];
} {
    return (
        typeof data.totalPages === "number" &&
        typeof data.totalLinks === "number" &&
        typeof data.workingLinks === "number" &&
        Array.isArray(data.brokenLinks) &&
        Array.isArray(data.blockedLinks)
    );
}

function isErrorData(data: Record<string, unknown>): data is { message: string } {
    return typeof data.message === "string";
}

function toBrokenLink(data: Record<string, unknown>): BrokenLink {
    return {
        url: data.url as string,
        statusCode: (data.statusCode as number | null) ?? null,
        isInternal: (data.isInternal as boolean | undefined) ?? false,
        sourcePages: (data.sourcePages as string[] | undefined) ?? [],
        sourcePageIds: data.sourcePageIds as string[] | undefined,
        error: data.error as string | undefined
    };
}

export class LinkCheckError extends Error {
    public readonly statusCode: number;

    constructor(statusCode: number, message: string) {
        super(message);
        this.name = "LinkCheckError";
        this.statusCode = statusCode;
    }
}
