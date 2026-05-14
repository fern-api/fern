import { assertNever } from "@fern-api/core-utils";
import chalk from "chalk";

import type { ResolvedBrokenLink, ResolvedLinkCheckResult, ResolvedReference } from "./SourceResolver.js";

export type OutputFormat = "text" | "json" | "csv";

export class LinkCheckFormatter {
    private readonly basePath: string;

    constructor(domain: string) {
        // Extract base path from domain (e.g., "you.com/docs" -> "/docs")
        const pathStart = domain.indexOf("/");
        this.basePath = pathStart >= 0 ? domain.substring(pathStart) : "";
    }

    public format(
        result: ResolvedLinkCheckResult,
        outputFormat: OutputFormat,
        options?: { interrupted?: boolean }
    ): string {
        const interrupted = options?.interrupted === true;
        switch (outputFormat) {
            case "json":
                return this.formatJson(result, interrupted);
            case "csv":
                return this.formatCsv(result, interrupted);
            case "text":
                return this.formatText(result, interrupted);
            default:
                assertNever(outputFormat);
        }
    }

    private formatJson(result: ResolvedLinkCheckResult, interrupted: boolean): string {
        return JSON.stringify(
            {
                summary: {
                    status: interrupted ? "interrupted" : "complete",
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
                    references: link.references.map((ref) => this.formatJsonReference(ref)),
                    error: link.error
                })),
                blockedLinks: result.blockedLinks.map((link) => ({
                    url: link.url,
                    statusCode: link.statusCode,
                    isInternal: link.isInternal,
                    references: link.references.map((ref) => this.formatJsonReference(ref)),
                    error: link.error
                }))
            },
            null,
            2
        );
    }

    private formatCsv(result: ResolvedLinkCheckResult, interrupted: boolean): string {
        const status = interrupted ? "interrupted" : "complete";
        const rows: string[] = ["type,url,statusCode,scope,source,error,runStatus"];

        for (const link of result.brokenLinks) {
            this.appendCsvRows(rows, "broken", link, status);
        }
        for (const link of result.blockedLinks) {
            this.appendCsvRows(rows, "blocked", link, status);
        }

        return rows.join("\n");
    }

    private appendCsvRows(rows: string[], type: string, link: ResolvedBrokenLink, status: string): void {
        if (link.references.length === 0) {
            rows.push(
                [
                    type,
                    this.escapeCsv(link.url),
                    String(link.statusCode ?? ""),
                    link.isInternal ? "internal" : "external",
                    "",
                    this.escapeCsv(link.error ?? ""),
                    status
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
                    this.escapeCsv(ref.filePath ?? ref.slug),
                    this.escapeCsv(link.error ?? ""),
                    status
                ].join(",")
            );
        }
    }

    private formatText(result: ResolvedLinkCheckResult, interrupted: boolean): string {
        const lines: string[] = [];
        const duration = this.formatDuration(result.durationMs);

        if (interrupted) {
            lines.push(`Interrupted after ${duration} — showing partial results`);
        } else {
            lines.push(`Finished in ${duration}`);
        }
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

            if (link.error != null && link.error.length > 0) {
                lines.push(chalk.dim(`    ${link.error}`));
            }

            for (const ref of link.references) {
                lines.push(chalk.dim(`    ${this.formatReference(ref)}`));
            }
        }
    }

    private appendBlockedLinkDetails(lines: string[], links: ResolvedBrokenLink[]): void {
        for (const link of links) {
            lines.push("");
            const displayUrl = link.isInternal ? this.toRelativePath(link.url) : link.url;
            const status = link.statusCode != null ? link.statusCode : "blocked";
            lines.push(`  ${chalk.yellow("⚠")} ${chalk.cyan(displayUrl)} ${chalk.dim("→")} ${chalk.yellow(status)}`);

            if (link.error != null && link.error.length > 0) {
                lines.push(chalk.dim(`    ${link.error}`));
            }

            for (const ref of link.references) {
                lines.push(chalk.dim(`    ${this.formatReference(ref)}`));
            }
        }
    }

    private formatReference(ref: ResolvedReference): string {
        if (ref.filePath != null) {
            return ref.filePath;
        }
        return ref.slug;
    }

    private formatJsonReference(ref: ResolvedReference): Record<string, string> {
        if (ref.filePath != null) {
            return { filePath: ref.filePath };
        }
        return { slug: ref.slug };
    }

    private toRelativePath(url: string): string {
        try {
            const parsed = new URL(url);
            const path = parsed.pathname + (parsed.search || "") + (parsed.hash || "");
            return this.stripBasePath(path);
        } catch {
            return this.stripBasePath(url);
        }
    }

    private stripBasePath(pathname: string): string {
        if (this.basePath && pathname.startsWith(this.basePath)) {
            const charAfter = pathname[this.basePath.length];
            if (charAfter === undefined || charAfter === "/" || charAfter === "?" || charAfter === "#") {
                let stripped = pathname.substring(this.basePath.length);
                if (!stripped.startsWith("/")) {
                    stripped = "/" + stripped;
                }
                return stripped;
            }
        }
        return pathname;
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
        if (value.includes(",") || value.includes('"') || value.includes("\n") || value.includes("\r")) {
            return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
    }
}
