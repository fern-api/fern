import { readFile } from "fs/promises";

import { resolve } from "@fern-api/fs-utils";
import { INTERMEDIATE_REPRESENTATION_MIGRATOR } from "@fern-api/ir-migrations";

interface ChangelogEntry {
    version: string;
    date: string;
    changes: string[];
}

interface FormattedChange {
    summary: string;
    type: "feat" | "fix" | "chore";
}

interface FormattedEntry {
    changelogEntry: FormattedChange[];
    irVersion: number;
    version: string;
    createdAt: string;
}

export function parseChangelog(changelogContent: string): ChangelogEntry[] {
    const entries: ChangelogEntry[] = [];
    let currentVersion: string | undefined = undefined;
    let currentDate: string | undefined = undefined;
    let currentChanges: string[] = [];
    let currentChange: string | undefined = undefined;
    let codeBlockDepth = 0;

    const lines = changelogContent.split("\n");
    for (const line of lines) {
        const versionMatch = line.match(/## \[(\d+\.\d+\.\d+(?:-\w+)?)\] - (\d{4}-\d{2}-\d{2})/);
        if (versionMatch && versionMatch[1] && versionMatch[2]) {
            if (currentVersion && currentDate) {
                if (currentChange) {
                    currentChanges.push(currentChange);
                }
                entries.push({
                    version: currentVersion,
                    date: currentDate,
                    changes: currentChanges
                });
            }
            currentVersion = versionMatch[1];
            currentDate = versionMatch[2];
            currentChanges = [];
            currentChange = undefined;
            codeBlockDepth = 0;
        } else if (line.trim().startsWith("- ") && codeBlockDepth === 0) {
            if (currentChange) {
                currentChanges.push(currentChange);
            }
            currentChange = line;
        } else if (currentChange) {
            if (line.trim().startsWith("```")) {
                codeBlockDepth = codeBlockDepth === 0 ? 1 : codeBlockDepth - 1;
            }
            currentChange += "\n" + line;
        }
    }

    if (currentVersion && currentDate) {
        if (currentChange) {
            currentChanges.push(currentChange);
        }
        entries.push({
            version: currentVersion,
            date: currentDate,
            changes: currentChanges
        });
    }

    return entries;
}

export function convertToNewFormat({
    entries,
    generatorName
}: {
    entries: ChangelogEntry[];
    generatorName: string;
}): FormattedEntry[] {
    return entries.map((entry) => {
        const changes = entry.changes.map((change) => {
            let type: FormattedChange["type"] = "fix";
            let summary = change;

            const firstLine = summary.split("\n")[0]?.toLowerCase() ?? "";
            if (firstLine.includes("feature:") || firstLine.includes("feat:")) {
                type = "feat";
            } else if (firstLine.includes("chore:")) {
                type = "chore";
            }

            summary = summary
                .split("\n")
                .map((line, index) => {
                    if (index === 0) {
                        const colonIndex = line.indexOf(":");
                        if (colonIndex !== -1) {
                            return line.slice(colonIndex + 1).trim();
                        }
                    }
                    return line;
                })
                .join("\n");

            summary = summary
                .split("\n")
                .filter((line) => !line.match(/^## \[\d+\.\d+\.\d+(?:-\w+)?\] - \d{4}-\d{2}-\d{2}$/))
                .join("\n");

            return { summary: summary.trim(), type };
        });

        const irVersion = INTERMEDIATE_REPRESENTATION_MIGRATOR.getIRVersionForGenerator({
            targetGenerator: { name: generatorName, version: entry.version }
        });

        if (irVersion == null) {
            throw new Error(
                `Could not determine IR version for generator ${generatorName} at version ${entry.version}`
            );
        }

        return {
            changelogEntry: changes,
            irVersion: Number(irVersion.slice(1)),
            version: entry.version,
            createdAt: entry.date
        };
    });
}

export function formatOutput(newFormat: FormattedEntry[]): string {
    return newFormat
        .map((entry) => {
            const formattedEntries = entry.changelogEntry
                .map((change) => {
                    const summaryLines = change.summary.split("\n");
                    const formattedSummary = summaryLines
                        .map((line, index) => {
                            if (index === 0) {
                                return line;
                            } else {
                                return " ".repeat(8) + line;
                            }
                        })
                        .join("\n");

                    return `- changelogEntry:
    - summary: |
        ${formattedSummary}
      type: ${change.type}
  irVersion: ${entry.irVersion}
  version: "${entry.version}"
  createdAt: "${entry.createdAt}"`;
                })
                .join("\n\n");

            return formattedEntries;
        })
        .join("\n\n");
}

export async function convertChangelogToVersions(inputPath: string, generatorName: string): Promise<string> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const absoluteInputPath = resolve(inputPath as any);
    const inputContent = await readFile(absoluteInputPath, "utf8");
    const entries = parseChangelog(inputContent);
    const newFormat = convertToNewFormat({ entries, generatorName });
    return formatOutput(newFormat);
}
