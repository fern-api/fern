import { FernWorkspace } from "@fern-api/api-workspace-commons";
import { isPlainObject } from "@fern-api/core-utils";
import { isRawObjectDefinition, RawSchemas } from "@fern-api/fern-definition-schema";
import { getUnionDiscriminant } from "../converters/type-declarations/convertDiscriminatedUnionTypeDeclaration";
import { FernFileContext } from "../FernFileContext";
import { ExampleResolver } from "../resolvers/ExampleResolver";
import { TypeResolver } from "../resolvers/TypeResolver";
import { getAllPropertiesForObject } from "../utils/getAllPropertiesForObject";
import { ExampleViolation } from "./exampleViolation";
import { getViolationsForMisshapenExample } from "./getViolationsForMisshapenExample";
import { validateObjectExample } from "./validateObjectExample";
import { validateTypeReferenceExample } from "./validateTypeReferenceExample";

export function validateUnionExample({
    typeName,
    rawUnion,
    example,
    typeResolver,
    exampleResolver,
    file,
    workspace,
    breadcrumbs,
    depth
}: {
    typeName: string;
    rawUnion: RawSchemas.DiscriminatedUnionSchema;
    example: RawSchemas.ExampleTypeValueSchema;
    typeResolver: TypeResolver;
    exampleResolver: ExampleResolver;
    file: FernFileContext;
    workspace: FernWorkspace;
    breadcrumbs: string[];
    depth: number;
}): ExampleViolation[] {
    if (!isPlainObject(example)) {
        return getViolationsForMisshapenExample(example, "an object");
    }

    const discriminant = getUnionDiscriminant(rawUnion);
    const { [discriminant]: discriminantValue, ...nonDiscriminantPropertyExamples } = example;

    if (discriminantValue == null) {
        return [{ message: `Missing discriminant property ("${discriminant}")` }];
    }

    if (typeof discriminantValue !== "string") {
        return getViolationsForMisshapenExample(discriminantValue, "a string");
    }

    let singleUnionTypeDefinition = rawUnion.union[discriminantValue];

    if (discriminantValue.startsWith("\\$")) {
        singleUnionTypeDefinition = rawUnion.union[discriminantValue.slice(1)];
    }
    if (singleUnionTypeDefinition == null) {
        return [
            {
                message:
                    `Invalid discriminant property: "${discriminantValue}". Allowed discriminant values:\n` +
                    Object.keys(rawUnion.union)
                        .map((value) => `  - ${value}`)
                        .join("\n")
            }
        ];
    }

    const type =
        typeof singleUnionTypeDefinition === "string" ? singleUnionTypeDefinition : singleUnionTypeDefinition.type;

    if (typeof type !== "string") {
        return getRuleViolationForExtraProperties(nonDiscriminantPropertyExamples);
    }

    const resolvedType = typeResolver.resolveType({
        type,
        file
    });

    if (resolvedType == null) {
        return [];
    }

    const unionExtends =
        typeof rawUnion.extends === "undefined"
            ? []
            : typeof rawUnion.extends === "string"
              ? [rawUnion.extends]
              : rawUnion.extends;

    if (rawUnion["base-properties"] != null || unionExtends.length > 0) {
        const baseAndExtendsObject: RawSchemas.ObjectSchema = {
            properties: rawUnion["base-properties"],
            extends: unionExtends
        };

        const baseAndExtendsProperties = getAllPropertiesForObject({
            typeName: undefined,
            objectDeclaration: baseAndExtendsObject,
            typeResolver,
            definitionFile: file.definitionFile,
            workspace,
            filepathOfDeclaration: file.relativeFilepath,
            smartCasing: false
        });

        const baseAndExtendsPropertyKeys = new Set(baseAndExtendsProperties.map((p) => p.wireKey));

        const baseAndExtendsViolations = validateObjectExample({
            typeName,
            typeNameForBreadcrumb: typeName,
            rawObject: baseAndExtendsObject,
            file,
            example: nonDiscriminantPropertyExamples,
            typeResolver,
            exampleResolver,
            workspace,
            breadcrumbs,
            depth: depth + 1
        });

        const relevantViolations = baseAndExtendsViolations.filter((violation) => {
            const message = violation.message.toLowerCase();
            if (message.includes("unexpected property")) {
                const match = message.match(/unexpected property "([^"]+)"/);
                if (match && match[1] && !baseAndExtendsPropertyKeys.has(match[1])) {
                    return false;
                }
            }
            return true;
        });

        if (relevantViolations.length > 0) {
            return relevantViolations;
        }
    }

    if (resolvedType._type === "named" && isRawObjectDefinition(resolvedType.declaration)) {
        const unionMemberExample = Object.fromEntries(
            Object.entries(nonDiscriminantPropertyExamples).filter(([key]) => {
                if (rawUnion["base-properties"]?.[key] != null) {
                    return false;
                }
                if (
                    unionExtends.some((extendedType) => {
                        const resolvedExtendedType = typeResolver.resolveNamedType({
                            referenceToNamedType: extendedType,
                            file
                        });
                        if (
                            resolvedExtendedType?._type === "named" &&
                            isRawObjectDefinition(resolvedExtendedType.declaration)
                        ) {
                            return resolvedExtendedType.declaration.properties?.[key] != null;
                        }
                        return false;
                    })
                ) {
                    return false;
                }
                return true;
            })
        );

        return validateObjectExample({
            typeName,
            typeNameForBreadcrumb: typeName,
            rawObject: resolvedType.declaration,
            file: resolvedType.file,
            example: unionMemberExample,
            typeResolver,
            exampleResolver,
            workspace,
            breadcrumbs,
            depth: depth + 1
        });
    }

    const singlePropertyKey =
        typeof singleUnionTypeDefinition !== "string" && typeof singleUnionTypeDefinition.key === "string"
            ? singleUnionTypeDefinition.key
            : undefined;

    if (singlePropertyKey == null) {
        return [];
    }

    const { [singlePropertyKey]: singlePropertyExample, ...extraProperties } = nonDiscriminantPropertyExamples;

    const violations: ExampleViolation[] = [];
    if (typeof singlePropertyExample === "undefined") {
        violations.push({
            message: `Missing property "${singlePropertyKey}"`
        });
    } else {
        violations.push(
            ...validateTypeReferenceExample({
                rawTypeReference: type,
                example: singlePropertyExample,
                typeResolver,
                exampleResolver,
                file,
                workspace,
                breadcrumbs,
                depth: depth + 1
            })
        );
    }

    violations.push(...getRuleViolationForExtraProperties(extraProperties));

    return violations;
}

function getRuleViolationForExtraProperties(extraProperties: Record<string, unknown>): ExampleViolation[] {
    return Object.keys(extraProperties).map((key) => ({
        severity: "fatal",
        message: `Unexpected property "${key}"`
    }));
}
