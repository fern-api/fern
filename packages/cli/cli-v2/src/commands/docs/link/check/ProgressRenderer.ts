import chalk from "chalk";

/**
 * Renders real-time progress for link checking in the terminal.
 * Updates in-place using carriage return for a clean progress bar experience.
 */
export class ProgressRenderer {
    private readonly stream: NodeJS.WriteStream;
    private readonly isTTY: boolean;
    private phase: "scraping" | "checking" = "scraping";
    private lastLineLength = 0;

    constructor(stream: NodeJS.WriteStream) {
        this.stream = stream;
        this.isTTY = stream.isTTY === true;
    }

    public onSitemapFetched(totalPages: number): void {
        if (this.isTTY) {
            this.clearLine();
        }
        this.stream.write(`  ${chalk.cyan("●")} Found ${totalPages} pages in sitemap\n`);
        this.phase = "scraping";
    }

    public onPageScraped(pageIndex: number, totalPages: number): void {
        this.phase = "scraping";
        const pagesScraped = pageIndex + 1;
        const bar = this.renderBar(pagesScraped, totalPages);
        const line = `  ${bar} ${pagesScraped}/${totalPages} pages scraped`;
        this.writeLine(line);
    }

    public onLinkChecked(linksChecked: number, totalLinks: number): void {
        if (this.phase === "scraping") {
            if (this.isTTY) {
                this.clearLine();
            }
            this.stream.write("\n");
            this.phase = "checking";
        }
        const bar = this.renderBar(linksChecked, totalLinks);
        const line = `  ${bar} ${linksChecked}/${totalLinks} links checked`;
        this.writeLine(line);
    }

    public finish(): void {
        if (this.isTTY) {
            this.clearLine();
        }
        this.stream.write("\n");
    }

    private writeLine(line: string): void {
        if (this.isTTY) {
            this.clearLine();
            this.stream.write(`\r${line}`);
            this.lastLineLength = line.length;
        }
        // In non-TTY, skip progress updates to avoid flooding CI logs
    }

    private clearLine(): void {
        if (this.lastLineLength > 0) {
            this.stream.write(`\r${" ".repeat(this.lastLineLength)}\r`);
            this.lastLineLength = 0;
        }
    }

    private renderBar(current: number, total: number): string {
        const width = 20;
        const fraction = total > 0 ? Math.min(current / total, 1) : 0;
        const filled = Math.round(width * fraction);
        const empty = width - filled;
        const bar = "=".repeat(filled) + (filled < width ? ">" : "") + " ".repeat(Math.max(0, empty - 1));
        return chalk.cyan(`[${bar}]`);
    }
}
