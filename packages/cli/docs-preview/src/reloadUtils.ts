import { writeFile } from "fs/promises";

/**
 * Check whether all edited files are content-only (Markdown/MDX).
 *
 * Content-only edits can skip background validation because validation
 * re-parses all OpenAPI specs (~26s for large projects) and competes for
 * CPU with Next.js SSR, inflating reload latency from ~3s to ~30s.
 *
 * Returns false when the list is empty or undefined — a missing file list
 * means "unknown change set" and should trigger full validation.
 */
export function isContentOnlyEdit(editedFilepaths: string[] | undefined): boolean {
    if (editedFilepaths == null || editedFilepaths.length === 0) {
        return false;
    }
    return editedFilepaths.every((f) => {
        const lower = f.toLowerCase();
        return lower.endsWith(".md") || lower.endsWith(".mdx");
    });
}

/**
 * Manages a monotonically-increasing generation counter backed by a temp
 * file. The Next.js docs bundle reads this file to detect stale cache
 * entries without an HTTP round-trip to revalidate-local.
 */
export class GenerationFileManager {
    private generation = 0;

    constructor(private readonly filePath: string) {}

    /** Current generation value. */
    get current(): number {
        return this.generation;
    }

    /** Increment the generation and persist to the temp file. */
    async increment(): Promise<number> {
        this.generation++;
        await this.write();
        return this.generation;
    }

    /** Write the current generation to disk (best-effort). */
    private async write(): Promise<void> {
        try {
            await writeFile(this.filePath, String(this.generation), "utf-8");
        } catch {
            // Best-effort; the HTTP path remains as fallback
        }
    }
}
