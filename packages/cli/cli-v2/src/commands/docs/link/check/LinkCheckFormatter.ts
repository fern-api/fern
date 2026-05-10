import type { BrokenLink, LinkCheckResult } from "./LinkCheckClient.js";

export type OutputFormat = "text" | "json" | "csv";

export class LinkCheckFormatter {
    public format(result: LinkCheckResult, outputFormat: OutputFormat): string {
        switch (outputFormat) {
            case "json":
                return this.formatJson(result);
            case "csv":
                return this.formatCsv(result);
            case "text":
                return this.formatText(result);
        }
    }

    private formatJson(result: LinkCheckResult): string {
        return JSON.stringify(
            {
                summary: {
                    totalPages: result.totalPages,
                    totalLinks: result.totalLinks,
                    workingLinks: result.workingLinks,
                    brokenLinks: result.brokenLinks.length,
                    blockedLinks: result.blockedLinks.length,
                    durationMs: result.durationMs
                },
                brokenLinks: result.brokenLinks.map((link) => ({
                    url: link.url,
                    statusCode: link.statusCode,
                    isInternal: link.isInternal,
                    sourcePages: link.sourcePages,
                    error: link.error
                })),
                blockedLinks: result.blockedLinks.map((link) => ({
                    url: link.url,
                    statusCode: link.statusCode,
                    isInternal: link.isInternal,
                    sourcePages: link.sourcePages
                }))
            },
            null,
            2
        );
    }

    private formatCsv(result: LinkCheckResult): string {
        const rows: string[] = ["url,statusCode,isInternal,sourcePages,error"];

        for (const link of [...result.brokenLinks, ...result.blockedLinks]) {
            const sourcePages = link.sourcePages.join("; ");
            const error = link.error ?? "";
            rows.push(
                [
                    this.escapeCsv(link.url),
                    String(link.statusCode ?? ""),
                    link.isInternal ? "internal" : "external",
                    this.escapeCsv(sourcePages),
                    this.escapeCsv(error)
                ].join(",")
            );
        }

        return rows.join("\n");
    }

    private formatText(result: LinkCheckResult): string {
        const lines: string[] = [];
        const duration = this.formatDuration(result.durationMs);

        lines.push("");
        lines.push(`  Finished in ${duration}.`);
        lines.push("");
        lines.push(`  Total pages:    ${result.totalPages}`);
        lines.push(`  Total links:    ${result.totalLinks}`);
        lines.push(`  Working links:  ${result.workingLinks}`);
        lines.push(`  Broken links:   ${result.brokenLinks.length}`);

        if (result.blockedLinks.length > 0) {
            lines.push(`  Blocked links:  ${result.blockedLinks.length}`);
        }

        if (result.brokenLinks.length > 0) {
            const internal = result.brokenLinks.filter((l) => l.isInternal);
            const external = result.brokenLinks.filter((l) => !l.isInternal);

            if (internal.length > 0) {
                lines.push("");
                lines.push(`  ${internal.length} internal broken link${internal.length === 1 ? "" : "s"}:`);
                this.appendLinkDetails(lines, internal);
            }

            if (external.length > 0) {
                lines.push("");
                lines.push(`  ${external.length} external broken link${external.length === 1 ? "" : "s"}:`);
                this.appendLinkDetails(lines, external);
            }
        }

        if (result.blockedLinks.length > 0) {
            lines.push("");
            lines.push(
                `  ${result.blockedLinks.length} blocked link${result.blockedLinks.length === 1 ? "" : "s"} (bot detection):`
            );
            this.appendLinkDetails(lines, result.blockedLinks);
        }

        lines.push("");
        return lines.join("\n");
    }

    private appendLinkDetails(lines: string[], links: BrokenLink[]): void {
        for (const link of links) {
            const status = link.statusCode != null ? ` (${link.statusCode})` : "";
            lines.push(`    - ${link.url}${status}`);
            for (const page of link.sourcePages) {
                lines.push(`        ---> Referenced by ${page}`);
            }
        }
    }

    private formatDuration(ms: number): string {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        if (minutes > 0) {
            return `${minutes} minute${minutes === 1 ? "" : "s"}, ${seconds} second${seconds === 1 ? "" : "s"}`;
        }
        return `${seconds} second${seconds === 1 ? "" : "s"}`;
    }

    private escapeCsv(value: string): string {
        if (value.includes(",") || value.includes('"') || value.includes("\n")) {
            return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
    }
}
