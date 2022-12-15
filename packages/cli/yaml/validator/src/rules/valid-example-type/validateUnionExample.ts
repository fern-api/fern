import { FernFileContext, getUnionDiscriminant, TypeResolver } from "@fern-api/ir-generator";
import { Workspace } from "@fern-api/workspace-loader";
import { isRawObjectDefinition, RawPrimitiveType, RawSchemas } from "@fern-api/yaml-schema";
import { RuleViolation } from "../../Rule";
import { validateObjectExample } from "./validateObjectExample";
import { validateTypeReferenceExample } from "./validateTypeReferenceExample";

export function validateUnionExample({
    typeName,
    rawUnion,
    example,
    typeResolver,
    file,
    workspace,
}: {
    typeName: string;
    rawUnion: RawSchemas.UnionSchema;
    example: RawSchemas.ExampleTypeSchema;
    typeResolver: TypeResolver;
    file: FernFileContext;
    workspace: Workspace;
}): RuleViolation[] {
    const discriminant = getUnionDiscriminant(rawUnion);
    const { [discriminant]: discriminantValue, ...nonDiscriminantPropertyExamples } = example;

    if (discriminantValue == null) {
        return [
            {
                severity: "error",
                message: `Missing discriminant property ("${discriminant}")`,
            },
        ];
    }

    const singleUnionTypeDefinition = rawUnion.union[discriminantValue];
    if (singleUnionTypeDefinition == null) {
        return [
            {
                severity: "error",
                message:
                    `Invalid discriminant property: "${discriminantValue}". Allowed discriminant values:\n` +
                    Object.keys(rawUnion.union)
                        .map((otherDiscriminantValue) => `  - ${otherDiscriminantValue}`)
                        .join("\n"),
            },
        ];
    }

    const type =
        typeof singleUnionTypeDefinition === "string" ? singleUnionTypeDefinition : singleUnionTypeDefinition.type;

    if (type == null) {
        return getRuleViolationForExtraProperties(nonDiscriminantPropertyExamples);
    }

    const resolvedType = typeResolver.resolveType({
        type,
        file,
    });

    // type doesn't exist. this is handled by other rules
    if (resolvedType == null) {
        return [];
    }

    if (resolvedType._type === "named" && isRawObjectDefinition(resolvedType.declaration)) {
        return validateObjectExample({
            typeName,
            rawObject: resolvedType.declaration,
            file: resolvedType.file,
            example: nonDiscriminantPropertyExamples,
            typeResolver,
            workspace,
        });
    }

    const singlePropertyKey =
        typeof singleUnionTypeDefinition !== "string" && typeof singleUnionTypeDefinition.key === "string"
            ? singleUnionTypeDefinition.key
            : undefined;

    // "key" is not defined, but this will be caught by other rules
    if (singlePropertyKey == null || singlePropertyKey === RawPrimitiveType.void) {
        return [];
    }

    const { [singlePropertyKey]: singlePropertyExample, ...extraProperties } = nonDiscriminantPropertyExamples;

    const violations: RuleViolation[] = [];
    if (singlePropertyExample == null) {
        violations.push({
            severity: "error",
            message: `Missing property "${singlePropertyKey}"`,
        });
    } else {
        violations.push(
            ...validateTypeReferenceExample({
                rawTypeReference: type,
                example: singlePropertyExample,
                typeResolver,
                file,
                workspace,
            })
        );
    }

    violations.push(...getRuleViolationForExtraProperties(extraProperties));

    return violations;
}

function getRuleViolationForExtraProperties(extraProperties: Record<string, unknown>): RuleViolation[] {
    return Object.keys(extraProperties).map((key) => ({
        severity: "error",
        message: `Unexpected property "${key}"`,
    }));
}
