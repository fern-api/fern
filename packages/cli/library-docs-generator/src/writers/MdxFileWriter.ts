/**
 * Write rendered MDX pages to disk.
 *
 * Designed for streaming: each page is written immediately after rendering
 * so we never hold all page content in memory at once. The MdxFileWriter
 * is instantiated with an output directory, then writePage() is called
 * for each module as we traverse the IR tree.
 */

import { mkdirSync, writeFileSync } from "fs";
import { dirname, join } from "path";

/**
 * Streaming MDX file writer.
 *
 * Usage:
 *   const writer = new MdxFileWriter(outputDir);
 *   writer.writePage("reference/python/nemo_rl.mdx", mdxContent);
 *   writer.writePage("reference/python/nemo_rl/algorithms.mdx", mdxContent);
 *   const { writtenFiles, pageCount } = writer.result();
 */
export class MdxFileWriter {
    private outputDir: string;
    private writtenFiles: string[] = [];

    constructor(outputDir: string) {
        this.outputDir = outputDir;
    }

    /**
     * Write a single MDX page to disk immediately.
     * Creates parent directories as needed.
     *
     * @param pageKey - Relative path (e.g., "reference/python/nemo_rl.mdx")
     * @param content - MDX content to write
     * @returns Absolute path of the written file
     */
    writePage(pageKey: string, content: string): string {
        const filePath = join(this.outputDir, pageKey);
        mkdirSync(dirname(filePath), { recursive: true });
        writeFileSync(filePath, content);
        this.writtenFiles.push(filePath);
        return filePath;
    }

    /**
     * Get the accumulated result after all pages have been written.
     */
    result(): { writtenFiles: string[]; pageCount: number } {
        return { writtenFiles: this.writtenFiles, pageCount: this.writtenFiles.length };
    }
}
