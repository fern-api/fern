import path from "node:path";
import { describe, expect, it } from "vitest";

import {
    GENERATORS_YML_FOUND,
    SDK_CONFIG_FILE,
    useTemporaryDirectories,
    workspaceDir
} from "../../__test__/fixtures.js";
import { anyDirectoryHasSdkConfig, hasGeneratorsFile, isSdkConfigOnly } from "../generation-config.js";

describe("hasGeneratorsFile", () => {
    it.each([
        { name: "none", generatorsFile: { type: "none" }, expected: false },
        { name: "found", generatorsFile: GENERATORS_YML_FOUND, expected: true },
        { name: "conflict", generatorsFile: { type: "conflict", activeName: "generators.yml" }, expected: true }
    ] as const)("$name", ({ generatorsFile, expected }) => {
        expect(hasGeneratorsFile(workspaceDir({ generatorsFile }))).toBe(expected);
    });
});

describe("isSdkConfigOnly", () => {
    it.each([
        { name: "sdk-config.yml alone", dir: workspaceDir({ sdkConfigFile: SDK_CONFIG_FILE }), expected: true },
        {
            name: "sdk-config.yml beside a generators file",
            dir: workspaceDir({ sdkConfigFile: SDK_CONFIG_FILE, generatorsFile: GENERATORS_YML_FOUND }),
            expected: false
        },
        {
            name: "sdk-config.yml beside a generators conflict",
            dir: workspaceDir({
                sdkConfigFile: SDK_CONFIG_FILE,
                generatorsFile: { type: "conflict", activeName: "generators.yml" }
            }),
            expected: false
        },
        {
            name: "a generators file alone",
            dir: workspaceDir({ generatorsFile: GENERATORS_YML_FOUND }),
            expected: false
        },
        { name: "nothing", dir: workspaceDir(), expected: false }
    ])("$name", ({ dir, expected }) => {
        expect(isSdkConfigOnly(dir)).toBe(expected);
    });
});

describe("anyDirectoryHasSdkConfig", () => {
    const createDirectory = useTemporaryDirectories();

    it("is false for no directories", async () => {
        expect(await anyDirectoryHasSdkConfig([])).toBe(false);
    });

    it("is false when no directory has an sdk-config.yml", async () => {
        const a = await createDirectory({ "generators.yml": "" });
        const b = await createDirectory({ "sdk-config.yaml": "" });

        expect(await anyDirectoryHasSdkConfig([a, b])).toBe(false);
    });

    it("is true when one directory has an sdk-config.yml, even beside a generators file", async () => {
        const a = await createDirectory({ "generators.yml": "" });
        const b = await createDirectory({ "generators.yml": "", "sdk-config.yml": "" });

        expect(await anyDirectoryHasSdkConfig([a, b])).toBe(true);
        expect(path.basename(b)).toBeTruthy();
    });
});
