import type { FernSdkConfigV1Payload } from "@fern-api/remote-workspace-runner";
import { createMockTaskContext } from "@fern-api/task-context";
import type { AbstractAPIWorkspace } from "@fern-api/workspace-loader";
import { describe, expect, it } from "vitest";

import { resolveGroupsForSdkConfig } from "../generateAPIWorkspaces.js";

describe("resolveGroupsForSdkConfig", () => {
    it("selects the generator groups that exactly cover every SDK Config target", () => {
        const workspace = createWorkspace([
            { name: "typescript", generators: ["fernapi/fern-typescript-sdk"] },
            { name: "python", generators: ["fernapi/fern-python-sdk"] },
            { name: "java", generators: ["fernapi/fern-java-sdk"] }
        ]);

        expect(
            resolveGroupsForSdkConfig({
                workspace,
                sdkConfigV1: createSdkConfig(["typescript", "python"]),
                context: createMockTaskContext()
            })
        ).toEqual(["python", "typescript"]);
    });

    it("prefers one multi-language group over separate groups", () => {
        const workspace = createWorkspace([
            {
                name: "production",
                generators: ["fernapi/fern-typescript-sdk", "fernapi/fern-python-sdk"]
            },
            { name: "typescript", generators: ["fernapi/fern-typescript-sdk"] },
            { name: "python", generators: ["fernapi/fern-python-sdk"] }
        ]);

        expect(
            resolveGroupsForSdkConfig({
                workspace,
                sdkConfigV1: createSdkConfig(["typescript", "python"]),
                context: createMockTaskContext()
            })
        ).toEqual(["production"]);
    });

    it("uses the default group to disambiguate equivalent target coverage", () => {
        const workspace = createWorkspace(
            [
                { name: "typescript-preview", generators: ["fernapi/fern-typescript-sdk"] },
                { name: "typescript-production", generators: ["fernapi/fern-typescript-sdk"] }
            ],
            "typescript-production"
        );

        expect(
            resolveGroupsForSdkConfig({
                workspace,
                sdkConfigV1: createSdkConfig(["typescript"]),
                context: createMockTaskContext()
            })
        ).toEqual(["typescript-production"]);
    });

    it("requires an explicit group when equivalent candidates are ambiguous", () => {
        const workspace = createWorkspace([
            { name: "typescript-preview", generators: ["fernapi/fern-typescript-sdk"] },
            { name: "typescript-production", generators: ["fernapi/fern-typescript-sdk"] }
        ]);

        expect(() =>
            resolveGroupsForSdkConfig({
                workspace,
                sdkConfigV1: createSdkConfig(["typescript"]),
                context: {
                    failAndThrow: (message: string) => {
                        throw new Error(message);
                    }
                } as never
            })
        ).toThrow("match multiple generator groups: typescript-preview, typescript-production");
    });
});

function createWorkspace(
    groups: Array<{ name: string; generators: string[] }>,
    defaultGroup?: string
): AbstractAPIWorkspace<unknown> {
    return {
        generatorsConfiguration: {
            absolutePathToConfiguration: "/tmp/generators.yml",
            defaultGroup,
            groups: groups.map((group) => ({
                groupName: group.name,
                generators: group.generators.map((name) => ({ name }))
            }))
        }
    } as unknown as AbstractAPIWorkspace<unknown>;
}

function createSdkConfig(languages: string[]): FernSdkConfigV1Payload {
    return {
        body: Buffer.from("{}"),
        sdkName: "api",
        sdkVersion: "1.0.0",
        targets: languages.map((language) => ({ language }))
    } as FernSdkConfigV1Payload;
}
