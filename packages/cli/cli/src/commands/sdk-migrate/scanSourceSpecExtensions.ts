import { readFile } from "node:fs/promises";
import path from "node:path";
import type { FernConfigMappingDiagnostic } from "@postman/sdk-config/sdk-config/v1";
import YAML from "yaml";
import { isResolvedMigrationFileSpec, type ResolvedMigrationSourceSpec } from "./projectMigrationSource.js";

const SPEC_EXTENSION_UNSUPPORTED = "FERN_SPEC_EXTENSION_UNSUPPORTED";

const UNSUPPORTED_EXTENSIONS: Record<string, { reason: string; suggestedAction: string }> = {
    "x-fern-base-path": {
        reason: "SDK Config generators ignore x-fern-base-path, so generated requests omit the base path",
        suggestedAction: "Add the base path to each server URL or environment URL, or to every path in the spec."
    },
    "x-fern-sdk-variables": {
        reason: "SDK Config generators ignore x-fern-sdk-variables, so each variable becomes a parameter on every request instead of a client option",
        suggestedAction: "Confirm the generated SDK can take the variable as a request parameter before generating."
    }
};

/**
 * Finds Fern OpenAPI extensions in the migrated specs and overlays that legacy generators honor and SDK Config
 * generators do not.
 */
export async function scanSourceSpecExtensions(
    specs: ResolvedMigrationSourceSpec[]
): Promise<FernConfigMappingDiagnostic[]> {
    const files = [
        ...new Set(
            specs
                .filter(isResolvedMigrationFileSpec)
                .filter((spec) => spec.type === "openapi")
                .flatMap((spec) => [spec.absolutePath, ...spec.absoluteOverlayPaths])
        )
    ];
    const diagnostics = await Promise.all(files.map(scanFile));
    return diagnostics.flat();
}

async function scanFile(absolutePath: string): Promise<FernConfigMappingDiagnostic[]> {
    let document: unknown;
    try {
        document = YAML.parse(await readFile(absolutePath, "utf8"));
    } catch {
        // Unreadable specs fail later with a clearer error from the generator.
        return [];
    }
    const found = findExtensions(document);
    const file = path.basename(absolutePath);
    return [
        ...[...found.extensions].map((extension) => ({
            code: SPEC_EXTENSION_UNSUPPORTED,
            severity: "warning" as const,
            path: [file, extension],
            // biome-ignore lint/style/noNonNullAssertion: extensions only holds keys of UNSUPPORTED_EXTENSIONS
            reason: `${UNSUPPORTED_EXTENSIONS[extension]!.reason}.`,
            // biome-ignore lint/style/noNonNullAssertion: extensions only holds keys of UNSUPPORTED_EXTENSIONS
            suggestedAction: UNSUPPORTED_EXTENSIONS[extension]!.suggestedAction
        })),
        ...(found.offsetPaginationWithoutStep === 0
            ? []
            : [
                  {
                      code: SPEC_EXTENSION_UNSUPPORTED,
                      severity: "warning" as const,
                      path: [file, "x-fern-pagination", "step"],
                      reason: `${found.offsetPaginationWithoutStep} offset x-fern-pagination configuration(s) have no 'step'. Python and Go SDK Config generators skip auto-pagination for them.`,
                      suggestedAction:
                          "Set 'step' to the request's page size parameter (for example `step: $request.limit`) on each offset x-fern-pagination."
                  }
              ])
    ];
}

function findExtensions(document: unknown): { extensions: Set<string>; offsetPaginationWithoutStep: number } {
    const extensions = new Set<string>();
    let offsetPaginationWithoutStep = 0;
    const visit = (value: unknown): void => {
        if (Array.isArray(value)) {
            value.forEach(visit);
            return;
        }
        if (value == null || typeof value !== "object") {
            return;
        }
        for (const [key, child] of Object.entries(value)) {
            if (key in UNSUPPORTED_EXTENSIONS) {
                extensions.add(key);
            }
            if (key === "x-fern-pagination" && isOffsetPaginationWithoutStep(child)) {
                offsetPaginationWithoutStep += 1;
            }
            visit(child);
        }
    };
    visit(document);
    return { extensions, offsetPaginationWithoutStep };
}

function isOffsetPaginationWithoutStep(value: unknown): boolean {
    return value != null && typeof value === "object" && "offset" in value && !("step" in value);
}
