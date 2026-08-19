import type { AbsoluteFilePath } from "@fern-api/fs-utils";
import type { ApiSpec } from "../../../api/config/ApiSpec.js";
import { isAsyncApiSpec } from "../../../api/config/AsyncApiSpec.js";
import { isOpenApiSpec } from "../../../api/config/OpenApiSpec.js";
import type { Workspace } from "../../../workspace/Workspace.js";

export interface SpecEntry {
    apiName: string;
    spec: ApiSpec;
    /** Absolute path to the spec file */
    specFilePath: AbsoluteFilePath;
    /** Absolute path(s) to override files, if any */
    overrides: AbsoluteFilePath[] | undefined;
    /** Absolute path to the overlay file, if any */
    overlays: AbsoluteFilePath | undefined;
}

/**
 * Returns specs from the workspace that support overrides (OpenAPI, AsyncAPI),
 * optionally filtered by API name.
 */
export function filterSpecs(workspace: Workspace, options: { api?: string }): SpecEntry[] {
    const results: SpecEntry[] = [];

    for (const [apiName, apiDef] of Object.entries(workspace.apis)) {
        if (options.api != null && apiName !== options.api) {
            continue;
        }

        for (const apiSpec of apiDef.specs) {
            let specFilePath: AbsoluteFilePath | undefined;
            let overrides: AbsoluteFilePath | AbsoluteFilePath[] | undefined;
            let overlays: AbsoluteFilePath | undefined;

            if (isOpenApiSpec(apiSpec)) {
                specFilePath = apiSpec.openapi;
                overrides = apiSpec.overrides;
                overlays = apiSpec.overlays;
            } else if (isAsyncApiSpec(apiSpec)) {
                specFilePath = apiSpec.asyncapi;
                overrides = apiSpec.overrides;
            } else {
                continue;
            }

            const overridesList = overrides == null ? undefined : Array.isArray(overrides) ? overrides : [overrides];

            results.push({ apiName, spec: apiSpec, specFilePath, overrides: overridesList, overlays });
        }
    }

    return results;
}
