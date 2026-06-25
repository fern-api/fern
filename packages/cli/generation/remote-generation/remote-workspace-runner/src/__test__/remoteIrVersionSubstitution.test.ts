import { describe, expect, it } from "vitest";

import { isAutoVersion, MAGIC_VERSION } from "@fern-api/generator-cli/autoversion";

/**
 * Tests for the IR version substitution logic in runRemoteGenerationForGenerator.
 *
 * When --version AUTO is passed, the remote generation path must substitute
 * the safe magic placeholder (MAGIC_VERSION) before passing the version to
 * generateIntermediateRepresentation(). This ensures that User-Agent headers
 * and X-Fern-SDK-Version fields in generated SDKs get the placeholder (which
 * Fiddle's AutoVersionStep will correctly replace post-generation) rather than
 * the literal "AUTO" string.
 *
 * This mirrors the local generation fix (PR #16675) for the remote/Fiddle path.
 */
describe("remote IR version substitution", () => {
    /**
     * Replicates the effectiveIrVersion computation from runRemoteGenerationForGenerator.
     * This is the core logic being tested.
     */
    function computeEffectiveIrVersion(resolvedVersion: string | undefined): string | undefined {
        return resolvedVersion != null && isAutoVersion(resolvedVersion) ? MAGIC_VERSION : resolvedVersion;
    }

    it("substitutes MAGIC_VERSION when resolvedVersion is 'AUTO'", () => {
        expect(computeEffectiveIrVersion("AUTO")).toBe(MAGIC_VERSION);
    });

    it("substitutes MAGIC_VERSION when resolvedVersion is 'auto' (case-insensitive)", () => {
        expect(computeEffectiveIrVersion("auto")).toBe(MAGIC_VERSION);
    });

    it("substitutes MAGIC_VERSION when resolvedVersion is 'Auto' (mixed case)", () => {
        expect(computeEffectiveIrVersion("Auto")).toBe(MAGIC_VERSION);
    });

    it("passes through explicit version strings unchanged", () => {
        expect(computeEffectiveIrVersion("1.2.3")).toBe("1.2.3");
        expect(computeEffectiveIrVersion("v2.0.0")).toBe("v2.0.0");
        expect(computeEffectiveIrVersion("0.1.0-beta.1")).toBe("0.1.0-beta.1");
    });

    it("passes through undefined unchanged", () => {
        expect(computeEffectiveIrVersion(undefined)).toBeUndefined();
    });

    it("ensures MAGIC_VERSION is a safe placeholder that won't match code identifiers", () => {
        // The magic version should never appear as a substring in common code identifiers
        const codeIdentifiers = [
            "SENSOR_MODE_AUTO",
            "CORRELATION_TYPE_AUTOMATED",
            "AUTO_DETECT",
            "AutoScaling",
            "isAutomatic"
        ];
        for (const identifier of codeIdentifiers) {
            expect(identifier).not.toContain(MAGIC_VERSION);
        }
    });
});
