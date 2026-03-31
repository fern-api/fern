import * as fs from "fs/promises";
import * as path from "path";
import tmp from "tmp-promise";

/**
 * Creates a temporary directory with the given files
 */
export async function createTempFixture(files: Record<string, string>): Promise<{
    path: string;
    cleanup: () => Promise<void>;
}> {
    const tempDir = await tmp.dir({ unsafeCleanup: true });

    for (const [filePath, content] of Object.entries(files)) {
        const fullPath = path.join(tempDir.path, filePath);
        const dirPath = path.dirname(fullPath);

        await fs.mkdir(dirPath, { recursive: true });
        await fs.writeFile(fullPath, content, "utf-8");
    }

    return {
        path: tempDir.path,
        cleanup: async () => {
            await tempDir.cleanup();
        }
    };
}
