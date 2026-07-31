import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";

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
                "- source: /old-plants",
                "  destination: /plants",
                "- source: /plants/:plantId/legacy",
                "  destination: /plants/:plantId",
                "  permanent: false"
            ].join("\n")
        );
        await writeFile(join(dir, RelativeFilePath.of("invalid.yml")), "- source: /old-plants\n  target: /plants");
        await writeFile(join(dir, RelativeFilePath.of("not-a-list.yml")), "redirects:\n  - source: /old-plants");
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

    it("fails when the file does not exist", async () => {
        await expect(
            resolveRedirects({ redirects: "./missing.yml", absoluteFilepathToDocsConfig })
        ).rejects.toThrowError(/does not exist/);
    });

    it("fails when a redirect is invalid", async () => {
        await expect(
            resolveRedirects({ redirects: "./invalid.yml", absoluteFilepathToDocsConfig })
        ).rejects.toThrowError(/Failed to parse/);
    });

    it("fails when the file holds anything other than a list of redirects", async () => {
        await expect(
            resolveRedirects({ redirects: "./not-a-list.yml", absoluteFilepathToDocsConfig })
        ).rejects.toThrowError(/Failed to parse/);
    });
});
