import { FernFiddle } from "@fern-fern/fiddle-sdk";
import { describe, expect, it } from "vitest";

import { extractPublishTarget } from "../publishTarget.js";

// Test helper: Fiddle's Package type requires a `status` field that this extractor never reads.
// The cast sidesteps the status enum (whose exact shape is internal to the Fiddle SDK and
// irrelevant to `extractPublishTarget`'s contract — it only visits `coordinate`). This is the
// CLAUDE.md-documented exception for test mocks.
function pkg(coordinate: FernFiddle.remoteGen.PackageCoordinate): FernFiddle.remoteGen.Package {
    return { coordinate } as unknown as FernFiddle.remoteGen.Package;
}

describe("extractPublishTarget", () => {
    it("returns undefined when the task produced no packages", () => {
        expect(extractPublishTarget([])).toBeUndefined();
    });

    it("builds an npm target with the canonical package-version URL", () => {
        const result = extractPublishTarget([
            pkg(FernFiddle.remoteGen.PackageCoordinate.npm({ name: "@acme/sdk", version: "0.1.0" }))
        ]);
        expect(result).toEqual({
            registry: "npm",
            label: "npm",
            version: "0.1.0",
            url: "https://www.npmjs.com/package/@acme/sdk/v/0.1.0"
        });
    });

    it("builds a Maven Central target with the group/artifact/version URL", () => {
        const result = extractPublishTarget([
            pkg(
                FernFiddle.remoteGen.PackageCoordinate.maven({
                    group: "com.acme",
                    artifact: "sdk",
                    version: "1.2.3"
                })
            )
        ]);
        expect(result).toEqual({
            registry: "maven",
            label: "Maven Central",
            version: "1.2.3",
            url: "https://central.sonatype.com/artifact/com.acme/sdk/1.2.3"
        });
    });

    it("builds a PyPI target", () => {
        const result = extractPublishTarget([
            pkg(FernFiddle.remoteGen.PackageCoordinate.pypi({ name: "acme-sdk", version: "2.0.0" }))
        ]);
        expect(result).toEqual({
            registry: "pypi",
            label: "PyPI",
            version: "2.0.0",
            url: "https://pypi.org/project/acme-sdk/2.0.0/"
        });
    });

    it("builds a RubyGems target", () => {
        const result = extractPublishTarget([
            pkg(FernFiddle.remoteGen.PackageCoordinate.ruby({ name: "acme_sdk", version: "0.5.0" }))
        ]);
        expect(result).toEqual({
            registry: "rubygems",
            label: "RubyGems",
            version: "0.5.0",
            url: "https://rubygems.org/gems/acme_sdk/versions/0.5.0"
        });
    });

    it("builds a NuGet target", () => {
        const result = extractPublishTarget([
            pkg(FernFiddle.remoteGen.PackageCoordinate.nuget({ name: "Acme.Sdk", version: "3.1.4" }))
        ]);
        expect(result).toEqual({
            registry: "nuget",
            label: "NuGet",
            version: "3.1.4",
            url: "https://www.nuget.org/packages/Acme.Sdk/3.1.4"
        });
    });

    it("builds a crates.io target", () => {
        const result = extractPublishTarget([
            pkg(FernFiddle.remoteGen.PackageCoordinate.crates({ name: "acme-sdk", version: "0.9.0" }))
        ]);
        expect(result).toEqual({
            registry: "crates",
            label: "crates.io",
            version: "0.9.0",
            url: "https://crates.io/crates/acme-sdk/0.9.0"
        });
    });

    it("uses the first package when multiple are present (multi-registry publish)", () => {
        const result = extractPublishTarget([
            pkg(FernFiddle.remoteGen.PackageCoordinate.npm({ name: "@acme/sdk", version: "0.1.0" })),
            pkg(FernFiddle.remoteGen.PackageCoordinate.pypi({ name: "acme-sdk", version: "0.1.0" }))
        ]);
        expect(result?.registry).toBe("npm");
    });
});
