/**
 * SSE client for consuming the link-checker CLI endpoint.
 *
 * Uses a multi-phase batched approach to avoid server-side timeouts on large
 * sites. Pages are scraped in batches of ~200 and links are checked in batches
 * of ~500, with server-side state stored in Redis between requests. Each
 * individual request stays well within the 800s maxDuration limit.
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

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

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

        // Phase 1: Scrape pages in batches
        let scrapeJobId: string | null = null;
        let checkJobId: string | null = null;
        let scrapeComplete = false;

        while (!scrapeComplete) {
            const params = new URLSearchParams({ domain, phase: "scrape" });
            if (scrapeJobId != null) {
                params.set("scrapeJobId", scrapeJobId);
            }

            const events = await this.fetchSseStream(params);
            let batchAdvanced = false;

            for (const event of events) {
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
                            pagesScrapedSoFar = event.data.pageIndex;
                            callbacks.onPageScraped?.(event.data);
                        }
                        break;
                    }
                    case "scrape_batch_complete": {
                        if (isScrapeBatchCompleteData(event.data)) {
                            scrapeJobId = event.data.scrapeJobId;
                            batchAdvanced = true;
                        }
                        break;
                    }
                    case "scrape_complete": {
                        if (isScrapeCompleteData(event.data)) {
                            checkJobId = event.data.jobId;
                            totalPages = event.data.totalPages;
                            totalLinks = event.data.totalLinks;
                            scrapeComplete = true;
                            batchAdvanced = true;
                        }
                        break;
                    }
                    case "error": {
                        if (isErrorData(event.data)) {
                            throw new LinkCheckError(0, event.data.message);
                        }
                        break;
                    }
                }
            }

            if (!scrapeComplete && !batchAdvanced) {
                callbacks.onStreamInterrupted?.({
                    phase: "scraping pages",
                    pagesScraped: pagesScrapedSoFar,
                    totalPages,
                    linksChecked: 0,
                    totalLinks: 0
                });
                return {
                    totalPages: pagesScrapedSoFar,
                    totalLinks: 0,
                    workingLinks: 0,
                    brokenLinks,
                    blockedLinks,
                    durationMs: Date.now() - startTime
                };
            }
        }

        if (checkJobId == null) {
            throw new LinkCheckError(0, "Scraping completed but no check job ID was returned.");
        }

        // Phase 2: Check links in batches
        let checkComplete = false;

        while (!checkComplete) {
            const params = new URLSearchParams({ domain, phase: "check", jobId: checkJobId });
            const events = await this.fetchSseStream(params);
            let batchAdvanced = false;

            for (const event of events) {
                switch (event.type) {
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
                    case "link_blocked": {
                        if (isLinkCheckedData(event.data)) {
                            blockedLinks.push(toBrokenLink(event.data));
                        }
                        break;
                    }
                    case "batch_complete": {
                        if (isBatchCompleteData(event.data)) {
                            batchAdvanced = true;
                        }
                        break;
                    }
                    case "complete": {
                        if (isCompleteData(event.data)) {
                            checkComplete = true;
                            batchAdvanced = true;
                            totalPages = event.data.totalPages;
                            totalLinks = event.data.totalLinks;
                            workingLinks = event.data.workingLinks;
                        }
                        break;
                    }
                    case "error": {
                        if (isErrorData(event.data)) {
                            throw new LinkCheckError(0, event.data.message);
                        }
                        break;
                    }
                }
            }

            if (!checkComplete && !batchAdvanced) {
                callbacks.onStreamInterrupted?.({
                    phase: "checking links",
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

    /**
     * Opens an SSE connection with retries and returns all parsed events.
     * Retries on connection failures up to MAX_RETRIES times.
     */
    private async fetchSseStream(params: URLSearchParams): Promise<ParsedSseEvent[]> {
        let lastError: Error | undefined;

        for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
            if (attempt > 0) {
                await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS * attempt));
            }

            try {
                return await this.readSseStream(params);
            } catch (error) {
                if (error instanceof LinkCheckError) {
                    throw error;
                }
                lastError = error instanceof Error ? error : new Error(String(error));
            }
        }

        throw new LinkCheckError(
            0,
            `Connection failed after ${MAX_RETRIES + 1} attempts: ${lastError?.message ?? "unknown error"}`
        );
    }

    /**
     * Opens a single SSE connection and reads all events until the stream closes.
     */
    private async readSseStream(params: URLSearchParams): Promise<ParsedSseEvent[]> {
        const url = `${this.baseUrl}?${params.toString()}`;
        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${this.token}`,
                Accept: "text/event-stream"
            }
        });

        if (!response.ok) {
            const errorMessage = await this.extractErrorMessage(response);
            throw new LinkCheckError(response.status, errorMessage);
        }

        const reader = response.body?.getReader();
        if (reader == null) {
            throw new LinkCheckError(0, "No response body received from server.");
        }

        const decoder = new TextDecoder();
        let buffer = "";
        const events: ParsedSseEvent[] = [];

        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                break;
            }

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";

            for (const line of lines) {
                const event = parseSseLine(line);
                if (event != null) {
                    events.push(event);
                }
            }
        }

        // Flush remaining decoder bytes
        buffer += decoder.decode();
        if (buffer.length > 0) {
            for (const line of buffer.split("\n")) {
                const event = parseSseLine(line);
                if (event != null) {
                    events.push(event);
                }
            }
        }

        return events;
    }

    private async extractErrorMessage(response: Response): Promise<string> {
        try {
            const body: unknown = await response.json();
            if (typeof body === "object" && body != null) {
                const obj = body as Record<string, unknown>;
                if (typeof obj.message === "string") {
                    return obj.message;
                }
                if (typeof obj.error === "string") {
                    return obj.error;
                }
            }
        } catch {
            // JSON parse failed
        }
        return response.statusText;
    }
}

// SSE line parser

function parseSseLine(line: string): ParsedSseEvent | undefined {
    let payload: string;
    if (line.startsWith("data: ")) {
        payload = line.slice(6);
    } else if (line.startsWith("data:")) {
        payload = line.slice(5);
    } else {
        return undefined;
    }

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
            return undefined;
        }
        return parsed as ParsedSseEvent;
    } catch {
        return undefined;
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

function isScrapeBatchCompleteData(
    data: Record<string, unknown>
): data is { scrapeJobId: string; pagesScraped: number; totalPages: number; hasMore: boolean } {
    return typeof data.scrapeJobId === "string" && typeof data.hasMore === "boolean";
}

function isScrapeCompleteData(
    data: Record<string, unknown>
): data is { jobId: string; totalPages: number; totalLinks: number } {
    return typeof data.jobId === "string" && typeof data.totalPages === "number" && typeof data.totalLinks === "number";
}

function isBatchCompleteData(
    data: Record<string, unknown>
): data is { jobId: string; cursor: number; hasMore: boolean } {
    return typeof data.jobId === "string" && typeof data.hasMore === "boolean";
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
