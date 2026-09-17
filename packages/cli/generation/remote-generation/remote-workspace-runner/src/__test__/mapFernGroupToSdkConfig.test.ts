import type { FernConfigMappingDiagnostic } from "@postman/sdk-config/sdk-config/v1";
import { describe, expect, it } from "vitest";

import { formatSdkConfigMappingDiagnostic } from "../mapFernGroupToSdkConfig.js";

function diagnostic(overrides: Partial<FernConfigMappingDiagnostic> = {}): FernConfigMappingDiagnostic {
    return {
        severity: "warning",
        code: "unsupported-field",
        path: ["generators", 0, "config"],
        reason: "This field is not supported.",
        suggestedAction: "Remove the field.",
        ...overrides
    };
}

describe("formatSdkConfigMappingDiagnostic", () => {
    it("formats a diagnostic without an SDK Config path", () => {
        expect(formatSdkConfigMappingDiagnostic(diagnostic())).toBe(
            "[warning] [unsupported-field] generators.0.config: This field is not supported.; Remove the field."
        );
    });

    it("formats a diagnostic with an SDK Config path", () => {
        expect(
            formatSdkConfigMappingDiagnostic(
                diagnostic({ severity: "error", sdkConfigPath: ["targets", 0, "generation"] })
            )
        ).toBe(
            "[error] [unsupported-field] generators.0.config: This field is not supported.; SDK Config: targets.0.generation; Remove the field."
        );
    });
});
