import { ComparisonResult, ComparisonSummary, Difference } from "./types";

export class ComparisonReport {
    public static generate(differences: Difference[], totalFiles: number): ComparisonResult {
        const summary = this.generateSummary(differences, totalFiles);
        const report = this.generateTextReport(differences, summary);

        return {
            passed: differences.length === 0,
            differences,
            summary,
            report
        };
    }

    private static generateSummary(differences: Difference[], totalFiles: number): ComparisonSummary {
        let missingInLocal = 0;
        let missingInRemote = 0;
        let differentFiles = 0;

        for (const diff of differences) {
            if (diff.type === "missing-in-local") {
                missingInLocal += diff.files?.length ?? 0;
            } else if (diff.type === "missing-in-remote") {
                missingInRemote += diff.files?.length ?? 0;
            } else if (diff.type === "content-mismatch") {
                differentFiles++;
            }
        }

        const identicalFiles = totalFiles - differentFiles - missingInLocal - missingInRemote;

        return {
            totalFiles,
            identicalFiles,
            differentFiles,
            missingInLocal,
            missingInRemote
        };
    }

    private static generateTextReport(differences: Difference[], summary: ComparisonSummary): string {
        const lines: string[] = [];

        lines.push("=".repeat(80));
        lines.push("Remote vs Local Generation Comparison Report");
        lines.push("=".repeat(80));
        lines.push("");

        lines.push("Summary:");
        lines.push(`  Total Files: ${summary.totalFiles}`);
        lines.push(`  Identical Files: ${summary.identicalFiles}`);
        lines.push(`  Different Files: ${summary.differentFiles}`);
        lines.push(`  Missing in Local: ${summary.missingInLocal}`);
        lines.push(`  Missing in Remote: ${summary.missingInRemote}`);
        lines.push("");

        if (differences.length === 0) {
            lines.push("✓ All files match! Remote and local generation produced identical output.");
            lines.push("");
        } else {
            lines.push("✗ Differences found:");
            lines.push("");

            for (const diff of differences) {
                if (diff.type === "missing-in-local" && diff.files) {
                    lines.push(`Missing in Local (${diff.files.length} files):`);
                    for (const file of diff.files) {
                        lines.push(`  - ${file}`);
                    }
                    lines.push("");
                } else if (diff.type === "missing-in-remote" && diff.files) {
                    lines.push(`Missing in Remote (${diff.files.length} files):`);
                    for (const file of diff.files) {
                        lines.push(`  - ${file}`);
                    }
                    lines.push("");
                } else if (diff.type === "content-mismatch" && diff.file) {
                    lines.push(`Content Mismatch: ${diff.file}`);
                    if (diff.diff) {
                        lines.push("Diff:");
                        lines.push(diff.diff);
                    }
                    lines.push("");
                }
            }
        }

        lines.push("=".repeat(80));

        return lines.join("\n");
    }

    public static generateJsonReport(result: ComparisonResult): string {
        return JSON.stringify(result, null, 2);
    }
}
