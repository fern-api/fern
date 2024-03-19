import { generatorsYml } from "@fern-api/configuration";
import { dirname, join, RelativeFilePath } from "@fern-api/fs-utils";
import { IntermediateRepresentation } from "@fern-api/ir-sdk";
import { getAllDefinitionFiles } from "@fern-api/workspace-loader";
import { NodePath, NodePathItem } from "@fern-api/yaml-schema";
import chalk from "chalk";
import { Rule, RuleViolation } from "../../Rule";
import { ValidationViolation } from "../../ValidationViolation";

export const ImportFileExistsRule: Rule = {
    name: "import-file-exists",
    create: ({ workspace }) => {
        const relativePaths = Object.keys(getAllDefinitionFiles(workspace.definition));

        const absolutePaths = new Set<string>();
        relativePaths.forEach((relativeFilepath) => {
            const absolutePath = join(workspace.definition.absoluteFilepath, RelativeFilePath.of(relativeFilepath));
            absolutePaths.add(absolutePath);
        });

        return {
            definitionFile: {
                import: async ({ importedAs, importPath }, { relativeFilepath }) => {
                    const violations: RuleViolation[] = [];
                    const importAbsoluteFilepath = join(
                        workspace.definition.absoluteFilepath,
                        dirname(relativeFilepath),
                        RelativeFilePath.of(importPath)
                    );
                    const isDefinitionFilePresent = absolutePaths.has(importAbsoluteFilepath);
                    if (!isDefinitionFilePresent) {
                        violations.push({
                            severity: "error",
                            message: `Import ${chalk.bold(importedAs)} points to non-existent path ${chalk.bold(
                                importPath
                            )}.`
                        });
                    }
                    return violations;
                }
            }
        };
    }
};

function validateIrNavigation(
    ir: IntermediateRepresentation,
    navigation: generatorsYml.NavigationSchema | undefined,
    relativeFilepath: RelativeFilePath,
    nodePath: NodePath
): ValidationViolation[] {
    if (navigation == null) {
        return [];
    }

    const defaultRoot = convertIrToDefaultNavigationConfigRoot(ir);
    return validateNavigationSchema("navigation", navigation, defaultRoot.items, relativeFilepath, nodePath);
}

function getVisitedNames(navigation: generatorsYml.NavigationSchema): string[] {
    if (Array.isArray(navigation)) {
        return navigation.map((item) => (typeof item === "string" ? item : Object.keys(item))).flat();
    } else {
        return Object.keys(navigation);
    }
}

function validateNavigationSchema(
    key: string,
    navigation: generatorsYml.NavigationSchema,
    defaultItems: APIV1Write.ApiNavigationConfigItem[],
    relativeFilepath: RelativeFilePath,
    nodePath: NodePath
): ValidationViolation[] {
    const violations: ValidationViolation[] = [];
    const navigationItemCountError = false;

    if (Array.isArray(navigation)) {
        navigation.forEach((item, index) => {
            violations.push(
                ...validateNavigationItem({ key, arrayIndex: index }, item, defaultItems, relativeFilepath, nodePath)
            );
        });
    } else {
        violations.push(...validateNavigationItem(key, navigation, defaultItems, relativeFilepath, nodePath));
    }

    const visitedNames = getVisitedNames(navigation);
    const defaultNames = defaultItems.map((item) => (item.type === "subpackage" ? item.subpackageId : item.value));

    const missingNames = defaultNames.filter((name) => !visitedNames.includes(name));
    if (missingNames.length > 0) {
        violations.push({
            severity: "error",
            relativeFilepath,
            message: `Missing navigation items: ${missingNames.join(", ")}`,
            nodePath
        });
    }

    const extraNames = visitedNames.filter((name) => !defaultNames.includes(name));
    if (extraNames.length > 0) {
        violations.push({
            severity: "error",
            relativeFilepath,
            message: `Extra navigation items: ${extraNames.join(", ")}`,
            nodePath
        });
    }

    return violations;
}

function validateNavigationItem(
    nodePathItem: NodePathItem,
    navigationItem: generatorsYml.NavigationItem,
    defaultItems: APIV1Write.ApiNavigationConfigItem[],
    relativeFilepath: RelativeFilePath,
    nodePath: NodePath
): ValidationViolation[] {
    const violations: ValidationViolation[] = [];
    if (typeof navigationItem === "string") {
        violations.push(
            ...validateSdkMethodName(navigationItem, defaultItems, relativeFilepath, [...nodePath, nodePathItem])
        );
    } else {
        Object.entries(navigationItem).forEach(([groupName, group]) => {
            const nodePathGroup: NodePath = [...nodePath, nodePathItem];
            const foundItem = defaultItems.find(
                (item) => item.type === "subpackage" && item.subpackageId === groupName
            );
            if (foundItem == null) {
                violations.push({
                    severity: "error",
                    relativeFilepath,
                    message: `Navigation item ${groupName} not found`,
                    nodePath: nodePathGroup
                });
            } else if (foundItem.type !== "subpackage") {
                violations.push({
                    severity: "error",
                    relativeFilepath,
                    message: `Navigation item ${groupName} is a SDK method name when it is expected to be a SDK group name. SDK method names cannot contain children.`,
                    nodePath: nodePathGroup
                });
            } else {
                violations.push(
                    ...validateNavigationSchema(groupName, group, foundItem.items, relativeFilepath, nodePathGroup)
                );
            }
        });
    }

    return violations;
}

function validateSdkMethodName(
    methodName: string,
    defaultItems: APIV1Write.ApiNavigationConfigItem[],
    relativeFilepath: RelativeFilePath,
    nodePath: NodePath
): ValidationViolation[] {
    const violations: ValidationViolation[] = [];
    const foundItem = defaultItems.find((item) => item.type === "endpointId" && item.value === methodName);
    if (foundItem == null) {
        violations.push({
            severity: "error",
            relativeFilepath,
            message: `Navigation item ${methodName} not found`,
            nodePath
        });
    } else if (foundItem.type === "subpackage") {
        violations.push({
            severity: "error",
            relativeFilepath,
            message: `Navigation item ${methodName} is a SDK group name when it is expected to be a SDK method name. SDK group names must be object keys, where its children consist of a list of methods and/or subgroups.`,
            nodePath
        });
    }

    return violations;
}
