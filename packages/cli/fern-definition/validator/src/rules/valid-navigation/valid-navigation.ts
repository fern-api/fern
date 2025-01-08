import path from "path";

import { getAllDefinitionFiles, getAllNamedDefinitionFiles } from "@fern-api/api-workspace-commons";
import { FERN_PACKAGE_MARKER_FILENAME } from "@fern-api/configuration-loader";
import { keys } from "@fern-api/core-utils";
import { RelativeFilePath, dirname, join, relative } from "@fern-api/fs-utils";

import { Rule, RuleViolation } from "../../Rule";

export const ValidNavigationRule: Rule = {
    name: "valid-navigation",
    create: ({ workspace }) => {
        const allDefinitionFilepaths = keys(getAllDefinitionFiles(workspace.definition));
        const allNamedDefinitionFilepaths = keys(getAllNamedDefinitionFiles(workspace.definition));

        const directoryToChildren = allNamedDefinitionFilepaths.reduce<Record<RelativeFilePath, Set<string>>>(
            (acc, definitionFilepath) => {
                const children = (acc[dirname(definitionFilepath)] ??= new Set());
                children.add(path.basename(definitionFilepath));
                return acc;
            },
            {}
        );

        return {
            packageMarker: {
                navigation: (navigation, { relativeFilepath }) => {
                    if (navigation == null) {
                        return [];
                    }

                    if (typeof navigation === "string") {
                        const pathToNavigated = relative(
                            workspace.definition.absoluteFilePath,
                            join(
                                workspace.definition.absoluteFilePath,
                                dirname(relativeFilepath),
                                RelativeFilePath.of(navigation)
                            )
                        );
                        if (allDefinitionFilepaths.some((filepath) => filepath.startsWith(pathToNavigated))) {
                            return [];
                        } else {
                            return [
                                {
                                    severity: "error",
                                    message: `${navigation} does not exist.`
                                }
                            ];
                        }
                    }

                    const expectedItems = directoryToChildren[dirname(relativeFilepath)];
                    if (expectedItems == null) {
                        throw new Error(`Could not find expected contents of ${relativeFilepath}`);
                    }

                    const violations: RuleViolation[] = [];

                    const seen = new Set<string>();
                    for (const actualItem of navigation) {
                        if (actualItem === FERN_PACKAGE_MARKER_FILENAME) {
                            violations.push({
                                severity: "error",
                                message: `${FERN_PACKAGE_MARKER_FILENAME} cannot be specified in navigation.`
                            });
                        } else if (!expectedItems.has(actualItem)) {
                            violations.push({
                                severity: "error",
                                message: `Unexpected item: ${actualItem}`
                            });
                        } else if (seen.has(actualItem)) {
                            violations.push({
                                severity: "error",
                                message: `${actualItem} is specified more than once.`
                            });
                        }
                        seen.add(actualItem);
                    }

                    for (const expectedItem of expectedItems) {
                        if (!seen.has(expectedItem)) {
                            violations.push({
                                severity: "error",
                                message: `Missing ${expectedItem}`
                            });
                        }
                    }

                    return violations;
                }
            }
        };
    }
};
