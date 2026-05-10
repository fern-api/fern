import chalk from "chalk";

import type { ResolvedBrokenLink, ResolvedLinkCheckResult } from "./SourceResolver.js";

export type OutputFormat = "text" | "json" | "csv";

export class LinkCheckFormatter {
    public format(result: ResolvedLinkCheckResult, outputFormat: OutputFormat): string {
        switch (outputFormat) {
            case "json":
                return this.formatJson(result);
            case "csv":
                return this.formatCsv(result);
            case "text":
                return this.formatText(result);
        }
    }

    private formatJson(result: ResolvedLinkCheckResult): string {
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
                    references: link.references.map((ref) => ({
                        display: ref.display,
                        ...(ref.filePath != null ? { localFile: ref.filePath } : {}),
                        ...(ref.line != null ? { line: ref.line } : {}),
                        ...(ref.column != null ? { column: ref.column } : {})
                    })),
                    error: link.error
                })),
                blockedLinks: result.blockedLinks.map((link) => ({
                    url: link.url,
                    statusCode: link.statusCode,
                    isInternal: link.isInternal,
                    references: link.references.map((ref) => ({
                        display: ref.display,
                        ...(ref.filePath != null ? { localFile: ref.filePath } : {}),
                        ...(ref.line != null ? { line: ref.line } : {}),
                        ...(ref.column != null ? { column: ref.column } : {})
                    }))
                }))
            },
            null,
            2
        );
    }

    private formatCsv(result: ResolvedLinkCheckResult): string {
        const rows: string[] = ["type,url,statusCode,isInternal,localFile,line,column,error"];

        for (const link of result.brokenLinks) {
            this.appendCsvRows(rows, "broken", link);
        }
        for (const link of result.blockedLinks) {
            this.appendCsvRows(rows, "blocked", link);
        }

        return rows.join("\n");
    }

    private appendCsvRows(rows: string[], type: string, link: ResolvedBrokenLink): void {
        if (link.references.length === 0) {
            rows.push(
                [
                    type,
                    this.escapeCsv(link.url),
                    String(link.statusCode ?? ""),
                    link.isInternal ? "internal" : "external",
                    "",
                    "",
                    "",
                    this.escapeCsv(link.error ?? "")
                ].join(",")
            );
            return;
        }

        for (const ref of link.references) {
            rows.push(
                [
                    type,
                    this.escapeCsv(link.url),
                    String(link.statusCode ?? ""),
                    link.isInternal ? "internal" : "external",
                    this.escapeCsv(ref.filePath ?? ref.display),
                    String(ref.line ?? ""),
                    String(ref.column ?? ""),
                    this.escapeCsv(link.error ?? "")
                ].join(",")
            );
        }
    }

    private formatText(result: ResolvedLinkCheckResult): string {
        const lines: string[] = [];
        const duration = this.formatDuration(result.durationMs);

        lines.push("");
        lines.push(`  Finished in ${duration}.`);
        lines.push("");
        lines.push(`  Total pages:    ${result.totalPages}`);
        lines.push(`  Total links:    ${result.totalLinks}`);
        lines.push(`  Working links:  ${chalk.green(result.workingLinks)}`);
        lines.push(
            `  Broken links:   ${result.brokenLinks.length > 0 ? chalk.red(result.brokenLinks.length) : result.brokenLinks.length}`
        );

        if (result.blockedLinks.length > 0) {
            lines.push(`  Blocked links:  ${chalk.yellow(result.blockedLinks.length)}`);
        }

        const internal = result.brokenLinks.filter((l) => l.isInternal);
        const external = result.brokenLinks.filter((l) => !l.isInternal);

        if (internal.length > 0) {
            lines.push("");
            lines.push(chalk.red(`  ${internal.length} internal broken link${internal.length === 1 ? "" : "s"}`));
            this.appendBrokenLinkDetails(lines, internal, chalk.red);
        }

        if (external.length > 0) {
            lines.push("");
            lines.push(chalk.red(`  ${external.length} external broken link${external.length === 1 ? "" : "s"}`));
            this.appendBrokenLinkDetails(lines, external, chalk.red);
        }

        if (result.blockedLinks.length > 0) {
            lines.push("");
            lines.push(
                chalk.yellow(
                    `  ${result.blockedLinks.length} blocked link${result.blockedLinks.length === 1 ? "" : "s"} (bot detection)`
                )
            );
            this.appendBlockedLinkDetails(lines, result.blockedLinks);
        }

        lines.push("");
        return lines.join("\n");
    }

    private appendBrokenLinkDetails(lines: string[], links: ResolvedBrokenLink[], color: (s: string) => string): void {
        for (const link of links) {
            const status = link.statusCode != null ? `returned ${link.statusCode}` : "unreachable";
            lines.push("");
            lines.push(color(`  [broken-link]: ${link.url} ${status}`));
            for (const ref of link.references) {
                lines.push(chalk.dim(`    ${ref.display}`));
            }
        }
    }

    private appendBlockedLinkDetails(lines: string[], links: ResolvedBrokenLink[]): void {
        for (const link of links) {
            lines.push("");
            lines.push(chalk.yellow(`  [blocked-link]: ${link.url} (blocked by bot detection)`));
            for (const ref of link.references) {
                lines.push(chalk.dim(`    ${ref.display}`));
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
