import { isOpenAPIV2 } from "@fern-api/api-workspace-commons";
import { RelativeFilePath, relative } from "@fern-api/fs-utils";
import { convertOpenAPIV2ToV3, loadOpenAPI } from "@fern-api/lazy-fern-workspace";
import { readFile } from "fs/promises";

import { Rule } from "../../Rule";
import { ValidationViolation } from "../../ValidationViolation";

interface TypeInfo {
    specFile: RelativeFilePath;
    namespace: string | undefined;
}

export const NoDuplicateTypesRule: Rule = {
    name: "no-duplicate-types",
    run: async ({ workspace, specs, context }) => {
        const violations: ValidationViolation[] = [];
        const typesByName = new Map<string, TypeInfo[]>();

        for (const spec of specs) {
            const contents = (await readFile(spec.absoluteFilepath)).toString();

            if (contents.includes("openapi") || contents.includes("swagger")) {
                const openAPI = await loadOpenAPI({
                    absolutePathToOpenAPI: spec.absoluteFilepath,
                    context,
                    absolutePathToOpenAPIOverrides: spec.absoluteFilepathToOverrides
                });

                const apiToValidate = isOpenAPIV2(openAPI) ? await convertOpenAPIV2ToV3(openAPI) : openAPI;
                const relativeFilepath = relative(workspace.absoluteFilePath, spec.source.file);

                for (const typeName of Object.keys(apiToValidate.components?.schemas ?? {})) {
                    const existingTypes = typesByName.get(typeName) || [];
                    existingTypes.push({
                        specFile: relativeFilepath,
                        namespace: spec.namespace
                    });
                    typesByName.set(typeName, existingTypes);
                }
            }
        }

        // Check for collisions
        for (const [typeName, typeInfos] of typesByName.entries()) {
            if (typeInfos.length > 1) {
                // Group by namespace to find actual collisions
                // Types with the same namespace (or both without namespace) collide
                const namespaceGroups = new Map<string, TypeInfo[]>();
                for (const typeInfo of typeInfos) {
                    const key = typeInfo.namespace ?? "";
                    const group = namespaceGroups.get(key) || [];
                    group.push(typeInfo);
                    namespaceGroups.set(key, group);
                }

                // Check if any specs without namespace have collisions
                const specsWithoutNamespace = typeInfos.filter((t) => t.namespace == null);
                if (specsWithoutNamespace.length > 1) {
                    // Multiple specs define the same type without namespace - collision
                    const specFiles = specsWithoutNamespace.map((t) => t.specFile).join(", ");
                    for (const typeInfo of specsWithoutNamespace.slice(1)) {
                        violations.push({
                            severity: "fatal",
                            relativeFilepath: typeInfo.specFile,
                            nodePath: ["components", "schemas", typeName],
                            message: `Type "${typeName}" is defined in multiple specs (${specFiles}). Add "namespace" to your specs in generators.yml to resolve this conflict.`
                        });
                    }
                } else if (specsWithoutNamespace.length === 1 && typeInfos.length > 1) {
                    // One spec without namespace collides with specs that have namespace
                    const specWithoutNamespace = specsWithoutNamespace[0];
                    if (specWithoutNamespace != null) {
                        const allSpecFiles = typeInfos.map((t) => t.specFile).join(", ");
                        violations.push({
                            severity: "fatal",
                            relativeFilepath: specWithoutNamespace.specFile,
                            nodePath: ["components", "schemas", typeName],
                            message: `Type "${typeName}" is defined in multiple specs (${allSpecFiles}). Add "namespace" to your specs in generators.yml to resolve this conflict.`
                        });
                    }
                }

                // Check for collisions within the same namespace
                for (const [namespace, group] of namespaceGroups.entries()) {
                    if (namespace !== "" && group.length > 1) {
                        const specFiles = group.map((t) => t.specFile).join(", ");
                        for (const typeInfo of group.slice(1)) {
                            violations.push({
                                severity: "fatal",
                                relativeFilepath: typeInfo.specFile,
                                nodePath: ["components", "schemas", typeName],
                                message: `Type "${typeName}" is defined in multiple specs with the same namespace "${namespace}" (${specFiles}). Use different namespaces to resolve this conflict.`
                            });
                        }
                    }
                }
            }
        }

        return violations;
    }
};
