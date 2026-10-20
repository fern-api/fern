import path from "node:path";
import { describe, expect, it } from "vitest";

import { useTemporaryDirectories } from "../../__test__/fixtures.js";
import { findDocsConfigFile, findGeneratorsFile, findReadableSdkConfigFile, findSdkConfigFile } from "../index.js";

describe("findGeneratorsFile", () => {
    const createDirectory = useTemporaryDirectories();

    it.each([
        { name: "no generators file", files: [], expected: { type: "none" } },
        { name: "generators.yml", files: ["generators.yml"], expected: { type: "found", name: "generators.yml" } },
        { name: "generators.yaml", files: ["generators.yaml"], expected: { type: "found", name: "generators.yaml" } },
        {
            name: "generators.legacy.yml",
            files: ["generators.legacy.yml"],
            expected: { type: "found", name: "generators.legacy.yml" }
        },
        {
            name: "generators.yml wins over generators.yaml",
            files: ["generators.yml", "generators.yaml"],
            expected: { type: "found", name: "generators.yml" }
        },
        {
            name: "generators.yml beside the legacy file",
            files: ["generators.yml", "generators.legacy.yml"],
            expected: { type: "conflict", activeName: "generators.yml" }
        },
        {
            name: "generators.yaml beside the legacy file",
            files: ["generators.yaml", "generators.legacy.yml"],
            expected: { type: "conflict", activeName: "generators.yaml" }
        },
        {
            name: "all three (the conflict names generators.yml)",
            files: ["generators.yml", "generators.yaml", "generators.legacy.yml"],
            expected: { type: "conflict", activeName: "generators.yml" }
        }
    ] as const)("$name", async ({ files, expected }) => {
        const directory = await createDirectory(Object.fromEntries(files.map((file) => [file, ""])));

        const result = await findGeneratorsFile(directory);

        if (expected.type === "found") {
            expect(result).toEqual({ ...expected, path: path.join(directory, expected.name) });
        } else {
            expect(result).toEqual(expected);
        }
    });
});

describe("findSdkConfigFile", () => {
    const createDirectory = useTemporaryDirectories();

    it("finds sdk-config.yml", async () => {
        const directory = await createDirectory({ "sdk-config.yml": "" });

        expect(await findSdkConfigFile(directory)).toBe(path.join(directory, "sdk-config.yml"));
    });

    it("does not recognize sdk-config.yaml", async () => {
        const directory = await createDirectory({ "sdk-config.yaml": "" });

        expect(await findSdkConfigFile(directory)).toBeUndefined();
    });

    it("returns undefined when there is no sdk config", async () => {
        const directory = await createDirectory({ "generators.yml": "" });

        expect(await findSdkConfigFile(directory)).toBeUndefined();
    });

    it("counts a folder called sdk-config.yml", async () => {
        const directory = await createDirectory({ "sdk-config.yml/placeholder": "" });

        expect(await findSdkConfigFile(directory)).toBe(path.join(directory, "sdk-config.yml"));
    });
});

describe("findReadableSdkConfigFile", () => {
    const createDirectory = useTemporaryDirectories();

    it("finds sdk-config.yml", async () => {
        const directory = await createDirectory({ "sdk-config.yml": "" });

        expect(await findReadableSdkConfigFile(directory)).toBe(path.join(directory, "sdk-config.yml"));
    });

    it("finds sdk-config.yaml", async () => {
        const directory = await createDirectory({ "sdk-config.yaml": "" });

        expect(await findReadableSdkConfigFile(directory)).toBe(path.join(directory, "sdk-config.yaml"));
    });

    it("prefers sdk-config.yml over sdk-config.yaml", async () => {
        const directory = await createDirectory({ "sdk-config.yml": "", "sdk-config.yaml": "" });

        expect(await findReadableSdkConfigFile(directory)).toBe(path.join(directory, "sdk-config.yml"));
    });

    it("skips a folder called sdk-config.yml", async () => {
        const directory = await createDirectory({ "sdk-config.yml/placeholder": "", "sdk-config.yaml": "" });

        expect(await findReadableSdkConfigFile(directory)).toBe(path.join(directory, "sdk-config.yaml"));
    });

    it("returns undefined when there is no sdk config", async () => {
        const directory = await createDirectory({});

        expect(await findReadableSdkConfigFile(directory)).toBeUndefined();
    });
});

describe("findDocsConfigFile", () => {
    const createDirectory = useTemporaryDirectories();

    it("finds docs.yml", async () => {
        const directory = await createDirectory({ "docs.yml": "" });

        expect(await findDocsConfigFile(directory)).toBe(path.join(directory, "docs.yml"));
    });

    it("does not recognize docs.yaml", async () => {
        const directory = await createDirectory({ "docs.yaml": "" });

        expect(await findDocsConfigFile(directory)).toBeUndefined();
    });
});
