import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { mkdir, mkdtemp, writeFile } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import { describe, expect, it } from "vitest";

import { validateStagedChanges } from "../commands/validate/validateStagedChanges";

interface RecordingTaskContext {
    logger: {
        debug: (msg: string) => void;
        error: (msg: string) => void;
    };
    errors: string[];
}

function createContext(): RecordingTaskContext {
    const errors: string[] = [];
    return {
        logger: {
            debug: () => undefined,
            error: (msg: string) => {
                errors.push(msg);
            }
        },
        errors
    };
}

async function createTempChangelog(): Promise<{ root: string; changelogPath: string }> {
    const root = await mkdtemp(path.join(tmpdir(), "validate-staged-changes-"));
    const changelogPath = path.join(root, "CHANGELOG.md");
    await writeFile(changelogPath, "# changelog\n", "utf-8");
    return { root, changelogPath };
}

async function writeChange(root: string, version: string, file: string, contents: string): Promise<void> {
    const dir = path.join(root, "changes", version);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, file), contents, "utf-8");
}

describe("validateStagedChanges", () => {
    it("rejects type: break in unreleased entries", async () => {
        const { root, changelogPath } = await createTempChangelog();
        await writeChange(root, "unreleased", "rename-thing.yml", `- summary: |\n    Rename a thing.\n  type: break\n`);

        const context = createContext();
        const hasErrors = await validateStagedChanges({
            absolutePathToChangelog: AbsoluteFilePath.of(changelogPath),
            // biome-ignore lint/suspicious/noExplicitAny: minimal stub for tests
            context: context as any,
            label: "test"
        });

        expect(hasErrors).toBe(true);
        expect(context.errors.some((err) => err.includes('forbidden type "break"'))).toBe(true);
    });

    it("allows type: feat in unreleased entries", async () => {
        const { root, changelogPath } = await createTempChangelog();
        await writeChange(root, "unreleased", "add-thing.yml", `- summary: |\n    Add a thing.\n  type: feat\n`);

        const context = createContext();
        const hasErrors = await validateStagedChanges({
            absolutePathToChangelog: AbsoluteFilePath.of(changelogPath),
            // biome-ignore lint/suspicious/noExplicitAny: minimal stub for tests
            context: context as any,
            label: "test"
        });

        expect(hasErrors).toBe(false);
        expect(context.errors).toEqual([]);
    });

    it("does not reject historical released versions that contain type: break", async () => {
        const { root, changelogPath } = await createTempChangelog();
        await writeChange(root, "5.0.0", "rename-thing.yml", `- summary: |\n    Rename a thing.\n  type: break\n`);

        const context = createContext();
        const hasErrors = await validateStagedChanges({
            absolutePathToChangelog: AbsoluteFilePath.of(changelogPath),
            // biome-ignore lint/suspicious/noExplicitAny: minimal stub for tests
            context: context as any,
            label: "test"
        });

        expect(hasErrors).toBe(false);
        expect(context.errors).toEqual([]);
    });
});
