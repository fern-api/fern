import {
    constructFernFileContext,
    getEnumName,
    getSingleUnionTypeName,
    getUnionDiscriminantName,
    TypeResolverImpl
} from "@fern-api/ir-generator";
import { getDefinitionFile } from "@fern-api/workspace-loader";
import { isRawObjectDefinition, visitRawTypeDeclaration } from "@fern-api/yaml-schema";
import { groupBy, noop } from "lodash-es";
import { Rule, RuleViolation } from "../../Rule";
import { CASINGS_GENERATOR } from "../../utils/casingsGenerator";
import { convertObjectPropertyWithPathToString, getAllPropertiesForObject } from "@fern-api/ir-generator";
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
                                typeResolver
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
                                            typeResolver
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
        nameToCount[getName(item)] ??= 0;
        nameToCount[getName(item)]++;
    }

    return Object.entries(nameToCount).reduce<string[]>((duplicates, [name, count]) => {
        if (count > 1) {
            duplicates.push(name);
        }
        return duplicates;
    }, []);
}
