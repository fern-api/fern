import { AbsoluteFilePath, dirname, join, RelativeFilePath } from "@fern-api/fs-utils";

import { mkdtemp, writeFile } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import { beforeAll, describe, expect, it } from "vitest";

import { resolveRedirects } from "../resolveRedirects.js";

describe("resolveRedirects", () => {
    let absoluteFilepathToDocsConfig: AbsoluteFilePath;

    beforeAll(async () => {
        const dir = AbsoluteFilePath.of(await mkdtemp(path.join(tmpdir(), "resolve-redirects-")));
        absoluteFilepathToDocsConfig = join(dir, RelativeFilePath.of("docs.yml"));
        await writeFile(
            join(dir, RelativeFilePath.of("redirects.yml")),
            [
                "redirects:",
                "  - source: /old-plants",
                "    destination: /plants",
                "  - source: /plants/:plantId/legacy",
                "    destination: /plants/:plantId",
                "    permanent: false"
            ].join("\n")
        );
        await writeFile(
            join(dir, RelativeFilePath.of("invalid.yml")),
            "redirects:\n  - source: /old-plants\n    target: /plants"
        );
        await writeFile(
            join(dir, RelativeFilePath.of("bare-list.yml")),
            "- source: /old-plants\n  destination: /plants"
        );
        await writeFile(
            join(dir, RelativeFilePath.of("more-redirects.yml")),
            "redirects:\n  - source: /old-seeds\n    destination: /seeds"
        );
    });

    it("passes through an inline list", async () => {
        const redirects = [{ source: "/old-plants", destination: "/plants" }];
        expect(await resolveRedirects({ redirects, absoluteFilepathToDocsConfig })).toEqual(redirects);
    });

    it("passes through undefined", async () => {
        expect(await resolveRedirects({ redirects: undefined, absoluteFilepathToDocsConfig })).toBeUndefined();
    });

    it("loads redirects from a filepath", async () => {
        expect(await resolveRedirects({ redirects: "./redirects.yml", absoluteFilepathToDocsConfig })).toEqual([
            { source: "/old-plants", destination: "/plants" },
            { source: "/plants/:plantId/legacy", destination: "/plants/:plantId", permanent: false }
        ]);
    });

    it("loads redirects from an absolute filepath", async () => {
        const absolute = join(dirname(absoluteFilepathToDocsConfig), RelativeFilePath.of("redirects.yml"));
        expect(await resolveRedirects({ redirects: absolute, absoluteFilepathToDocsConfig })).toHaveLength(2);
    });

    it("loads and concatenates redirects from a list of filepaths", async () => {
        expect(
            await resolveRedirects({
                redirects: ["./redirects.yml", "./more-redirects.yml"],
                absoluteFilepathToDocsConfig
            })
        ).toEqual([
            { source: "/old-plants", destination: "/plants" },
            { source: "/plants/:plantId/legacy", destination: "/plants/:plantId", permanent: false },
            { source: "/old-seeds", destination: "/seeds" }
        ]);
    });

    it("fails when one of several filepaths does not exist", async () => {
        await expect(
            resolveRedirects({ redirects: ["./redirects.yml", "./missing.yml"], absoluteFilepathToDocsConfig })
        ).rejects.toThrowError(/is not a file/);
    });

    it("fails when the file does not exist", async () => {
        await expect(
            resolveRedirects({ redirects: "./missing.yml", absoluteFilepathToDocsConfig })
        ).rejects.toThrowError(/is not a file/);
    });

    it("fails when the filepath is empty", async () => {
        await expect(resolveRedirects({ redirects: "", absoluteFilepathToDocsConfig })).rejects.toThrowError(
            /is not a file/
        );
    });

    it("fails when a redirect is invalid", async () => {
        await expect(
            resolveRedirects({ redirects: "./invalid.yml", absoluteFilepathToDocsConfig })
        ).rejects.toThrowError(/Failed to parse/);
    });

    it("fails when the file is missing the `redirects` key", async () => {
        await expect(
            resolveRedirects({ redirects: "./bare-list.yml", absoluteFilepathToDocsConfig })
        ).rejects.toThrowError(/Failed to parse/);
    });
});
