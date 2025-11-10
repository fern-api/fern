import { isOpenAPIV2 } from "@fern-api/api-workspace-commons";
import { relative } from "@fern-api/fs-utils";
import { convertOpenAPIV2ToV3, loadOpenAPI } from "@fern-api/lazy-fern-workspace";
import { readFile } from "fs/promises";

import { Rule } from "../../Rule";
import { ValidationViolation } from "../../ValidationViolation";

export const NoDuplicateOverridesRule: Rule = {
    name: "no-duplicate-overrides",
    run: async ({ workspace, specs, context }) => {
        const violations: ValidationViolation[] = [];
        const seenMethodsByAudience = new Map<string, string[][]>();
        const seenGroupNames = new Set<string>();

        for (const spec of specs) {
            const contents = (await readFile(spec.absoluteFilepath)).toString();

            if (contents.includes("openapi") || contents.includes("swagger")) {
                const openAPI = await loadOpenAPI({
                    absolutePathToOpenAPI: spec.absoluteFilepath,
                    context,
                    absolutePathToOpenAPIOverrides: spec.absoluteFilepathToOverrides
                });

                const apiToValidate = isOpenAPIV2(openAPI) ? await convertOpenAPIV2ToV3(openAPI) : openAPI;

                for (const [path, pathItem] of Object.entries(apiToValidate.paths ?? {})) {
                    for (const [method, operation] of Object.entries(pathItem ?? {})) {
                        if (method === "parameters" || method === "$ref") {
                            continue;
                        }

                        const operationObj = operation as {
                            "x-fern-sdk-group-name"?: string | string[];
                            "x-fern-sdk-method-name"?: string;
                            "x-fern-audiences"?: string | string[];
                        };
                        const rawSdkGroupName = operationObj?.["x-fern-sdk-group-name"];
                        const sdkGroupName = Array.isArray(rawSdkGroupName)
                            ? rawSdkGroupName.join(".")
                            : rawSdkGroupName;
                        const sdkMethodName = operationObj?.["x-fern-sdk-method-name"];

                        if (sdkGroupName && sdkMethodName) {
                            const rawAudiences = operationObj?.["x-fern-audiences"];
                            const audiences: string[] = rawAudiences
                                ? Array.isArray(rawAudiences)
                                    ? rawAudiences.map((a) => a.trim()).filter((a) => a.length > 0)
                                    : [rawAudiences.trim()].filter((a) => a.length > 0)
                                : [];

                            const key = `${sdkGroupName}:${sdkMethodName}`;
                            const previousAudienceSets = seenMethodsByAudience.get(key) || [];

                            for (const prevAudiences of previousAudienceSets) {
                                if (audiencesIntersect(audiences, prevAudiences)) {
                                    violations.push({
                                        severity: "fatal",
                                        relativeFilepath: relative(workspace.absoluteFilePath, spec.source.file),
                                        nodePath: ["paths", path, method],
                                        message: `SDK method ${sdkGroupName}.${sdkMethodName} already exists (x-fern-sdk-group-name: ${sdkGroupName}, x-fern-sdk-method-name: ${sdkMethodName})`
                                    });
                                    break; // Only report once per operation
                                }
                            }

                            previousAudienceSets.push(audiences);
                            seenMethodsByAudience.set(key, previousAudienceSets);
                        }
                    }
                }
            }
        }
        return violations;
    }
};

/**
 * Check if two audience sets intersect.
 * Empty arrays are treated as wildcards (match everything).
 */
function audiencesIntersect(a: string[], b: string[]): boolean {
    if (a.length === 0 || b.length === 0) {
        return true;
    }
    return a.some((aud) => b.includes(aud));
}
