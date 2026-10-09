import { FernIr } from "@fern-fern/ir-sdk";
import { describe, expect, it } from "vitest";

import { getFilesystemNugetPublishTarget } from "../filesystem-nuget-publish-target.js";

type IntermediateRepresentation = FernIr.IntermediateRepresentation;

function buildIr(publishConfig: unknown): IntermediateRepresentation {
    // Test mock: only `publishConfig` is read by the extractor.
    return { publishConfig } as IntermediateRepresentation;
}

describe("getFilesystemNugetPublishTarget", () => {
    it("extracts version and package name from a nuget filesystem publish target", () => {
        const target = getFilesystemNugetPublishTarget(
            buildIr({
                type: "filesystem",
                generateFullProject: false,
                publishTarget: { type: "nuget", version: "0.0.1", packageName: "twilio-core" }
            })
        );
        expect(target).toEqual({ version: "0.0.1", packageName: "twilio-core" });
    });

    it("returns undefined when the publish config is missing", () => {
        expect(getFilesystemNugetPublishTarget(buildIr(undefined))).toBeUndefined();
    });

    it("returns undefined for non-filesystem publish configs", () => {
        expect(
            getFilesystemNugetPublishTarget(
                buildIr({ type: "github", owner: "org", repo: "repo", target: { type: "nuget" } })
            )
        ).toBeUndefined();
    });

    it("returns undefined for filesystem configs with a non-nuget target", () => {
        expect(
            getFilesystemNugetPublishTarget(
                buildIr({
                    type: "filesystem",
                    generateFullProject: false,
                    publishTarget: { type: "npm", version: "0.0.1", packageName: "twilio-core" }
                })
            )
        ).toBeUndefined();
    });

    it("ignores non-string version and packageName values", () => {
        expect(
            getFilesystemNugetPublishTarget(
                buildIr({
                    type: "filesystem",
                    generateFullProject: false,
                    publishTarget: { type: "nuget", version: 1, packageName: null }
                })
            )
        ).toEqual({ version: undefined, packageName: undefined });
    });
});
