import { describe, expect, it } from "vitest";

import { GENERATORS_YML_FOUND, projectDir, SDK_CONFIG_FILE, workspaceDir } from "../../__test__/fixtures.js";
import { hasApiConfiguration, rootOwnsSdkConfig, shouldLoadApiWorkspaces } from "../project-decisions.js";

describe("hasApiConfiguration", () => {
    it.each([
        { name: "nothing", project: projectDir(), expected: false },
        { name: "an apis folder", project: projectDir({ apis: [] }), expected: true },
        { name: "definition/", project: projectDir({ root: { hasDefinitionDirectory: true } }), expected: true },
        {
            name: "a generators file",
            project: projectDir({ root: { generatorsFile: GENERATORS_YML_FOUND } }),
            expected: true
        },
        {
            name: "a generators conflict",
            project: projectDir({ root: { generatorsFile: { type: "conflict", activeName: "generators.yml" } } }),
            expected: true
        },
        { name: "openapi/ only", project: projectDir({ root: { hasOpenapiDirectory: true } }), expected: false },
        {
            name: "sdk-config.yml only",
            project: projectDir({ root: { sdkConfigFile: SDK_CONFIG_FILE } }),
            expected: false
        }
    ])("$name", ({ project, expected }) => {
        expect(hasApiConfiguration(project)).toBe(expected);
    });
});

describe("shouldLoadApiWorkspaces", () => {
    const base = { docsHaveInlineSpecs: false, skipApiWorkspaces: false };

    it.each([
        { name: "nothing", project: projectDir(), options: base, expected: false },
        { name: "api configuration", project: projectDir({ apis: [] }), options: base, expected: true },
        {
            name: "api configuration, with docs that list specs inline",
            project: projectDir({ apis: [] }),
            options: { ...base, docsHaveInlineSpecs: true },
            expected: true
        },
        {
            name: "openapi/",
            project: projectDir({ root: { hasOpenapiDirectory: true } }),
            options: base,
            expected: true
        },
        {
            name: "asyncapi/",
            project: projectDir({ root: { hasAsyncapiDirectory: true } }),
            options: base,
            expected: true
        },
        {
            name: "openapi/ that docs.yml lists inline",
            project: projectDir({ root: { hasOpenapiDirectory: true } }),
            options: { ...base, docsHaveInlineSpecs: true },
            expected: false
        },
        {
            name: "asyncapi/ that docs.yml lists inline",
            project: projectDir({ root: { hasAsyncapiDirectory: true } }),
            options: { ...base, docsHaveInlineSpecs: true },
            expected: false
        },
        {
            name: "sdk-config.yml only",
            project: projectDir({ root: { sdkConfigFile: SDK_CONFIG_FILE } }),
            options: base,
            expected: false
        },
        {
            name: "sdk-config.yml only, skipping API workspaces",
            project: projectDir({ root: { sdkConfigFile: SDK_CONFIG_FILE } }),
            options: { ...base, skipApiWorkspaces: true },
            expected: true
        },
        {
            name: "nothing, skipping API workspaces",
            project: projectDir(),
            options: { ...base, skipApiWorkspaces: true },
            expected: false
        }
    ])("$name", ({ project, options, expected }) => {
        expect(shouldLoadApiWorkspaces({ project, ...options })).toBe(expected);
    });
});

describe("rootOwnsSdkConfig", () => {
    const withSdkConfig = { sdkConfigFile: SDK_CONFIG_FILE };
    const base = { apiRequested: false, skipApiWorkspaces: false, loadedApiCount: 0, sdkConfigOwnerCount: 0 };

    it.each([
        { name: "no sdk-config.yml at the root", project: projectDir(), options: base, expected: false },
        {
            name: "no sdk-config.yml at the root, with an apis folder",
            project: projectDir({ apis: [] }),
            options: base,
            expected: false
        },
        {
            name: "an sdk-config.yml and nothing else",
            project: projectDir({ root: withSdkConfig }),
            options: base,
            expected: true
        },
        {
            name: "an --api was requested",
            project: projectDir({ root: withSdkConfig, apis: [] }),
            options: { ...base, apiRequested: true },
            expected: false
        },
        {
            name: "an apis folder (the root owns it whatever is loaded)",
            project: projectDir({ root: withSdkConfig, apis: [workspaceFolder("a")] }),
            options: { ...base, loadedApiCount: 1, sdkConfigOwnerCount: 1 },
            expected: true
        },
        {
            name: "an apis folder, skipping API workspaces",
            project: projectDir({ root: withSdkConfig, apis: [] }),
            options: { ...base, skipApiWorkspaces: true },
            expected: true
        },
        {
            name: "no apis folder, but an API was loaded",
            project: projectDir({ root: withSdkConfig }),
            options: { ...base, loadedApiCount: 1 },
            expected: false
        },
        {
            name: "no apis folder, but another owner was collected",
            project: projectDir({ root: withSdkConfig }),
            options: { ...base, sdkConfigOwnerCount: 1 },
            expected: false
        },
        {
            name: "no apis folder, skipping API workspaces",
            project: projectDir({ root: withSdkConfig }),
            options: { ...base, skipApiWorkspaces: true },
            expected: false
        }
    ])("$name", ({ project, options, expected }) => {
        expect(rootOwnsSdkConfig({ project, ...options })).toBe(expected);
    });
});

function workspaceFolder(name: string): { name: string; dir: ReturnType<typeof workspaceDir> } {
    return { name, dir: workspaceDir() };
}
