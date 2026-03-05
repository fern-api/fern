/**
 * Public API Surface Extractor (Tier 2)
 *
 * Strips implementation details from a git diff, keeping only lines that
 * define the public API contract. This dramatically reduces the diff size
 * sent to AI for semantic version analysis.
 */

const MAX_SURFACE_DIFF_SIZE = 40 * 1024; // 40 KB

/**
 * Maximum number of consecutive non-signature lines allowed within a hunk
 * before truncation. If a hunk body exceeds this many lines without another
 * signature change, the remaining lines are dropped.
 */
const MAX_HUNK_BODY_LINES = 5;

// ── Language-specific patterns ──────────────────────────────────────────

interface LanguagePatterns {
    /** Lines matching any of these are kept (applied to the content after the leading +/- or space). */
    keepPatterns: RegExp[];
    /** Lines matching any of these are unconditionally dropped. */
    dropPatterns: RegExp[];
}

const TYPESCRIPT_PATTERNS: LanguagePatterns = {
    keepPatterns: [
        /^\s*export\s+(?:type|interface|class|function|const|enum|abstract)\b/,
        /^\s*(?:public|protected)\s+/,
        /\)\s*:/, // return type annotations  `) :`
        /\):\s+/ // return type annotations  `):`
    ],
    dropPatterns: [/^\s*import\s+/, /^\s*private\s+/, /^\s*\/\//]
};

const PYTHON_PATTERNS: LanguagePatterns = {
    keepPatterns: [
        /^\s*class\s+/,
        /^\s*def\s+/,
        /^\s*[A-Za-z_][A-Za-z0-9_]*\s*:/, // type-annotated attributes
        /^\s*->\s*/ // return type annotations
    ],
    dropPatterns: [/^\s*#/, /^\s*import\s+/, /^\s*from\s+\S+\s+import\s+/]
};

const JAVA_PATTERNS: LanguagePatterns = {
    keepPatterns: [
        /^\s*(?:public|protected)\s+/,
        /^\s*(?:class|interface|enum)\s+/,
        /^\s*@Override\b/,
        /^\s*@Deprecated\b/
    ],
    dropPatterns: [/^\s*private\s+/]
};

const GO_PATTERNS: LanguagePatterns = {
    keepPatterns: [
        /^\s*func\s+[A-Z]/, // exported functions (PascalCase)
        /^\s*func\s+\([^)]*\)\s+[A-Z]/, // exported methods (PascalCase)
        /^\s*type\s+[A-Z]/ // exported types
    ],
    dropPatterns: [
        /^\s*func\s+[a-z]/ // unexported functions
    ]
};

function getPatternsForLanguage(language: string): LanguagePatterns | undefined {
    switch (language.toLowerCase()) {
        case "typescript":
        case "javascript":
            return TYPESCRIPT_PATTERNS;
        case "python":
            return PYTHON_PATTERNS;
        case "java":
            return JAVA_PATTERNS;
        case "go":
        case "golang":
            return GO_PATTERNS;
        default:
            return undefined;
    }
}

// ── Diff section types ──────────────────────────────────────────────────

interface DiffFileSection {
    headerLines: string[];
    contentLines: string[];
}

// ── Core extraction logic ───────────────────────────────────────────────

/**
 * Returns `true` if `line` is a diff structural header (not content).
 */
function isDiffHeader(line: string): boolean {
    return (
        line.startsWith("diff --git") ||
        line.startsWith("index ") ||
        line.startsWith("--- ") ||
        line.startsWith("+++ ") ||
        line.startsWith("@@") ||
        line.startsWith("new file mode") ||
        line.startsWith("deleted file mode") ||
        line.startsWith("old mode") ||
        line.startsWith("new mode") ||
        line.startsWith("similarity index") ||
        line.startsWith("rename from") ||
        line.startsWith("rename to") ||
        line.startsWith("Binary files")
    );
}

/**
 * Returns `true` if `line` is a `@@` hunk header.
 */
function isHunkHeader(line: string): boolean {
    return line.startsWith("@@");
}

/**
 * Returns `true` if the content (after the diff prefix character) matches
 * at least one keep pattern and does not match any drop pattern.
 */
function isPublicSurfaceLine(content: string, patterns: LanguagePatterns): boolean {
    // Check drop patterns first
    for (const drop of patterns.dropPatterns) {
        if (drop.test(content)) {
            return false;
        }
    }
    // Check keep patterns
    for (const keep of patterns.keepPatterns) {
        if (keep.test(content)) {
            return true;
        }
    }
    return false;
}

/**
 * Checks whether a line is inside an interface/type body for TypeScript.
 * Uses heuristic: if we're between braces at the right indentation level
 * in an interface or type declaration context.
 */
function isInsideInterfaceBody(content: string, contextLines: string[]): boolean {
    // Look for field definitions that look like interface/type fields:
    // e.g., "  fieldName: string;" or "  fieldName?: number;"
    if (/^\s+\w+\??\s*:/.test(content)) {
        // Check if a recent context line starts an interface or type block
        for (let i = contextLines.length - 1; i >= Math.max(0, contextLines.length - 20); i--) {
            const ctx = contextLines[i];
            if (ctx == null) {
                continue;
            }
            if (/^\s*(?:export\s+)?(?:interface|type)\s+/.test(ctx)) {
                return true;
            }
            // If we hit a closing brace at the top level, stop looking
            if (/^}\s*$/.test(ctx)) {
                break;
            }
        }
    }
    return false;
}

/**
 * Checks whether a line is inside an exported struct body for Go.
 */
function isInsideExportedStructField(content: string, contextLines: string[]): boolean {
    // Go struct field: starts with a tab or spaces then a PascalCase identifier
    if (/^\s+[A-Z]\w*\s+/.test(content)) {
        for (let i = contextLines.length - 1; i >= Math.max(0, contextLines.length - 30); i--) {
            const ctx = contextLines[i];
            if (ctx == null) {
                continue;
            }
            if (/^\s*type\s+[A-Z]\w*\s+struct\s*\{/.test(ctx)) {
                return true;
            }
            if (/^}\s*$/.test(ctx)) {
                break;
            }
        }
    }
    return false;
}

/**
 * Determines if a line should be kept in the surface diff, considering
 * the language-specific patterns and structural context.
 */
function shouldKeepLine(
    content: string,
    patterns: LanguagePatterns,
    language: string,
    contextLines: string[]
): boolean {
    if (isPublicSurfaceLine(content, patterns)) {
        return true;
    }

    // Language-specific structural checks
    const lang = language.toLowerCase();
    if (lang === "typescript" || lang === "javascript") {
        if (isInsideInterfaceBody(content, contextLines)) {
            return true;
        }
    }
    if (lang === "go" || lang === "golang") {
        if (isInsideExportedStructField(content, contextLines)) {
            return true;
        }
    }

    return false;
}

// ── Diff parsing ────────────────────────────────────────────────────────

/**
 * Parses a unified diff into file sections.
 */
function parseFileSections(diffText: string): DiffFileSection[] {
    const lines = diffText.split("\n");
    const sections: DiffFileSection[] = [];
    let currentHeader: string[] = [];
    let currentContent: string[] = [];
    let inContent = false;

    for (const line of lines) {
        if (line.startsWith("diff --git")) {
            // Push previous section if any
            if (currentHeader.length > 0) {
                sections.push({ headerLines: currentHeader, contentLines: currentContent });
            }
            currentHeader = [line];
            currentContent = [];
            inContent = false;
        } else if (!inContent && currentHeader.length > 0) {
            if (isHunkHeader(line)) {
                inContent = true;
                currentHeader.push(line);
            } else if (isDiffHeader(line)) {
                currentHeader.push(line);
            } else {
                // Content started without a hunk header (unusual but possible)
                inContent = true;
                currentContent.push(line);
            }
        } else if (currentHeader.length > 0) {
            if (isHunkHeader(line)) {
                // New hunk header within the same file section — treat as content
                currentContent.push(line);
            } else {
                currentContent.push(line);
            }
        }
    }

    // Push last section
    if (currentHeader.length > 0) {
        sections.push({ headerLines: currentHeader, contentLines: currentContent });
    }

    return sections;
}

/**
 * Extracts the content portion of a diff line, stripping the leading
 * `+`, `-`, or space prefix.
 */
function getLineContent(line: string): string {
    if (line.startsWith("+") || line.startsWith("-") || line.startsWith(" ")) {
        return line.substring(1);
    }
    return line;
}

/**
 * Returns true if the line is a change line (addition or deletion).
 */
function isChangeLine(line: string): boolean {
    return (line.startsWith("+") && !line.startsWith("+++")) || (line.startsWith("-") && !line.startsWith("---"));
}

// ── Main extraction ─────────────────────────────────────────────────────

/**
 * Extracts the public API surface from a git diff, stripping implementation
 * details and keeping only lines that define the public API contract.
 *
 * @param diff The cleaned git diff content
 * @param language The SDK language (e.g., "typescript", "python", "java", "go")
 * @returns The surface diff containing only public API changes, or empty string if no public surface changes
 */
export function extractPublicSurface(diff: string, language: string): string {
    if (diff.trim().length === 0) {
        return "";
    }

    const patterns = getPatternsForLanguage(language);
    if (patterns == null) {
        // Unknown language — return the full diff unchanged so the AI
        // can still analyze it. This is a safe fallback.
        return truncateDiff(diff);
    }

    const fileSections = parseFileSections(diff);
    const keptSections: string[] = [];

    for (const section of fileSections) {
        const surfaceLines = extractSurfaceFromSection(section, patterns, language);

        if (surfaceLines == null) {
            continue;
        }

        keptSections.push(surfaceLines);
    }

    const result = keptSections.join("\n");

    return truncateDiff(result);
}

/**
 * Processes a single file section, keeping only public surface lines.
 * Returns the filtered section as a string, or null if no public surface changes remain.
 */
function extractSurfaceFromSection(
    section: DiffFileSection,
    patterns: LanguagePatterns,
    language: string
): string | null {
    const keptLines: string[] = [];
    const contextLines: string[] = [];
    let consecutiveNonSignatureCount = 0;
    let hasChanges = false;
    let lastWasSignature = false;

    for (const line of section.contentLines) {
        // Always keep hunk headers
        if (isHunkHeader(line)) {
            keptLines.push(line);
            consecutiveNonSignatureCount = 0;
            lastWasSignature = false;
            continue;
        }

        const content = getLineContent(line);
        contextLines.push(content);

        if (!isChangeLine(line)) {
            // Context line — keep it if it's a public surface line (for AI context)
            if (shouldKeepLine(content, patterns, language, contextLines)) {
                if (consecutiveNonSignatureCount <= MAX_HUNK_BODY_LINES) {
                    keptLines.push(line);
                }
                lastWasSignature = true;
                consecutiveNonSignatureCount = 0;
            } else {
                consecutiveNonSignatureCount++;
                // Keep limited context lines after a signature
                if (lastWasSignature && consecutiveNonSignatureCount <= 2) {
                    keptLines.push(line);
                }
            }
            continue;
        }

        // This is a change line (+ or -)
        const isSignature = shouldKeepLine(content, patterns, language, contextLines);

        if (isSignature) {
            keptLines.push(line);
            hasChanges = true;
            consecutiveNonSignatureCount = 0;
            lastWasSignature = true;
        } else {
            consecutiveNonSignatureCount++;

            // Keep the first +/- line after a signature change for context,
            // but only up to MAX_HUNK_BODY_LINES
            if (lastWasSignature && consecutiveNonSignatureCount <= MAX_HUNK_BODY_LINES) {
                keptLines.push(line);
                hasChanges = true;
            } else if (consecutiveNonSignatureCount > MAX_HUNK_BODY_LINES) {
                lastWasSignature = false;
            }
        }
    }

    if (!hasChanges) {
        return null;
    }

    // Combine header + kept content
    const result = [...section.headerLines, ...keptLines].join("\n");
    return result;
}

/**
 * Truncates a diff string to fit within the maximum allowed size.
 * Truncation is performed at file section boundaries to avoid cutting
 * a section in the middle.
 *
 * @param diff The diff to potentially truncate
 * @returns The (possibly truncated) diff
 */
export function truncateDiff(diff: string): string {
    if (diff.length <= MAX_SURFACE_DIFF_SIZE) {
        return diff;
    }

    // Truncate at file section boundaries
    const lines = diff.split("\n");
    const result: string[] = [];
    let currentSize = 0;

    for (const line of lines) {
        // Check if adding this line would exceed the limit
        const lineSize = line.length + 1; // +1 for newline
        if (currentSize + lineSize > MAX_SURFACE_DIFF_SIZE) {
            // If we're at a file boundary, stop cleanly
            if (line.startsWith("diff --git")) {
                break;
            }
            // Otherwise, stop at the current position
            break;
        }
        result.push(line);
        currentSize += lineSize;
    }

    return result.join("\n");
}

/**
 * Derives the SDK language from a generator invocation name.
 *
 * Generator names follow the pattern `fernapi/fern-{language}-{type}-sdk`
 * or `fernapi/fern-{language}-sdk`. Examples:
 * - `fernapi/fern-typescript-node-sdk` -> `typescript`
 * - `fernapi/fern-python-sdk` -> `python`
 * - `fernapi/fern-java-sdk` -> `java`
 * - `fernapi/fern-go-sdk` -> `go`
 * - `fernapi/fern-csharp-sdk` -> `csharp`
 * - `fernapi/fern-ruby-sdk` -> `ruby`
 *
 * @param generatorName The full generator invocation name
 * @returns The derived language string, or "unknown" if not determinable
 */
export function deriveLanguageFromGeneratorName(generatorName: string): string {
    // Take the last segment after /
    const baseName = generatorName.split("/").pop() ?? generatorName;

    // Try to match fern-{language}... pattern
    const match = baseName.match(/^fern-(\w+)/);
    if (match?.[1] != null) {
        const segment = match[1];
        // Map known segments to canonical language names
        const languageMap: Record<string, string> = {
            typescript: "typescript",
            python: "python",
            java: "java",
            go: "go",
            csharp: "csharp",
            ruby: "ruby",
            php: "php",
            swift: "swift",
            rust: "rust"
        };
        if (segment in languageMap) {
            return languageMap[segment] ?? "unknown";
        }
        // Return the segment as-is for unknown but parseable names
        return segment;
    }

    return "unknown";
}
