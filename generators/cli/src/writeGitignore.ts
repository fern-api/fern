import { writeFile } from "fs/promises";
import path from "path";

/**
 * Writes a basic `.gitignore` for the generated Rust CLI project.
 *
 * Unlike the Rust SDK generator we intentionally keep `Cargo.lock`
 * tracked: the CLI ships a lockfile so CI builds are reproducible
 * by default (users can opt into `--locked` if they want strict
 * enforcement).
 */
export async function writeGitignore(outputDir: string): Promise<void> {
    const contents = ["/target", "**/*.rs.bk", ".DS_Store", "*.swp", ""].join("\n");
    await writeFile(path.join(outputDir, ".gitignore"), contents);
}
