import { writeFile } from "fs/promises";
import path from "path";

/**
 * Writes a basic `.gitignore` for the generated Rust CLI project.
 *
 * Unlike the Rust SDK generator we intentionally keep `Cargo.lock`
 * tracked: the CLI ships with `cargo build --locked`, so the lockfile
 * must be committed for reproducible builds.
 */
export async function writeGitignore(outputDir: string): Promise<void> {
    const contents = ["/target", "**/*.rs.bk", ".DS_Store", "*.swp", ""].join("\n");
    await writeFile(path.join(outputDir, ".gitignore"), contents);
}
