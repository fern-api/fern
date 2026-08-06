import { FernIr } from "@fern-fern/ir-sdk";
import { describe, expect, it } from "vitest";

import { getFilesystemPackagistPublishTarget } from "../filesystem-packagist-publish-target.js";

type IntermediateRepresentation = FernIr.IntermediateRepresentation;

function buildIr(publishConfig: unknown): IntermediateRepresentation {
    // Test mock: only `publishConfig` is read by the extractor.
    return { publishConfig } as IntermediateRepresentation;
}

describe("getFilesystemPackagistPublishTarget", () => {
    it("extracts version and package name from a packagist filesystem publish target", () => {
        const target = getFilesystemPackagistPublishTarget(
            buildIr({
                type: "filesystem",
                generateFullProject: false,
                publishTarget: { type: "packagist", version: "0.0.1", packageName: "twilio/twilio-core" }
            })
        );
        expect(target).toEqual({ version: "0.0.1", packageName: "twilio/twilio-core" });
    });

    it("returns undefined when the publish config is missing", () => {
        expect(getFilesystemPackagistPublishTarget(buildIr(undefined))).toBeUndefined();
    });

    it("returns undefined for non-filesystem publish configs", () => {
        expect(
            getFilesystemPackagistPublishTarget(
                buildIr({ type: "github", owner: "org", repo: "repo", target: { type: "packagist" } })
            )
        ).toBeUndefined();
    });

    it("returns undefined for filesystem configs with a non-packagist target", () => {
        expect(
            getFilesystemPackagistPublishTarget(
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
            getFilesystemPackagistPublishTarget(
                buildIr({
                    type: "filesystem",
                    generateFullProject: false,
                    publishTarget: { type: "packagist", version: 1, packageName: null }
                })
            )
        ).toEqual({ version: undefined, packageName: undefined });
    });
});
