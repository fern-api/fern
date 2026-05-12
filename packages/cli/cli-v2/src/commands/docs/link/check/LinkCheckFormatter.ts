import { assertNever } from "@fern-api/core-utils";
import chalk from "chalk";

import type { ResolvedBrokenLink, ResolvedLinkCheckResult } from "./SourceResolver.js";

export type OutputFormat = "text" | "json" | "csv";

export class LinkCheckFormatter {
    private readonly basePath: string;

    constructor(domain: string) {
        // Extract base path from domain (e.g., "you.com/docs" -> "/docs")
        const pathStart = domain.indexOf("/");
        this.basePath = pathStart >= 0 ? domain.substring(pathStart) : "";
    }

    public format(result: ResolvedLinkCheckResult, outputFormat: OutputFormat): string {
        switch (outputFormat) {
            case "json":
                return this.formatJson(result);
            case "csv":
                return this.formatCsv(result);
            case "text":
                return this.formatText(result);
            default:
                assertNever(outputFormat);
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
                        display: this.toRelativePath(ref.display),
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
                        display: this.toRelativePath(ref.display),
                        ...(ref.filePath != null ? { localFile: ref.filePath } : {}),
                        ...(ref.line != null ? { line: ref.line } : {}),
                        ...(ref.column != null ? { column: ref.column } : {})
                    })),
                    error: link.error
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

        lines.push(`Finished in ${duration}`);
        lines.push("");
        lines.push("Summary");
        lines.push(`  Pages scanned     ${result.totalPages}`);
        lines.push(`  Links checked     ${result.totalLinks}`);
        lines.push(`  ${chalk.green("✓")} Working         ${result.workingLinks}`);

        const internalCount = result.brokenLinks.filter((l) => l.isInternal).length;
        const externalCount = result.brokenLinks.filter((l) => !l.isInternal).length;
        let brokenDetail = "";
        if (internalCount > 0 && externalCount > 0) {
            brokenDetail = ` (${internalCount} internal, ${externalCount} external)`;
        } else if (internalCount > 0) {
            brokenDetail = " (internal)";
        } else if (externalCount > 0) {
            brokenDetail = " (external)";
        }

        lines.push(`  ${chalk.red("✗")} Broken          ${result.brokenLinks.length}${brokenDetail}`);

        if (result.blockedLinks.length > 0) {
            lines.push(`  ${chalk.yellow("⚠")} Blocked         ${result.blockedLinks.length}`);
        }

        const internal = result.brokenLinks.filter((l) => l.isInternal);
        const external = result.brokenLinks.filter((l) => !l.isInternal);

        if (internal.length > 0 || external.length > 0 || result.blockedLinks.length > 0) {
            lines.push("");
            lines.push(chalk.dim("──────────────────────────────────────────────────────────"));
        }

        if (internal.length > 0) {
            lines.push("");
            lines.push(chalk.bold(`Internal Broken Links (${internal.length})`));
            this.appendBrokenLinkDetails(lines, internal, true);
        }

        if (external.length > 0) {
            lines.push("");
            lines.push(chalk.bold(`External Broken Links (${external.length})`));
            this.appendBrokenLinkDetails(lines, external, false);
        }

        if (result.blockedLinks.length > 0) {
            lines.push("");
            lines.push(chalk.bold(`Blocked Links (${result.blockedLinks.length})`));
            this.appendBlockedLinkDetails(lines, result.blockedLinks);
        }

        lines.push("");
        return lines.join("\n");
    }

    private appendBrokenLinkDetails(lines: string[], links: ResolvedBrokenLink[], isInternal: boolean): void {
        for (const link of links) {
            lines.push("");
            const displayUrl = isInternal ? this.toRelativePath(link.url) : link.url;
            const status = link.statusCode != null ? link.statusCode : "unreachable";
            lines.push(`  ${chalk.red("✗")} ${chalk.cyan(displayUrl)} ${chalk.dim("→")} ${chalk.red(status)}`);

            // Show all references as relative paths (will be file:line:column in the future)
            for (const ref of link.references) {
                lines.push(chalk.dim(`    ${this.toRelativePath(ref.display)}`));
            }
        }
    }

    private appendBlockedLinkDetails(lines: string[], links: ResolvedBrokenLink[]): void {
        for (const link of links) {
            lines.push("");
            lines.push(`  ${chalk.yellow("⚠")} ${chalk.cyan(link.url)}`);
            for (const ref of link.references) {
                lines.push(chalk.dim(`    ${this.toRelativePath(ref.display)}`));
            }
        }
    }

    private toRelativePath(url: string): string {
        try {
            const parsed = new URL(url);
            let path = parsed.pathname + (parsed.search || "") + (parsed.hash || "");

            // Strip base path if present (e.g., "/docs/quickstart" -> "/quickstart" when basePath is "/docs")
            if (this.basePath && path.startsWith(this.basePath)) {
                path = path.substring(this.basePath.length);
                // Ensure we always have a leading slash
                if (!path.startsWith("/")) {
                    path = "/" + path;
                }
            }

            return path;
        } catch {
            // If URL parsing fails, return as-is
            return url;
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
