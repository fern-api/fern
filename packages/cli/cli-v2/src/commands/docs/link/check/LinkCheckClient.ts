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
    error?: string;
}

export interface LinkCheckProgress {
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
    onError?: (message: string) => void;
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

                let event: LinkCheckProgress;
                try {
                    event = JSON.parse(line.slice(6)) as LinkCheckProgress;
                } catch {
                    continue;
                }

                switch (event.type) {
                    case "sitemap_fetched": {
                        const data = event.data as { totalPages: number };
                        totalPages = data.totalPages;
                        callbacks.onSitemapFetched?.(data);
                        break;
                    }
                    case "page_scraped": {
                        const data = event.data as {
                            pageUrl: string;
                            linksFound: number;
                            pageIndex: number;
                            totalPages: number;
                        };
                        totalPages = data.totalPages;
                        callbacks.onPageScraped?.(data);
                        break;
                    }
                    case "links_check_started": {
                        const data = event.data as { totalLinks: number };
                        totalLinks = data.totalLinks;
                        break;
                    }
                    case "link_check_progress": {
                        const data = event.data as { linksChecked: number; totalLinks: number };
                        totalLinks = data.totalLinks;
                        callbacks.onLinkChecked?.(data);
                        break;
                    }
                    case "link_checked": {
                        const data = event.data as {
                            url: string;
                            statusCode: number | null;
                            isInternal: boolean;
                            sourcePages: string[];
                            error?: string;
                        };
                        brokenLinks.push({
                            url: data.url,
                            statusCode: data.statusCode,
                            isInternal: data.isInternal,
                            sourcePages: data.sourcePages,
                            error: data.error
                        });
                        break;
                    }
                    case "complete": {
                        const data = event.data as {
                            totalPages: number;
                            totalLinks: number;
                            workingLinks: number;
                            brokenLinks: BrokenLink[];
                            blockedLinks: BrokenLink[];
                        };
                        totalPages = data.totalPages;
                        totalLinks = data.totalLinks;
                        workingLinks = data.workingLinks;
                        brokenLinks.length = 0;
                        brokenLinks.push(...data.brokenLinks);
                        blockedLinks.length = 0;
                        blockedLinks.push(...data.blockedLinks);
                        break;
                    }
                    case "error": {
                        const data = event.data as { message: string };
                        serverError = data.message;
                        callbacks.onError?.(data.message);
                        break;
                    }
                }
            }
        }

        if (serverError != null) {
            throw new LinkCheckError(0, serverError);
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

export class LinkCheckError extends Error {
    public readonly statusCode: number;

    constructor(statusCode: number, message: string) {
        super(message);
        this.name = "LinkCheckError";
        this.statusCode = statusCode;
    }
}
