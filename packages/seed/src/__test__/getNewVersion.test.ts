import { join } from "path";

import { createMockTaskContext } from "@fern-api/task-context";

import { getNewVersion } from "../commands/publish/publishGenerator";
import { getNewCliVersion } from "../utils/versionUtilities";

describe("Test getNewVersion", () => {
    it("get only version", async () => {
        const version = await getNewVersion({
            generatorId: "test",
            versionFilePair: {
                latestChangelogPath: join(__dirname, "assets/simple-versions.yml"),
                previousChangelogPath: join(__dirname, "assets/no-versions.yml")
            },
            context: createMockTaskContext()
        });

        expect(version).toEqual("0.39.10");
    });

    it("get max version", async () => {
        const version = await getNewVersion({
            generatorId: "test",
            versionFilePair: {
                latestChangelogPath: join(__dirname, "assets/add-multiple-versions.yml"),
                previousChangelogPath: join(__dirname, "assets/no-versions.yml")
            },
            context: createMockTaskContext()
        });

        expect(version).toEqual("0.40.10");
    });

    it("get max version with diff", async () => {
        const version = await getNewVersion({
            generatorId: "test",
            versionFilePair: {
                latestChangelogPath: join(__dirname, "assets/add-multiple-versions.yml"),
                previousChangelogPath: join(__dirname, "assets/simple-versions.yml")
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
                latestChangelogPath: join(__dirname, "assets/simple-versions.yml"),
                previousChangelogPath: join(__dirname, "assets/add-multiple-versions.yml")
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
                latestChangelogPath: join(__dirname, "assets/latest-isnt-global-max-versions.yml"),
                previousChangelogPath: join(__dirname, "assets/add-multiple-versions.yml")
            },
            context: createMockTaskContext()
        });
        expect(version).toEqual("0.39.12");
    });

    it("live test", async () => {
        const version = await getNewCliVersion({
            versionFilePair: {
                latestChangelogPath: join(__dirname, "assets/live-test/new.yml"),
                previousChangelogPath: join(__dirname, "assets/live-test/old.yml")
            },
            context: createMockTaskContext()
        });
        expect(version).toEqual("0.43.0");
    });
});
