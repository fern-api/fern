import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { access, mkdtemp, readFile, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { copySnippetJsonIfNonEmpty } from "../LocalTaskHandler.js";

/**
 * Unit coverage for the empty-stub skip behavior introduced when the
 * `fernapi/fern-cli-generator` generator started shipping outputs without
 * per-endpoint snippets. `runGenerator` pre-creates an empty
 * `snippet.json` in the workspace tmp dir; if we blindly copy it into
 * the user's output every generator without a snippet emission leaves a
 * confusing zero-byte file behind.
 */
describe("copySnippetJsonIfNonEmpty", () => {
    let tmp: string;

    beforeEach(async () => {
        tmp = await mkdtemp(join(tmpdir(), "snippet-copy-"));
    });

    afterEach(async () => {
        await rm(tmp, { recursive: true, force: true });
    });

    it("skips when the source file is zero bytes — dest stays absent", async () => {
        const src = join(tmp, "src.json");
        const dest = join(tmp, "dest.json");
        await writeFile(src, "");

        const result = await copySnippetJsonIfNonEmpty({
            src: AbsoluteFilePath.of(src),
            dest: AbsoluteFilePath.of(dest)
        });

        expect(result).toBe("skipped-empty");
        await expect(access(dest)).rejects.toThrow();
    });

    it("copies when the source file has content", async () => {
        const src = join(tmp, "src.json");
        const dest = join(tmp, "dest.json");
        const payload = '{"endpoint":"GET /users","snippets":{"python":"client.users.list()"}}';
        await writeFile(src, payload);

        const result = await copySnippetJsonIfNonEmpty({
            src: AbsoluteFilePath.of(src),
            dest: AbsoluteFilePath.of(dest)
        });

        expect(result).toBe("copied");
        expect(await readFile(dest, "utf-8")).toBe(payload);
    });

    it("copies whitespace-only files (size > 0) — the empty-stub check is purely byte-size based", async () => {
        const src = join(tmp, "src.json");
        const dest = join(tmp, "dest.json");
        await writeFile(src, " ");

        const result = await copySnippetJsonIfNonEmpty({
            src: AbsoluteFilePath.of(src),
            dest: AbsoluteFilePath.of(dest)
        });

        expect(result).toBe("copied");
        expect(await readFile(dest, "utf-8")).toBe(" ");
    });
});
