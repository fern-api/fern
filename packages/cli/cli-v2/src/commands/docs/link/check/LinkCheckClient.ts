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

interface SseEvent {
    type: string;
    data: Record<string, unknown>;
    timestamp: string;
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

export class LinkCheckClient {
    private readonly baseUrl: string;
    private readonly token: string;

    constructor({ dashboardUrl, token }: { dashboardUrl: string; token: string }) {
        this.baseUrl = `${dashboardUrl}/api/link-checker/cli`;
        this.token = token;
    }

    public async run(domain: string, callbacks: LinkCheckCallbacks): Promise<LinkCheckResult> {
        const startTime = Date.now();
        const brokenLinks: BrokenLink[] = [];
        const blockedLinks: BrokenLink[] = [];
        let totalPages = 0;
        let totalLinks = 0;
        let workingLinks = 0;
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
                const body = (await response.json()) as { message?: string; error?: string };
                errorMessage = body.message ?? body.error ?? response.statusText;
            } catch {
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

        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                break;
            }

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";

            for (const line of lines) {
                if (!line.startsWith("data: ")) {
                    continue;
                }

                let event: SseEvent;
                try {
                    event = JSON.parse(line.slice(6)) as SseEvent;
                } catch {
                    // SSE lines that aren't valid JSON (comments, partial chunks) are skipped
                    continue;
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
                            callbacks.onPageScraped?.(event.data);
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
                            callbacks.onLinkChecked?.(event.data);
                        }
                        break;
                    }
                    case "link_checked": {
                        // Intermediate broken-link events are collected but overwritten by `complete`
                        if (isLinkCheckedData(event.data)) {
                            brokenLinks.push({
                                url: event.data.url,
                                statusCode: event.data.statusCode ?? null,
                                isInternal: event.data.isInternal ?? false,
                                sourcePages: event.data.sourcePages ?? [],
                                sourcePageIds: event.data.sourcePageIds,
                                error: event.data.error
                            });
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
                            brokenLinks.push(...event.data.brokenLinks);
                            blockedLinks.length = 0;
                            blockedLinks.push(...event.data.blockedLinks);
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
            }
        }

        if (serverError != null) {
            throw new LinkCheckError(0, serverError);
        }

        if (!sawComplete) {
            const phase = totalLinks > 0 ? "checking links" : totalPages > 0 ? "scraping pages" : "connecting";
            const pagesScraped = totalPages;
            const linksChecked = brokenLinks.length + blockedLinks.length;

            callbacks.onStreamInterrupted?.({
                phase,
                pagesScraped,
                totalPages,
                linksChecked,
                totalLinks
            });

            if (brokenLinks.length > 0 || blockedLinks.length > 0) {
                return {
                    totalPages,
                    totalLinks,
                    workingLinks,
                    brokenLinks,
                    blockedLinks,
                    durationMs: Date.now() - startTime
                };
            }

            const detail =
                phase === "connecting"
                    ? "The server closed the connection before sending any data. This may indicate a timeout or network issue."
                    : `The connection was lost while ${phase} (${pagesScraped} pages scraped, ${linksChecked}/${totalLinks} links checked). This is usually caused by a server timeout.`;
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

function isCompleteData(data: Record<string, unknown>): data is {
    totalPages: number;
    totalLinks: number;
    workingLinks: number;
    brokenLinks: BrokenLink[];
    blockedLinks: BrokenLink[];
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

export class LinkCheckError extends Error {
    public readonly statusCode: number;

    constructor(statusCode: number, message: string) {
        super(message);
        this.name = "LinkCheckError";
        this.statusCode = statusCode;
    }
}
