import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";

import { mkdtemp, writeFile } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import { beforeAll, describe, expect, it } from "vitest";

import { getProfileVarsFilepaths, loadProfiles, resolveProfiles } from "../resolveProfileVars.js";

describe("resolveProfiles", () => {
    let dir: AbsoluteFilePath;
    let absoluteFilepathToDocsConfig: AbsoluteFilePath;

    beforeAll(async () => {
        dir = AbsoluteFilePath.of(await mkdtemp(path.join(tmpdir(), "resolve-profile-vars-")));
        absoluteFilepathToDocsConfig = join(dir, RelativeFilePath.of("docs.yml"));
        await writeFile(join(dir, RelativeFilePath.of("common.yml")), "vars:\n  PRODUCT_NAME: NemoClaw\n");
        await writeFile(join(dir, RelativeFilePath.of("enterprise.yml")), "vars:\n  CLI: nemoclaw-ent\n");
        await writeFile(join(dir, RelativeFilePath.of("dupe.yml")), "vars:\n  PRODUCT_NAME: Other\n");
        await writeFile(join(dir, RelativeFilePath.of("bare.yml")), "CLI: nemoclaw\n");
        await writeFile(join(dir, RelativeFilePath.of("env.yml")), "vars:\n  SITE_URL: ${SITE_URL}\n");
    });

    it("passes through inline vars and undefined", async () => {
        const profiles = { community: { vars: { CLI: "nemoclaw" }, tags: ["oss"] } };
        expect(await resolveProfiles({ profiles, absoluteFilepathToDocsConfig })).toEqual(profiles);
        expect(await resolveProfiles({ profiles: undefined, absoluteFilepathToDocsConfig })).toBeUndefined();
    });

    it("loads vars from one file", async () => {
        expect(
            await resolveProfiles({ profiles: { ent: { vars: "./enterprise.yml" } }, absoluteFilepathToDocsConfig })
        ).toEqual({ ent: { vars: { CLI: "nemoclaw-ent" } } });
    });

    it("merges vars from several files", async () => {
        expect(
            await resolveProfiles({
                profiles: { ent: { vars: ["./common.yml", "./enterprise.yml"], tags: ["sso"] } },
                absoluteFilepathToDocsConfig
            })
        ).toEqual({ ent: { vars: { PRODUCT_NAME: "NemoClaw", CLI: "nemoclaw-ent" }, tags: ["sso"] } });
    });

    it("keeps ${NAME} in file values for later env substitution", async () => {
        expect(
            await resolveProfiles({ profiles: { ent: { vars: "./env.yml" } }, absoluteFilepathToDocsConfig })
        ).toEqual({ ent: { vars: { SITE_URL: "${SITE_URL}" } } });
    });

    it("errors on a name defined in two files", async () => {
        const { errors } = await loadProfiles({
            profiles: { ent: { vars: ["./common.yml", "./dupe.yml"] } },
            absoluteFilepathToDocsConfig
        });
        expect(errors).toEqual([
            'Failed to load vars for profile "ent": PRODUCT_NAME is defined in both ./common.yml and ./dupe.yml'
        ]);
    });

    it("errors on a missing file and on a file without a vars key", async () => {
        await expect(
            resolveProfiles({
                profiles: { ent: { vars: ["./missing.yml", "./bare.yml"] } },
                absoluteFilepathToDocsConfig
            })
        ).rejects.toThrow(/missing\.yml does not exist[\s\S]*bare\.yml\. The file must contain only a `vars` map/);
    });

    it("lists referenced files", () => {
        expect(
            getProfileVarsFilepaths({
                profiles: { a: { vars: "./common.yml" }, b: { vars: { X: "y" } }, c: { vars: ["./enterprise.yml"] } },
                absoluteFilepathToDocsConfig
            })
        ).toEqual([join(dir, RelativeFilePath.of("common.yml")), join(dir, RelativeFilePath.of("enterprise.yml"))]);
    });
});
