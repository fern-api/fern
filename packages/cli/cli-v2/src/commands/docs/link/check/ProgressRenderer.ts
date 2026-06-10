import cliProgress from "cli-progress";

const LABEL_WIDTH = "Checking links".length;
const formatLabel = (label: string): string => label.padEnd(LABEL_WIDTH, " ");

/**
 * Renders real-time progress for link checking in the terminal.
 * Uses cli-progress bars matching the style of `fern docs dev` bundle download.
 *
 * Tracks high-water marks to prevent regression when batched SSE events
 * arrive out of order across multiple HTTP requests.
 */
export class ProgressRenderer {
    private readonly stream: NodeJS.WriteStream;
    private readonly isTTY: boolean;
    private scrapeBar: cliProgress.SingleBar | undefined;
    private checkBar: cliProgress.SingleBar | undefined;
    private phase: "idle" | "scraping" | "checking" = "idle";
    private finished = false;
    private maxPagesScraped = 0;
    private scrapeTotalPages = 0;
    private maxLinksChecked = 0;
    private checkTotalLinks = 0;
    private scrapeMessagePrinted = false;
    private checkMessagePrinted = false;

    constructor(stream: NodeJS.WriteStream) {
        this.stream = stream;
        this.isTTY = stream.isTTY === true;
    }

    public onSitemapFetched(totalPages: number): void {
        this.stream.write("\n");
        this.scrapeTotalPages = totalPages;
        if (this.isTTY) {
            this.scrapeBar = new cliProgress.SingleBar(
                {
                    format: `  ${formatLabel("Scraping pages")} [{bar}] {percentage}% | {value}/{total}`,
                    barCompleteChar: "\u2588",
                    barIncompleteChar: "\u2591",
                    hideCursor: true,
                    stream: this.stream
                },
                cliProgress.Presets.shades_classic
            );
            this.scrapeBar.start(totalPages, 0);
        }
        this.phase = "scraping";
    }

    public onPageScraped(pagesScraped: number, totalPages: number): void {
        this.scrapeTotalPages = Math.max(this.scrapeTotalPages, totalPages);
        this.maxPagesScraped = Math.max(this.maxPagesScraped, pagesScraped);
        const clamped = Math.min(this.maxPagesScraped, this.scrapeTotalPages);

        if (this.scrapeBar != null) {
            this.scrapeBar.setTotal(this.scrapeTotalPages);
            this.scrapeBar.update(clamped);
        } else if (!this.isTTY && clamped >= this.scrapeTotalPages && !this.scrapeMessagePrinted) {
            this.scrapeMessagePrinted = true;
            this.stream.write(`  Scraped ${this.scrapeTotalPages} pages\n`);
        }
    }

    public onLinkChecked(linksChecked: number, totalLinks: number): void {
        this.checkTotalLinks = Math.max(this.checkTotalLinks, totalLinks);
        this.maxLinksChecked = Math.max(this.maxLinksChecked, linksChecked);

        if (this.phase === "scraping") {
            if (this.scrapeBar != null) {
                this.scrapeBar.setTotal(this.scrapeTotalPages);
                this.scrapeBar.update(this.scrapeTotalPages);
                this.scrapeBar.stop();
                this.scrapeBar = undefined;
            }
            this.stream.write("\n");
            this.phase = "checking";

            if (this.isTTY) {
                this.checkBar = new cliProgress.SingleBar(
                    {
                        format: `  ${formatLabel("Checking links")} [{bar}] {percentage}% | {value}/{total}`,
                        barCompleteChar: "\u2588",
                        barIncompleteChar: "\u2591",
                        hideCursor: true,
                        stream: this.stream
                    },
                    cliProgress.Presets.shades_classic
                );
                this.checkBar.start(this.checkTotalLinks, this.maxLinksChecked);
            }
        }

        const clampedLinks = Math.min(this.maxLinksChecked, this.checkTotalLinks);

        if (this.checkBar != null) {
            this.checkBar.setTotal(this.checkTotalLinks);
            this.checkBar.update(clampedLinks);
        } else if (
            !this.isTTY &&
            clampedLinks >= this.checkTotalLinks &&
            this.checkTotalLinks > 0 &&
            !this.checkMessagePrinted
        ) {
            this.checkMessagePrinted = true;
            this.stream.write(`  Checked ${this.checkTotalLinks} links\n`);
        }
    }

    public finish(): void {
        if (this.finished) {
            return;
        }
        this.finished = true;
        if (this.scrapeBar != null) {
            this.scrapeBar.stop();
            this.scrapeBar = undefined;
        }
        if (this.checkBar != null) {
            this.checkBar.stop();
            this.checkBar = undefined;
        }
        if (this.phase !== "idle") {
            this.stream.write("\n");
        }
    }
}
