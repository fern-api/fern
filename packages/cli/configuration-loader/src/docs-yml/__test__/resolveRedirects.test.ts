import { docsYml } from "@fern-api/configuration";
import { AbsoluteFilePath, dirname, join, RelativeFilePath } from "@fern-api/fs-utils";

import { mkdir, mkdtemp, symlink, writeFile } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import { beforeAll, describe, expect, it } from "vitest";

import { getRedirectsFilepaths, resolveRedirects } from "../resolveRedirects.js";

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
        await writeFile(join(dir, RelativeFilePath.of("comments-only.yml")), "# no redirects here\n");
        await writeFile(
            join(dir, RelativeFilePath.of("null-permanent.yml")),
            "redirects:\n  - source: /old-plants\n    destination: /plants\n    permanent:"
        );
        await symlink(join(dir, RelativeFilePath.of("redirects.yml")), join(dir, RelativeFilePath.of("symlinked.yml")));
        await mkdir(join(dir, RelativeFilePath.of("nested")));
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

    it("follows a symlink to a redirects file", async () => {
        expect(await resolveRedirects({ redirects: "./symlinked.yml", absoluteFilepathToDocsConfig })).toHaveLength(2);
    });

    it("tolerates a null value for an optional field, like docs.yml does", async () => {
        expect(await resolveRedirects({ redirects: "./null-permanent.yml", absoluteFilepathToDocsConfig })).toEqual([
            { source: "/old-plants", destination: "/plants" }
        ]);
    });

    it("fails when the file has no redirects", async () => {
        await expect(
            resolveRedirects({ redirects: "./comments-only.yml", absoluteFilepathToDocsConfig })
        ).rejects.toThrowError(/the file is empty/);
    });

    it("fails when redirects and filepaths are mixed", async () => {
        // docs.yml validation rejects this shape, so it has to be constructed by hand here
        const mixed = [
            "./redirects.yml",
            { source: "/old-seeds", destination: "/seeds" }
        ] as docsYml.RawSchemas.RedirectsConfiguration;
        await expect(resolveRedirects({ redirects: mixed, absoluteFilepathToDocsConfig })).rejects.toThrowError(
            /not a mix of both/
        );
    });

    it("fails when one of several filepaths does not exist", async () => {
        await expect(
            resolveRedirects({ redirects: ["./redirects.yml", "./missing.yml"], absoluteFilepathToDocsConfig })
        ).rejects.toThrowError(/does not exist/);
    });

    it("reports every invalid file, not just the first", async () => {
        const error = await resolveRedirects({
            redirects: ["./comments-only.yml", "./redirects.yml", "./missing.yml", "./invalid.yml"],
            absoluteFilepathToDocsConfig
        }).then(
            () => undefined,
            (thrown: unknown) => thrown
        );
        expect(error).toBeInstanceOf(Error);
        const message = error instanceof Error ? error.message : "";
        expect(message).toMatch(/comments-only\.yml: the file is empty/);
        expect(message).toMatch(/missing\.yml does not exist/);
        expect(message).toMatch(/invalid\.yml\. The file must contain only a `redirects` list/);
        expect(message).not.toMatch(/[/\\]redirects\.yml/);
    });

    it("fails when the file does not exist", async () => {
        await expect(
            resolveRedirects({ redirects: "./missing.yml", absoluteFilepathToDocsConfig })
        ).rejects.toThrowError(/does not exist/);
    });

    it("fails when the filepath points at a directory", async () => {
        await expect(resolveRedirects({ redirects: "./nested", absoluteFilepathToDocsConfig })).rejects.toThrowError(
            /is not a file/
        );
    });

    it("fails when the filepath is empty", async () => {
        await expect(resolveRedirects({ redirects: "", absoluteFilepathToDocsConfig })).rejects.toThrowError(
            /contains an empty filepath/
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
        ).rejects.toThrowError(/must nest the list under a top-level `redirects` key/);
    });
});

describe("getRedirectsFilepaths", () => {
    const absoluteFilepathToDocsConfig = join(AbsoluteFilePath.of("/tmp/fern"), RelativeFilePath.of("docs.yml"));

    it("returns nothing for an inline list", () => {
        expect(
            getRedirectsFilepaths({
                redirects: [{ source: "/old-plants", destination: "/plants" }],
                absoluteFilepathToDocsConfig
            })
        ).toEqual([]);
        expect(getRedirectsFilepaths({ redirects: undefined, absoluteFilepathToDocsConfig })).toEqual([]);
    });

    it("resolves single and multiple filepaths against the docs config", () => {
        expect(getRedirectsFilepaths({ redirects: "../redirects.yml", absoluteFilepathToDocsConfig })).toEqual([
            "/tmp/redirects.yml"
        ]);
        expect(
            getRedirectsFilepaths({
                redirects: ["./redirects/a.yml", "../b.yml"],
                absoluteFilepathToDocsConfig
            })
        ).toEqual(["/tmp/fern/redirects/a.yml", "/tmp/b.yml"]);
    });
});
