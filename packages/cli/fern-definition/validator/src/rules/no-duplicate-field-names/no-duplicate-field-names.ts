import { groupBy, noop } from "lodash-es";

import { getDefinitionFile } from "@fern-api/api-workspace-commons";
import { isRawObjectDefinition, visitRawTypeDeclaration } from "@fern-api/fern-definition-schema";
import {
    TypeResolverImpl,
    constructFernFileContext,
    convertObjectPropertyWithPathToString,
    getAllPropertiesForObject,
    getEnumName,
    getSingleUnionTypeName,
    getUnionDiscriminantName
} from "@fern-api/ir-generator";

import { Rule, RuleViolation } from "../../Rule";
import { CASINGS_GENERATOR } from "../../utils/casingsGenerator";
import { getTypeDeclarationNameAsString } from "../../utils/getTypeDeclarationNameAsString";

export const NoDuplicateFieldNamesRule: Rule = {
    name: "no-duplicate-field-names",
    create: ({ workspace }) => {
        const typeResolver = new TypeResolverImpl(workspace);

        return {
            definitionFile: {
                typeDeclaration: ({ typeName, declaration }, { relativeFilepath, contents }) => {
                    const violations: RuleViolation[] = [];

                    visitRawTypeDeclaration(declaration, {
                        alias: noop,

                        enum: (enumDeclaration) => {
                            const duplicateNames = getDuplicateNames(
                                enumDeclaration.enum,
                                (value) => getEnumName(value).name
                            );
                            for (const duplicateName of duplicateNames) {
                                violations.push({
                                    severity: "error",
                                    message: `Name "${duplicateName}" is used by multiple values.`
                                });
                            }
                        },

                        object: (objectDeclaration) => {
                            const typeNameString = getTypeDeclarationNameAsString(typeName);
                            const allProperties = getAllPropertiesForObject({
                                typeName: typeNameString,
                                objectDeclaration,
                                filepathOfDeclaration: relativeFilepath,
                                definitionFile: contents,
                                workspace,
                                typeResolver,
                                smartCasing: false
                            });
                            const propertiesGroupedByName = groupBy(allProperties, (property) => property.name);
                            for (const [propertyName, propertiesWithName] of Object.entries(propertiesGroupedByName)) {
                                if (propertiesWithName.length > 1) {
                                    const message = [
                                        `Object has multiple properties named "${propertyName}":`,
                                        ...propertiesWithName.map(
                                            (property) =>
                                                `  - ${convertObjectPropertyWithPathToString({
                                                    property,
                                                    prefixBreadcrumbs: [typeNameString]
                                                })}`
                                        )
                                    ].join("\n");
                                    violations.push({
                                        severity: "error",
                                        message
                                    });
                                }
                            }
                        },

                        undiscriminatedUnion: () => [],

                        discriminatedUnion: (unionDeclaration) => {
                            const duplicateNames = getDuplicateNames(
                                Object.entries(unionDeclaration.union),
                                ([unionKey, rawSingleUnionType]) =>
                                    getSingleUnionTypeName({ unionKey, rawSingleUnionType }).name
                            );
                            for (const duplicateName of duplicateNames) {
                                violations.push({
                                    severity: "error",
                                    message: `Name ${duplicateName} is used by multiple subtypes of this union.`
                                });
                            }

                            for (const [unionKey, singleUnionType] of Object.entries(unionDeclaration.union)) {
                                const specifiedType =
                                    typeof singleUnionType === "string"
                                        ? singleUnionType
                                        : typeof singleUnionType.type === "string"
                                          ? singleUnionType.type
                                          : undefined;

                                // if the union type has a key, we don't need to check for conflicts
                                // because the variant is nested under the key
                                if (typeof singleUnionType === "object" && singleUnionType.key != null) {
                                    continue;
                                }

                                if (specifiedType != null) {
                                    const resolvedType = typeResolver.resolveType({
                                        type: specifiedType,
                                        file: constructFernFileContext({
                                            relativeFilepath,
                                            definitionFile: contents,
                                            casingsGenerator: CASINGS_GENERATOR,
                                            rootApiFile: workspace.definition.rootApiFile.contents
                                        })
                                    });

                                    if (resolvedType == null) {
                                        // invalid will be caught by another rule
                                        continue;
                                    }

                                    if (
                                        resolvedType._type === "named" &&
                                        isRawObjectDefinition(resolvedType.declaration)
                                    ) {
                                        const discriminantName = getUnionDiscriminantName(unionDeclaration).name;
                                        const definitionFile = getDefinitionFile(workspace, resolvedType.filepath);
                                        if (definitionFile == null) {
                                            continue;
                                        }
                                        const propertiesOnObject = getAllPropertiesForObject({
                                            typeName: resolvedType.rawName,
                                            objectDeclaration: resolvedType.declaration,
                                            filepathOfDeclaration: resolvedType.filepath,
                                            definitionFile,
                                            workspace,
                                            typeResolver,
                                            smartCasing: false
                                        });
                                        const propertiesWithSameNameAsDiscriminant = propertiesOnObject.filter(
                                            (property) => property.name === discriminantName
                                        );
                                        if (propertiesWithSameNameAsDiscriminant.length > 0) {
                                            const message = [
                                                `Discriminant "${discriminantName}" conflicts with extended ${
                                                    propertiesWithSameNameAsDiscriminant.length === 1
                                                        ? "property"
                                                        : "properties"
                                                }:`,
                                                ...propertiesWithSameNameAsDiscriminant.map(
                                                    (property) =>
                                                        `  - ${convertObjectPropertyWithPathToString({
                                                            property,
                                                            prefixBreadcrumbs: [unionKey, specifiedType]
                                                        })}`
                                                )
                                            ].join("\n");
                                            violations.push({
                                                severity: "error",
                                                message
                                            });
                                        }
                                    }
                                }
                            }
                        }
                    });

                    return violations;
                }
            }
        };
    }
};

function getDuplicateNames<T>(items: T[], getName: (item: T) => string): string[] {
    const nameToCount: Record<string, number> = {};
    for (const item of items) {
        const count = nameToCount[getName(item)] ?? 0;
        nameToCount[getName(item)] = count + 1;
    }

    return Object.entries(nameToCount).reduce<string[]>((duplicates, [name, count]) => {
        if (count > 1) {
            duplicates.push(name);
        }
        return duplicates;
    }, []);
}
