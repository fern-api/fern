import { createMockTaskContext } from "@fern-api/task-context";
import { join } from "path";
import { getNewVersion } from "../commands/publish/publishGenerator";

describe("Test getNewVersion", () => {
    it("get only version", async () => {
        const version = await getNewVersion({
            generatorId: "test",
            versionFilePair: {
                latestVersionFile: join(__dirname, "assets/simple-versions.yml"),
                previousVersionFile: join(__dirname, "assets/no-versions.yml")
            },
            context: createMockTaskContext()
        });

        expect(version).toEqual("0.39.10");
    });

    it("get max version", async () => {
        const version = await getNewVersion({
            generatorId: "test",
            versionFilePair: {
                latestVersionFile: join(__dirname, "assets/add-multiple-versions.yml"),
                previousVersionFile: join(__dirname, "assets/no-versions.yml")
            },
            context: createMockTaskContext()
        });

        expect(version).toEqual("0.40.10");
    });

    it("get max version with diff", async () => {
        const version = await getNewVersion({
            generatorId: "test",
            versionFilePair: {
                latestVersionFile: join(__dirname, "assets/add-multiple-versions.yml"),
                previousVersionFile: join(__dirname, "assets/simple-versions.yml")
            },
            context: createMockTaskContext()
        });
        expect(version).toEqual("0.40.10");
    });

    it("no update", async () => {
        const version = await getNewVersion({
            generatorId: "test",
            versionFilePair: {
                // After this diff, there should be no versions coming from "latest" (e.g. ./assets/simple-versions.yml)
                latestVersionFile: join(__dirname, "assets/simple-versions.yml"),
                previousVersionFile: join(__dirname, "assets/add-multiple-versions.yml")
            },
            context: createMockTaskContext()
        });
        expect(version).toEqual(undefined);
    });

    // This test makes sure that we take the max latest version, even if it's not the max between the two files
    it("latest is not global max", async () => {
        const version = await getNewVersion({
            generatorId: "test",
            versionFilePair: {
                latestVersionFile: join(__dirname, "assets/latest-isnt-global-max-versions.yml"),
                previousVersionFile: join(__dirname, "assets/add-multiple-versions.yml")
            },
            context: createMockTaskContext()
        });
        expect(version).toEqual("0.39.12");
    });
});
