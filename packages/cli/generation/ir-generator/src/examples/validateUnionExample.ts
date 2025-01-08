import { FernWorkspace } from "@fern-api/api-workspace-commons";
import { isPlainObject } from "@fern-api/core-utils";
import { RawSchemas, isRawObjectDefinition } from "@fern-api/fern-definition-schema";

import { FernFileContext } from "../FernFileContext";
import { getUnionDiscriminant } from "../converters/type-declarations/convertDiscriminatedUnionTypeDeclaration";
import { ExampleResolver } from "../resolvers/ExampleResolver";
import { TypeResolver } from "../resolvers/TypeResolver";
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
        return [
            {
                message: `Missing discriminant property ("${discriminant}")`
            }
        ];
    }

    if (typeof discriminantValue !== "string") {
        return getViolationsForMisshapenExample(discriminantValue, "a string");
    }

    const singleUnionTypeDefinition = rawUnion.union[discriminantValue];
    if (singleUnionTypeDefinition == null) {
        return [
            {
                message:
                    `Invalid discriminant property: "${discriminantValue}". Allowed discriminant values:\n` +
                    Object.keys(rawUnion.union)
                        .map((otherDiscriminantValue) => `  - ${otherDiscriminantValue}`)
                        .join("\n")
            }
        ];
    }

    if (rawUnion["base-properties"] != null) {
        const example = Object.fromEntries(
            Object.entries(nonDiscriminantPropertyExamples).filter(
                ([key]) => rawUnion["base-properties"]?.[key] != null
            )
        );
        const basePropertyViolations = validateObjectExample({
            typeName,
            typeNameForBreadcrumb: typeName,
            rawObject: {
                properties: rawUnion["base-properties"]
            },
            file,
            example,
            typeResolver,
            exampleResolver,
            workspace,
            breadcrumbs,
            depth: depth + 1
        });
        if (basePropertyViolations.length > 0) {
            return basePropertyViolations;
        }
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

    // type doesn't exist. this is handled by other rules
    if (resolvedType == null) {
        return [];
    }

    if (resolvedType._type === "named" && isRawObjectDefinition(resolvedType.declaration)) {
        const example = Object.fromEntries(
            Object.entries(nonDiscriminantPropertyExamples).filter(
                ([key]) => rawUnion["base-properties"]?.[key] == null
            )
        );
        return validateObjectExample({
            typeName,
            typeNameForBreadcrumb: typeName,
            rawObject: resolvedType.declaration,
            file: resolvedType.file,
            example,
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

    // "key" is not defined, but this will be caught by other rules
    if (singlePropertyKey == null) {
        return [];
    }

    const { [singlePropertyKey]: singlePropertyExample, ...extraProperties } = nonDiscriminantPropertyExamples;

    const violations: ExampleViolation[] = [];
    if (singlePropertyExample == null) {
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
        severity: "error",
        message: `Unexpected property "${key}"`
    }));
}
