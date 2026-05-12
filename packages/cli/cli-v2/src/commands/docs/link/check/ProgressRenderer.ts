import cliProgress from "cli-progress";

const LABEL_WIDTH = "Checking links".length;
const formatLabel = (label: string): string => label.padEnd(LABEL_WIDTH, " ");

/**
 * Renders real-time progress for link checking in the terminal.
 * Uses cli-progress bars matching the style of `fern docs dev` bundle download.
 */
export class ProgressRenderer {
    private readonly stream: NodeJS.WriteStream;
    private readonly isTTY: boolean;
    private scrapeBar: cliProgress.SingleBar | undefined;
    private checkBar: cliProgress.SingleBar | undefined;
    private phase: "idle" | "scraping" | "checking" = "idle";
    private finished = false;

    constructor(stream: NodeJS.WriteStream) {
        this.stream = stream;
        this.isTTY = stream.isTTY === true;
    }

    public onSitemapFetched(totalPages: number): void {
        this.stream.write("\n");
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

    public onPageScraped(pageIndex: number, totalPages: number): void {
        if (this.scrapeBar != null) {
            this.scrapeBar.setTotal(totalPages);
            this.scrapeBar.update(Math.min(pageIndex, totalPages));
        } else if (!this.isTTY && pageIndex >= totalPages) {
            this.stream.write(`  Scraped ${totalPages} pages\n`);
        }
    }

    public onLinkChecked(linksChecked: number, totalLinks: number): void {
        if (this.phase === "scraping") {
            if (this.scrapeBar != null) {
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
                this.checkBar.start(totalLinks, linksChecked);
            }
        }

        if (this.checkBar != null) {
            this.checkBar.setTotal(totalLinks);
            this.checkBar.update(linksChecked);
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
        this.stream.write("\n");
    }
}
