import { existsSync, readFileSync, writeFileSync } from "fs";
import { readFile, writeFile } from "fs/promises";
import { join } from "path";

export const REPLAY_FERNIGNORE_ENTRIES = [".fern/replay.lock", ".fern/replay.yml"];

export async function ensureReplayFernignoreEntries(outputDir: string): Promise<boolean> {
    const fernignorePath = join(outputDir, ".fernignore");
    let content = "";
    try {
        content = await readFile(fernignorePath, "utf-8");
    } catch {
        // .fernignore doesn't exist yet
    }
    const lines = content.split("\n");
    const toAdd = REPLAY_FERNIGNORE_ENTRIES.filter((entry) => !lines.some((line) => line.trim() === entry));
    if (toAdd.length > 0) {
        const suffix = content.length > 0 && !content.endsWith("\n") ? "\n" : "";
        await writeFile(fernignorePath, content + suffix + toAdd.join("\n") + "\n", "utf-8");
        return true;
    }
    return false;
}

export function ensureReplayFernignoreEntriesSync(outputDir: string): void {
    const fernignorePath = join(outputDir, ".fernignore");
    let content = "";
    if (existsSync(fernignorePath)) {
        content = readFileSync(fernignorePath, "utf-8");
    }
    const lines = content.split("\n");
    const toAdd = REPLAY_FERNIGNORE_ENTRIES.filter((entry) => !lines.some((line) => line.trim() === entry));
    if (toAdd.length > 0) {
        const suffix = content.length > 0 && !content.endsWith("\n") ? "\n" : "";
        writeFileSync(fernignorePath, content + suffix + toAdd.join("\n") + "\n", "utf-8");
    }
}
