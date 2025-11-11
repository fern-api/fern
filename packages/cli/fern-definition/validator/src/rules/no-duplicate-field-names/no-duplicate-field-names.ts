import { visitRawTypeDeclaration } from "@fern-api/fern-definition-schema";
import {
    convertObjectPropertyWithPathToString,
    getAllPropertiesForObject,
    getEnumName,
    getSingleUnionTypeName,
    TypeResolverImpl
} from "@fern-api/ir-generator";
import { groupBy, noop } from "lodash-es";

import { Rule, RuleViolation } from "../../Rule";
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
                                    severity: "fatal",
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
                                        severity: "fatal",
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
                                    severity: "fatal",
                                    message: `Name ${duplicateName} is used by multiple subtypes of this union.`
                                });
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
