import { isPlainObject } from "@fern-api/core-utils";
import { FernWorkspace } from "@fern-api/workspace-loader";
import { isRawObjectDefinition, RawSchemas } from "@fern-api/fern-definition-schema";
import { getUnionDiscriminant } from "../converters/type-declarations/convertDiscriminatedUnionTypeDeclaration";
import { FernFileContext } from "../FernFileContext";
import { ExampleResolver } from "../resolvers/ExampleResolver";
import { TypeResolver } from "../resolvers/TypeResolver";
import { ExampleViolation } from "./exampleViolation";
import { getViolationsForMisshapenExample } from "./getViolationsForMisshapenExample";
import { validateObjectExample } from "./validateObjectExample";
import { validateTypeReferenceExample } from "./validateTypeReferenceExample";
import { keyBy } from "lodash-es";
import { getAllPropertiesForObject } from "../utils/getAllPropertiesForObject";
import { validateObjectProperties } from "./validateObjectProperties";

export function validateUnionExample({
    typeName,
    rawUnion,
    example,
    typeResolver,
    exampleResolver,
    file,
    workspace,
    breadcrumbs
}: {
    typeName: string;
    rawUnion: RawSchemas.DiscriminatedUnionSchema;
    example: RawSchemas.ExampleTypeValueSchema;
    typeResolver: TypeResolver;
    exampleResolver: ExampleResolver;
    file: FernFileContext;
    workspace: FernWorkspace;
    breadcrumbs: string[];
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

    const unionBaseProperties = {
        ...rawUnion["base-properties"]
    };

    const type =
        typeof singleUnionTypeDefinition === "string" ? singleUnionTypeDefinition : singleUnionTypeDefinition.type;

    if (typeof type !== "string") {
        return validateUnionBaseProperties({
            typeName,
            unionBaseProperties,
            nonDiscriminantPropertyExamples,
            typeResolver,
            exampleResolver,
            file,
            workspace,
            breadcrumbs
        });
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
        const objectProperties = {
            ...unionBaseProperties,
            ...resolvedType.declaration.properties
        };
        return validateObjectProperties({
            typeName,
            objectProperties,
            extendedTypes: resolvedType.declaration.extends,
            file: resolvedType.file,
            example: nonDiscriminantPropertyExamples,
            typeResolver,
            exampleResolver,
            workspace,
            breadcrumbs
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
                breadcrumbs
            })
        );
    }

    violations.push(
        ...validateUnionBaseProperties({
            typeName,
            unionBaseProperties,
            nonDiscriminantPropertyExamples: extraProperties,
            typeResolver,
            exampleResolver,
            file,
            workspace,
            breadcrumbs
        })
    );

    return violations;
}

export function validateUnionBaseProperties({
    typeName,
    unionBaseProperties,
    nonDiscriminantPropertyExamples,
    typeResolver,
    exampleResolver,
    file,
    workspace,
    breadcrumbs
}: {
    typeName: string;
    unionBaseProperties: Record<string, RawSchemas.ObjectPropertySchema> | undefined;
    nonDiscriminantPropertyExamples: Record<string, unknown>;
    typeResolver: TypeResolver;
    exampleResolver: ExampleResolver;
    file: FernFileContext;
    workspace: FernWorkspace;
    breadcrumbs: string[];
}): ExampleViolation[] {
    if (unionBaseProperties == null) {
        return getRuleViolationForExtraProperties(nonDiscriminantPropertyExamples);
    }
    return validateObjectProperties({
        typeName,
        objectProperties: unionBaseProperties,
        extendedTypes: undefined,
        file,
        example: nonDiscriminantPropertyExamples,
        typeResolver,
        exampleResolver,
        workspace,
        breadcrumbs
    });
}

function getRuleViolationForExtraProperties(extraProperties: Record<string, unknown>): ExampleViolation[] {
    return Object.keys(extraProperties).map((key) => ({
        severity: "error",
        message: `Unexpected property "${key}"`
    }));
}
