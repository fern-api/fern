import { readFile } from "node:fs/promises";
import path from "node:path";
import { applyOpenAPIOverlay, mergeWithOverrides, type Overlay } from "@fern-api/core-utils";
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
 * Finds Fern OpenAPI extensions that legacy generators honor and SDK Config generators do not, in each migrated
 * spec after its overrides and overlays are applied.
 */
export async function scanSourceSpecExtensions(
    specs: ResolvedMigrationSourceSpec[]
): Promise<FernConfigMappingDiagnostic[]> {
    const diagnostics = await Promise.all(
        specs
            .filter(isResolvedMigrationFileSpec)
            .filter((spec) => spec.type === "openapi")
            .map((spec) => scanSpec(spec.absolutePath, spec.absoluteOverridePaths, spec.absoluteOverlayPaths))
    );
    return diagnostics.flat();
}

async function scanSpec(
    absolutePath: string,
    absoluteOverridePaths: string[],
    absoluteOverlayPaths: string[]
): Promise<FernConfigMappingDiagnostic[]> {
    let document: unknown;
    try {
        document = await readYaml(absolutePath);
        for (const overridePath of absoluteOverridePaths) {
            const overrides = await readYaml(overridePath);
            if (isObject(document) && isObject(overrides)) {
                document = mergeWithOverrides({ data: document, overrides });
            }
        }
        for (const overlayPath of absoluteOverlayPaths) {
            const overlay = await readYaml(overlayPath);
            if (isObject(document) && isObject(overlay) && Array.isArray(overlay.actions)) {
                document = applyOpenAPIOverlay({ data: document, overlay: overlay as unknown as Overlay });
            }
        }
    } catch {
        // Unreadable specs, overrides, and overlays fail later with a clearer error from the generator.
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

async function readYaml(absolutePath: string): Promise<unknown> {
    return YAML.parse(await readFile(absolutePath, "utf8"));
}

function isObject(value: unknown): value is Record<string, unknown> {
    return value != null && typeof value === "object" && !Array.isArray(value);
}
