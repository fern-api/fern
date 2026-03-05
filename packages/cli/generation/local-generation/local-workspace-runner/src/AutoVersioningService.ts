import { loggingExeca } from "@fern-api/logging-execa";
import { TaskContext } from "@fern-api/task-context";

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
 * Glob-like patterns for files that should be completely excluded from the
 * cleaned diff sent to AI analysis. These files add noise (lock files,
 * generated docs, test fixtures, CI config) without carrying meaningful
 * API-surface signal for semantic versioning.
 *
 * Each entry is a regex tested against the file path. Most use the /i flag
 * for case-insensitive matching; /Test\.java$/ is intentionally
 * case-sensitive to match Java's PascalCase naming convention.
 */
const EXCLUDED_FILE_PATTERNS: RegExp[] = [
    // Documentation / generated reference
    /(?:^|\/)reference\.md$/i,
    /(?:^|\/)changelog(?:\.[^/]*)?$/i,
    /(?:^|\/)readme(?:\.[^/]*)?$/i,

    // Lock files (dependency resolution, zero semantic value)
    /(?:^|\/)pnpm-lock\.yaml$/i,
    /(?:^|\/)yarn\.lock$/i,
    /(?:^|\/)package-lock\.json$/i,
    /(?:^|\/)poetry\.lock$/i,
    /(?:^|\/)gemfile\.lock$/i,
    /(?:^|\/)go\.sum$/i,
    /(?:^|\/)cargo\.lock$/i,
    /(?:^|\/)composer\.lock$/i,
    /\.lock$/i, // catch-all for any other lockfiles

    // Test files (by naming convention only — directory patterns like tests/ and
    // test/ are intentionally omitted because a customer's API domain could use
    // those names, e.g. a QA platform SDK with a "tests" resource)
    /\.test\.ts$/i,
    /\.test\.js$/i,
    /\.test\.py$/i,
    /\.spec\.ts$/i,
    /\.spec\.js$/i,
    /_test\.go$/i,
    /_test\.py$/i,
    /Test\.java$/,
    /(?:^|\/)__tests__\//i, // __tests__/ is unambiguously a test directory
    /(?:^|\/)wiremock\//i, // Fern-generated WireMock test fixtures

    // Snapshot files
    /(?:^|\/)__snapshots__\//i,
    /\.snap$/i,

    // CI / editor config (no API surface relevance)
    /(?:^|\/)\.github\//i,
    /(?:^|\/)\.circleci\//i,
    /(?:^|\/)\.editorconfig$/i,
    /(?:^|\/)\.prettierrc/i,
    /(?:^|\/)biome\.json$/i,

    // Linting / static analysis config
    /(?:^|\/)\.eslintrc/i,
    /(?:^|\/)eslint\.config\./i,
    /(?:^|\/)\.rubocop/i, // Ruby linter
    /(?:^|\/)phpstan\.neon$/i, // PHP static analysis
    /(?:^|\/)phpunit\.xml$/i, // PHP test runner config
    /(?:^|\/)\.pylintrc$/i, // Python linter
    /(?:^|\/)pylintrc$/i,
    /(?:^|\/)\.flake8$/i, // Python linter
    /(?:^|\/)\.mypy\.ini$/i, // Python type checker
    /(?:^|\/)mypy\.ini$/i,
    /(?:^|\/)\.swiftlint\.yml$/i, // Swift linter
    /(?:^|\/)\.scalafmt\.conf$/i, // Scala formatter
    /(?:^|\/)rustfmt\.toml$/i, // Rust formatter
    /(?:^|\/)\.stylelintrc/i, // CSS linter

    // Build / devtool config (no API surface)
    /(?:^|\/)tsconfig[^/]*\.json$/i, // TypeScript compiler config
    /(?:^|\/)vitest\.config\./i, // Test runner config
    /(?:^|\/)jest\.config\./i, // Test runner config
    /(?:^|\/)pnpm-workspace\.yaml$/i, // Workspace config
    /(?:^|\/)\.npmrc$/i, // npm config
    /(?:^|\/)\.yarnrc/i, // Yarn config
    /(?:^|\/)tox\.ini$/i, // Python test runner
    /(?:^|\/)Makefile$/i, // Build automation
    /(?:^|\/)Rakefile$/i, // Ruby build tasks
    /(?:^|\/)contributing(?:\.[^/]*)?$/i, // Contributor docs
    /(?:^|\/)snippet\.json$/i, // Fern-generated snippet metadata
    /(?:^|\/)\.gitignore$/i,
    /(?:^|\/)\.gitattributes$/i,
    /\.slnx$/i // .NET solution files
];

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
     * Extracts the previous version from a git diff by finding lines with the magic version.
     * The diff should contain lines like: -version = '1.2.3'  +version = '505.503.4455'
     *
     * @param diffContent The git diff content
     * @param mappedMagicVersion The magic version after language transformations (e.g., "v505.503.4455" for Go)
     * @return The previous version if found, or undefined if all magic version occurrences are in new files
     * @throws AutoVersioningException if the magic version is not found at all in the diff
     */
    public extractPreviousVersion(diffContent: string, mappedMagicVersion: string): string | undefined {
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
                this.logger.debug(
                    `Found placeholder version in added line (file: ${currentFile}): ${sanitizedPlusLine}`
                );

                const matchingMinusLine = this.findMatchingMinusLine(lines, i, mappedMagicVersion);

                if (matchingMinusLine == undefined) {
                    this.logger.debug(
                        `No matching minus line in hunk; continuing search. file=${currentFile}, plusLine=${sanitizedPlusLine}`
                    );
                    continue;
                }

                const extracted = this.extractPreviousVersionFromDiffLine(matchingMinusLine);
                if (extracted != undefined) {
                    this.logger.debug(`Extracted previous version from diff (file: ${currentFile}): ${extracted}`);
                    return extracted;
                }
                this.logger.debug(
                    `Could not parse version from matching minus line (file: ${currentFile}); continuing search.`
                );
                continue;
            }
        }

        if (magicVersionOccurrences > 0) {
            this.logger.info(
                `Found placeholder version in the diff but no matching previous version lines were found in any hunk. ` +
                    `This indicates a new SDK repository with no previous version. occurrences=${magicVersionOccurrences}`
            );
            return undefined;
        }

        throw new AutoVersioningException(
            "Failed to extract version from diff. This may indicate the version file format is not supported for" +
                " auto-versioning, or the placeholder version was not found in any added lines."
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
                this.logger.debug(`Stopped backward scan at hunk boundary after ${linesScanned} lines`);
                break;
            }

            if (this.isDeletionLine(line)) {
                if (this.isVersionChangePair(line, plusLine, mappedMagicVersion)) {
                    this.logger.debug(`Found matching minus line after scanning ${linesScanned} lines backwards`);
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
            // Skip entire file sections whose path matches an exclusion pattern
            const filePath = this.extractFilePathFromSection(section);
            if (filePath != null && this.shouldExcludeFile(filePath)) {
                this.logger.debug(`Excluding file from diff analysis: ${filePath}`);
                continue;
            }

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

        this.logger.debug(
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
        this.logger.debug(`Replacing placeholder version ${mappedMagicVersion} with final version: ${finalVersion}`);

        const sedCommand = `s/${this.escapeForSed(mappedMagicVersion)}/${this.escapeForSed(finalVersion)}/g`;

        // Detect sed version by attempting to get version info
        // GNU sed supports --version, BSD sed does not
        let isGNUSed = false;
        try {
            await loggingExeca(this.logger, "sed", ["--version"], {
                doNotPipeOutput: true
            });
            isGNUSed = true;
        } catch {
            // BSD sed will fail with --version
            isGNUSed = false;
        }

        let command: string;
        if (isGNUSed) {
            // GNU sed (Linux, DevBox on Mac)
            command = `find "${workingDirectory}" -type f -not -path "*/.git/*" -exec sed -i '${sedCommand}' {} +`;
        } else {
            // BSD sed (native macOS)
            command = `find "${workingDirectory}" -type f -not -path "*/.git/*" -exec sed -i '' '${sedCommand}' {} +`;
        }

        await loggingExeca(this.logger, "bash", ["-c", command], {
            cwd: workingDirectory,
            doNotPipeOutput: true
        });

        this.logger.debug("Placeholder version replaced successfully");
    }

    /**
     * Escapes special characters for use in sed command.
     */
    private escapeForSed(str: string): string {
        return str.replace(/[/&]/g, "\\$&");
    }

    /**
     * Extracts the file path from a diff file section.
     * Parses the "diff --git a/path b/path" header line.
     */
    private extractFilePathFromSection(section: FileSection): string | undefined {
        const firstLine = section.lines[0];
        if (firstLine == null) {
            return undefined;
        }
        // diff --git a/some/path b/some/path
        // Also handles quoted paths: diff --git "a/path with spaces" "b/path with spaces"
        const match = firstLine.match(/^diff --git "?a\/(.+?)"? "?b\/(.+?)"?$/);
        if (match?.[2] != null) {
            return match[2];
        }
        return undefined;
    }

    /**
     * Checks whether a file path matches any of the exclusion patterns.
     * Excluded files are noise for AI-based semantic version analysis.
     */
    private shouldExcludeFile(filePath: string): boolean {
        return EXCLUDED_FILE_PATTERNS.some((pattern) => pattern.test(filePath));
    }

    /**
     * Extracts the previous version from a line containing the magic version.
     * Assumes the line format is like: "version = '505.503.4455'" or "version: 505.503.4455"
     *
     * @param lineWithMagicVersion A line from git diff containing the magic version
     * @return The inferred previous version if found, or undefined if the version cannot be parsed
     */
    private extractPreviousVersionFromDiffLine(lineWithMagicVersion: string): string | undefined {
        const prevVersionPattern = /[-].*?([v]?\d+\.\d+\.\d+(?:-[\w.-]+)?(?:\+[\w.-]+)?)/;
        const matcher = lineWithMagicVersion.match(prevVersionPattern);

        if (matcher && matcher[1]) {
            const version = matcher[1];
            this.logger.info(`Extracted previous version from diff: ${version}`);
            return version;
        }

        this.logger.warn("Could not extract previous version from diff line: " + lineWithMagicVersion);
        return undefined;
    }
}
