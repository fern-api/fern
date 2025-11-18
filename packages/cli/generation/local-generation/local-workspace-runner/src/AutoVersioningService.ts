import { loggingExeca } from "@fern-api/logging-execa";
import { TaskContext } from "@fern-api/task-context";
import { promises as fs } from "fs";
import * as os from "os";
import * as path from "path";

/**
 * Exception thrown when automatic semantic versioning fails due to inability
 * to extract or process version information.
 */
export class AutoVersioningException extends Error {
    constructor(message: string, cause?: Error) {
        super(message);
        this.name = "AutoVersioningException";
        if (cause) {
            this.cause = cause;
        }
    }
}

export interface AutoVersionResult {
    /**
     * The new version to use (e.g., "1.2.3" or "v1.2.3").
     */
    version: string;
    /**
     * The commit message describing the changes.
     */
    commitMessage: string;
}

interface FileSection {
    lines: string[];
}

/**
 * Service for handling automatic semantic versioning operations including
 * git diff generation, version extraction, and version replacement.
 */
export class AutoVersioningService {
    private readonly logger: TaskContext["logger"];

    constructor({ logger }: { logger: TaskContext["logger"] }) {
        this.logger = logger;
    }
    /**
     * Generates a git diff from the working directory changes and writes it to a temporary file.
     * This compares the current working directory against the last commit to see what has changed.
     *
     * @param workingDirectory The directory that should be within a git repository
     * @return Path to the temporary diff file
     * @throws Error if file operations fail or git command fails
     */
    public async generateDiff(workingDirectory: string): Promise<string> {
        const diffFile = path.join(os.tmpdir(), `git-diff-${Date.now()}.patch`);

        // Find the git repository root
        const gitRoot = await this.findGitRoot(workingDirectory);
        if (!gitRoot) {
            throw new Error(`No git repository found containing directory: ${workingDirectory}`);
        }

        this.logger.info(`Found git repository root: ${gitRoot}`);

        // Generate diff between HEAD and working directory (including staged and unstaged changes)
        await loggingExeca(this.logger, "git", ["diff", "HEAD", "--output", diffFile], {
            cwd: gitRoot,
            doNotPipeOutput: true
        });

        this.logger.info(`Generated git diff to file: ${diffFile}`);
        return diffFile;
    }

    /**
     * Extracts the previous version from a git diff by finding lines with the magic version.
     * The diff should contain lines like: -version = '1.2.3'  +version = '505.503.4455'
     *
     * @param diffContent The git diff content
     * @param mappedMagicVersion The magic version after language transformations (e.g., "v505.503.4455" for Go)
     * @return The previous version if found
     * @throws AutoVersioningException if no previous version can be extracted from the diff
     */
    public extractPreviousVersion(diffContent: string, mappedMagicVersion: string): string {
        const lines = diffContent.split("\n");

        let currentFile = "unknown";
        let magicVersionOccurrences = 0;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (!line) {
                continue;
            }

            if (line.startsWith("+++ b/")) {
                currentFile = line.substring(6);
            }

            if (line.startsWith("+") && !line.startsWith("+++") && line.includes(mappedMagicVersion)) {
                magicVersionOccurrences++;
                const sanitizedPlusLine = line.replace(mappedMagicVersion, "<MAGIC>");
                this.logger.info(`Found magic version in added line (file: ${currentFile}): ${sanitizedPlusLine}`);

                const matchingMinusLine = this.findMatchingMinusLine(lines, i, mappedMagicVersion);

                if (matchingMinusLine == undefined) {
                    this.logger.info(
                        `No matching minus line in hunk; continuing search. file=${currentFile}, plusLine=${sanitizedPlusLine}`
                    );
                    continue;
                }

                const extracted = this.extractPreviousVersionFromDiffLine(matchingMinusLine);
                this.logger.info(`Extracted previous version from diff (file: ${currentFile}): ${extracted}`);
                return extracted;
            }
        }

        if (magicVersionOccurrences > 0) {
            throw new AutoVersioningException(
                `Found magic version in the diff but no matching previous version lines were found in any hunk. ` +
                    `This may indicate new files or a format change. occurrences=${magicVersionOccurrences}, pairsFound=0`
            );
        }

        throw new AutoVersioningException(
            "Failed to extract version from diff. This may indicate the version file format is not supported for" +
                " auto-versioning, or the magic version was not found in any added lines."
        );
    }

    /**
     * Scans backwards from the given index to find a '-' line that forms a version-change pair
     * with the '+' line at the given index. Stops at hunk boundaries.
     *
     * @param lines All diff lines
     * @param plusLineIndex Index of the '+' line containing the magic version
     * @param mappedMagicVersion The magic version to match
     * @return The matching '-' line, or null if not found
     */
    private findMatchingMinusLine(
        lines: string[],
        plusLineIndex: number,
        mappedMagicVersion: string
    ): string | undefined {
        const plusLine = lines[plusLineIndex];
        if (!plusLine) {
            return undefined;
        }
        let linesScanned = 0;

        for (let i = plusLineIndex - 1; i >= 0; i--) {
            const line = lines[i];
            if (!line) {
                continue;
            }
            linesScanned++;

            if (this.shouldStopSearching(line)) {
                this.logger.info(`Stopped backward scan at hunk boundary after ${linesScanned} lines`);
                break;
            }

            if (this.isDeletionLine(line)) {
                if (this.isVersionChangePair(line, plusLine, mappedMagicVersion)) {
                    this.logger.info(`Found matching minus line after scanning ${linesScanned} lines backwards`);
                    return line;
                }
            }
        }

        this.logger.warn(`No matching minus line found after scanning ${linesScanned} lines backwards`);
        return undefined;
    }

    /**
     * Cleans the git diff by removing version-related changes.
     * This prevents the AI from seeing our placeholder version and the version changes themselves.
     *
     * Algorithm:
     * 1. Parse diff into file sections (each starting with "diff --git")
     * 2. For each file section, identify and remove paired - and + lines where the only difference is the magic version
     * 3. Remove entire file sections that have no remaining content changes (no + or - lines)
     *
     * @param diffContent The git diff content
     * @param mappedMagicVersion The magic version after language transformations (e.g., "v505.503.4455" for Go)
     * @return Cleaned diff content
     */
    public cleanDiffForAI(diffContent: string, mappedMagicVersion: string): string {
        const lines = diffContent.split("\n");

        const fileSections = this.parseFileSections(lines);

        const cleanedSections: FileSection[] = [];
        for (const section of fileSections) {
            const cleaned = this.cleanFileSection(section, mappedMagicVersion);
            if (cleaned != undefined) {
                cleanedSections.push(cleaned);
            }
        }

        const result: string[] = [];
        for (const section of cleanedSections) {
            for (const line of section.lines) {
                result.push(line);
            }
        }

        this.logger.info(
            `Cleaned diff: removed ${diffContent.length - result.join("\n").length} bytes containing version changes`
        );
        return result.join("\n");
    }

    /**
     * Parses a diff into file sections, where each section starts with "diff --git".
     */
    private parseFileSections(lines: string[]): FileSection[] {
        const sections: FileSection[] = [];
        let currentSection: FileSection | undefined = undefined;

        for (const line of lines) {
            if (line.startsWith("diff --git")) {
                if (currentSection != undefined) {
                    sections.push(currentSection);
                }
                currentSection = { lines: [line] };
            } else if (currentSection != undefined) {
                currentSection.lines.push(line);
            }
        }

        if (currentSection != undefined) {
            sections.push(currentSection);
        }

        return sections;
    }

    /**
     * Cleans a single file section by removing version-related changes.
     * Returns null if the file section should be completely removed.
     */
    private cleanFileSection(section: FileSection, mappedMagicVersion: string): FileSection | undefined {
        const headerLines: string[] = [];
        const contentLines: string[] = [];

        let inContent = false;
        for (const line of section.lines) {
            if (line.startsWith("@@")) {
                inContent = true;
                headerLines.push(line);
            } else if (!inContent) {
                headerLines.push(line);
            } else {
                contentLines.push(line);
            }
        }

        let processedContent = this.removeVersionChangePairs(contentLines, mappedMagicVersion);

        processedContent = this.removeRemainingMagicVersionLines(processedContent, mappedMagicVersion);

        let hasChanges = false;
        for (const line of processedContent) {
            const isAddition = line.startsWith("+") && !line.startsWith("+++");
            const isDeletion = line.startsWith("-") && !line.startsWith("---");
            if (isAddition || isDeletion) {
                hasChanges = true;
                break;
            }
        }

        if (!hasChanges) {
            return undefined;
        }

        const cleaned: FileSection = { lines: [] };
        cleaned.lines.push(...headerLines);
        cleaned.lines.push(...processedContent);
        return cleaned;
    }

    /**
     * Removes any remaining lines (additions, deletions, or context) that contain the magic version.
     * This is a secondary pass to catch any lines that the pairing logic missed.
     */
    private removeRemainingMagicVersionLines(lines: string[], mappedMagicVersion: string): string[] {
        const result: string[] = [];

        for (const line of lines) {
            if (line.includes(mappedMagicVersion)) {
                continue;
            }
            result.push(line);
        }

        return result;
    }

    /**
     * Removes paired - and + lines where the only difference is the magic version.
     */
    private removeVersionChangePairs(lines: string[], mappedMagicVersion: string): string[] {
        const result: string[] = [];
        let lineIndex = 0;

        while (lineIndex < lines.length) {
            const currentLine = lines[lineIndex];
            if (!currentLine) {
                lineIndex++;
                continue;
            }

            if (this.isDeletionLine(currentLine)) {
                const pairIndex = this.findMatchingAdditionLine(lines, lineIndex, mappedMagicVersion);
                if (pairIndex !== -1) {
                    result.push(...lines.slice(lineIndex + 1, pairIndex));
                    lineIndex = pairIndex + 1;
                } else {
                    result.push(currentLine);
                    lineIndex++;
                }
            } else {
                result.push(currentLine);
                lineIndex++;
            }
        }

        return result;
    }

    private isDeletionLine(line: string): boolean {
        return line.startsWith("-") && !line.startsWith("---");
    }

    private findMatchingAdditionLine(lines: string[], startIndex: number, mappedMagicVersion: string): number {
        const startLine = lines[startIndex];
        if (!startLine) {
            return -1;
        }

        for (let nextIndex = startIndex + 1; nextIndex < lines.length; nextIndex++) {
            const nextLine = lines[nextIndex];
            if (!nextLine) {
                continue;
            }

            if (this.shouldStopSearching(nextLine)) {
                break;
            }

            if (this.isAdditionLine(nextLine)) {
                if (this.isVersionChangePair(startLine, nextLine, mappedMagicVersion)) {
                    return nextIndex;
                }
            }
        }
        return -1;
    }

    private isAdditionLine(line: string): boolean {
        return line.startsWith("+") && !line.startsWith("+++");
    }

    private shouldStopSearching(line: string): boolean {
        return (
            line.startsWith("@@") ||
            line.startsWith("diff --git") ||
            line.startsWith("index ") ||
            line.startsWith("---") ||
            line.startsWith("+++")
        );
    }

    /**
     * Checks if two lines form a version change pair where the only difference is the magic version.
     */
    private isVersionChangePair(minusLine: string, plusLine: string, mappedMagicVersion: string): boolean {
        if (!plusLine.includes(mappedMagicVersion)) {
            return false;
        }

        const minusContent = minusLine.substring(1);
        const plusContent = plusLine.substring(1);

        const magicIndex = plusContent.indexOf(mappedMagicVersion);
        if (magicIndex === -1) {
            return false;
        }

        const plusPrefix = plusContent.substring(0, magicIndex);
        const plusSuffix = plusContent.substring(magicIndex + mappedMagicVersion.length);

        if (!minusContent.startsWith(plusPrefix)) {
            return false;
        }

        const versionStart = plusPrefix.length;
        const versionEnd = minusContent.length - plusSuffix.length;

        if (versionEnd <= versionStart || versionEnd > minusContent.length) {
            return false;
        }

        const minusVersion = minusContent.substring(versionStart, versionEnd);
        const minusSuffix = minusContent.substring(versionEnd);

        if (minusSuffix !== plusSuffix) {
            return false;
        }

        return /.*\d+.*/.test(minusVersion);
    }

    /**
     * Replaces all occurrences of the magic version with the final version in generated files.
     *
     * @param workingDirectory The directory containing generated files
     * @param mappedMagicVersion The magic version after language transformations (e.g., "v505.503.4455" for Go)
     * @param finalVersion The final version to use
     * @throws Error if file operations fail or find/sed command fails
     */
    public async replaceMagicVersion(
        workingDirectory: string,
        mappedMagicVersion: string,
        finalVersion: string
    ): Promise<void> {
        this.logger.info(`Replacing magic version ${mappedMagicVersion} with final version: ${finalVersion}`);

        const sedCommand = `s/${this.escapeForSed(mappedMagicVersion)}/${this.escapeForSed(finalVersion)}/g`;
        const osName = os.platform().toLowerCase();
        const isMac = osName.includes("darwin");

        let command: string;
        if (isMac) {
            command = `find "${workingDirectory}" -type f -not -path "*/.git/*" -exec sed -i '' '${sedCommand}' {} +`;
        } else {
            command = `find "${workingDirectory}" -type f -not -path "*/.git/*" -exec sed -i '${sedCommand}' {} +`;
        }

        await loggingExeca(this.logger, "bash", ["-c", command], {
            cwd: workingDirectory,
            doNotPipeOutput: true
        });

        this.logger.info("Magic version replaced successfully");
    }

    /**
     * Escapes special characters for use in sed command.
     */
    private escapeForSed(str: string): string {
        return str.replace(/[/&]/g, "\\$&");
    }

    /**
     * Extracts the previous version from a line containing the magic version.
     * Assumes the line format is like: "version = '505.503.4455'" or "version: 505.503.4455"
     *
     * @param lineWithMagicVersion A line from git diff containing the magic version
     * @return The inferred previous version if found
     * @throws AutoVersioningException if no valid version can be extracted
     */
    private extractPreviousVersionFromDiffLine(lineWithMagicVersion: string): string {
        const prevVersionPattern = /[-].*?([v]?\d+\.\d+\.\d+(?:-[\w.-]+)?(?:\+[\w.-]+)?)/;
        const matcher = lineWithMagicVersion.match(prevVersionPattern);

        if (matcher && matcher[1]) {
            const version = matcher[1];
            this.logger.info(`Extracted previous version from diff: ${version}`);
            return version;
        }

        throw new AutoVersioningException("Could not extract previous version from diff line: " + lineWithMagicVersion);
    }

    /**
     * Finds the git repository root by walking up the directory tree from the given path.
     *
     * @param startPath The path to start searching from
     * @return The git repository root path, or null if not found
     */
    private async findGitRoot(startPath: string): Promise<string | null> {
        let currentPath = path.resolve(startPath);

        while (currentPath !== path.dirname(currentPath)) {
            // Keep going until we reach the filesystem root
            try {
                const gitDir = path.join(currentPath, ".git");
                const stats = await fs.stat(gitDir);

                if (stats.isDirectory() || stats.isFile()) {
                    // Found .git directory or file (for git worktrees)
                    return currentPath;
                }
            } catch (error) {
                // .git doesn't exist at this level, continue up
            }

            currentPath = path.dirname(currentPath);
        }

        return null; // No git repository found
    }
}
