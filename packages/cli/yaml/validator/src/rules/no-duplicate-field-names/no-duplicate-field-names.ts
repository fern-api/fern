import {
    constructFernFileContext,
    getEnumName,
    getUnionDiscriminantName,
    getUnionedTypeName,
    TypeResolverImpl,
} from "@fern-api/ir-generator";
import { isRawObjectDefinition, visitRawTypeDeclaration } from "@fern-api/yaml-schema";
import { groupBy, noop } from "lodash-es";
import { Rule, RuleViolation } from "../../Rule";
import { getAllPropertiesForObject } from "./getAllPropertiesForObject";

export const NoDuplicateFieldNamesRule: Rule = {
    name: "no-duplicate-field-names",
    create: ({ workspace }) => {
        const typeResolver = new TypeResolverImpl(workspace);

        return {
            typeDeclaration: ({ declaration }, { relativeFilepath, contents }) => {
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
                                message: `Name "${duplicateName}" is used by multiple values.`,
                            });
                        }
                    },

                    object: (objectDeclaration) => {
                        const allProperties = getAllPropertiesForObject({
                            objectDeclaration,
                            filepathOfDeclaration: relativeFilepath,
                            serviceFile: contents,
                            workspace,
                            typeResolver,
                        });
                        const propertiesGroupedByName = groupBy(allProperties, (property) => property.name);
                        for (const [propertyName, propertiesWithName] of Object.entries(propertiesGroupedByName)) {
                            if (propertiesWithName.length > 1) {
                                const message = [
                                    `Name "${propertyName}" is used by multiple properties:`,
                                    ...propertiesWithName.map((property) => `  - ${property.path.join(" -> ")}`),
                                ].join("\n");
                                violations.push({
                                    severity: "error",
                                    message,
                                });
                            }
                        }
                    },

                    union: (unionDeclaration) => {
                        const duplicateNames = getDuplicateNames(
                            Object.entries(unionDeclaration.union),
                            ([unionKey, unionedType]) => getUnionedTypeName({ unionKey, unionedType }).name
                        );
                        for (const duplicateName of duplicateNames) {
                            violations.push({
                                severity: "error",
                                message: `Name ${duplicateName} is used by multiple subtypes of this union.`,
                            });
                        }

                        for (const [unionKey, unionedType] of Object.entries(unionDeclaration.union)) {
                            const specifiedType =
                                typeof unionedType === "string"
                                    ? unionedType
                                    : unionedType.type != null
                                    ? unionedType.type
                                    : "void";
                            const resolvedType = typeResolver.resolveType({
                                type: specifiedType,
                                file: constructFernFileContext({
                                    relativeFilepath,
                                    serviceFile: contents,
                                }),
                            });

                            if (resolvedType._type === "named" && isRawObjectDefinition(resolvedType.declaration)) {
                                const discriminantName = getUnionDiscriminantName(unionDeclaration).name;
                                const serviceFile = workspace.serviceFiles[resolvedType.filepath];
                                if (serviceFile == null) {
                                    continue;
                                }
                                const propertiesOnObject = getAllPropertiesForObject({
                                    objectDeclaration: resolvedType.declaration,
                                    filepathOfDeclaration: resolvedType.filepath,
                                    serviceFile,
                                    workspace,
                                    typeResolver,
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
                                                `  - ${[unionKey, specifiedType, ...property.path].join(" -> ")}`
                                        ),
                                    ].join("\n");
                                    violations.push({
                                        severity: "error",
                                        message,
                                    });
                                }
                            }
                        }
                    },
                });

                return violations;
            },
        };
    },
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
