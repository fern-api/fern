import { isPlainObject } from "@fern-api/core-utils";
import { FernFileContext, TypeResolver } from "@fern-api/ir-generator";
import { Workspace } from "@fern-api/workspace-loader";
import { RawSchemas, visitRawTypeReference } from "@fern-api/yaml-schema";
import { PrimitiveType } from "@fern-fern/ir-model/types";
import { RuleViolation } from "../../Rule";
import { getDuplicates } from "../../utils/getDuplicates";
import { getRuleViolationsForMisshapenExample } from "./getRuleViolationsForMisshapenExample";
import { validateTypeExample } from "./validateTypeExample";

// https://stackoverflow.com/questions/12756159/regex-and-iso8601-formatted-datetime
const ISO_8601_REGEX =
    /^([+-]?\d{4}(?!\d{2}\b))((-?)((0[1-9]|1[0-2])(\3([12]\d|0[1-9]|3[01]))?|W([0-4]\d|5[0-2])(-?[1-7])?|(00[1-9]|0[1-9]\d|[12]\d{2}|3([0-5]\d|6[1-6])))([T\s]((([01]\d|2[0-3])((:?)[0-5]\d)?|24:?00)([.,]\d+(?!:))?)?(\17[0-5]\d([.,]\d+)?)?([zZ]|([+-])([01]\d|2[0-3]):?([0-5]\d)?)?)?)?$/;

// https://ihateregex.io/expr/uuid/
const UUID_REGEX = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/;

export function validateTypeReferenceExample({
    rawTypeReference,
    example,
    typeResolver,
    file,
    workspace,
}: {
    rawTypeReference: string;
    example: RawSchemas.ExampleTypeReferenceSchema;
    typeResolver: TypeResolver;
    file: FernFileContext;
    workspace: Workspace;
}): RuleViolation[] {
    return visitRawTypeReference(rawTypeReference, {
        primitive: (primitiveType) => validatePrimitiveExample({ primitiveType, example }),
        named: (referenceToNamedType) => {
            const declaration = typeResolver.getDeclarationOfNamedType({
                referenceToNamedType,
                file,
            });

            // type doesn't exist. this will be caught by other rules.
            if (declaration == null) {
                return [];
            }

            return validateTypeExample({
                typeName: declaration.typeName,
                typeDeclaration: declaration.declaration,
                file: declaration.file,
                example,
                typeResolver,
                workspace,
            });
        },
        map: ({ keyType, valueType }) => {
            if (!isPlainObject(example)) {
                return getRuleViolationsForMisshapenExample(example, "a map");
            }
            return Object.entries(example).flatMap(([exampleKey, exampleValue]) => [
                ...validateTypeReferenceExample({
                    rawTypeReference: keyType,
                    example: exampleKey,
                    typeResolver,
                    file,
                    workspace,
                }),
                ...validateTypeReferenceExample({
                    rawTypeReference: valueType,
                    example: exampleValue,
                    typeResolver,
                    file,
                    workspace,
                }),
            ]);
        },
        list: (itemType) => {
            if (!Array.isArray(example)) {
                return getRuleViolationsForMisshapenExample(example, "a list");
            }
            return example.flatMap((exampleItem) =>
                validateTypeReferenceExample({
                    rawTypeReference: itemType,
                    example: exampleItem,
                    typeResolver,
                    file,
                    workspace,
                })
            );
        },
        set: (itemType) => {
            if (!Array.isArray(example)) {
                return getRuleViolationsForMisshapenExample(example, "a list");
            }

            const duplicates = getDuplicates(example);
            if (duplicates.length > 0) {
                return [
                    {
                        severity: "error",
                        message:
                            "Set has duplicate elements:\n" +
                            duplicates.map((item) => `  - ${JSON.stringify(item)}`).join("\n"),
                    },
                ];
            }

            return example.flatMap((exampleItem) =>
                validateTypeReferenceExample({
                    rawTypeReference: itemType,
                    example: exampleItem,
                    typeResolver,
                    file,
                    workspace,
                })
            );
        },
        optional: (itemType) => {
            if (example == null) {
                return [];
            }
            return validateTypeReferenceExample({
                rawTypeReference: itemType,
                example,
                typeResolver,
                file,
                workspace,
            });
        },
        unknown: () => {
            return [];
        },
        void: () => {
            return [];
        },
        literal: (expectedLiteralValue) => {
            return createValidator((e) => e === expectedLiteralValue, `"${expectedLiteralValue}"`)(example);
        },
    });
}

function validatePrimitiveExample({
    primitiveType,
    example,
}: {
    primitiveType: PrimitiveType;
    example: RawSchemas.ExampleTypeReferenceSchema;
}): RuleViolation[] {
    return PrimitiveType._visit<RuleViolation[]>(primitiveType, {
        string: () => validateString(example),
        integer: () => validateInteger(example),
        double: () => validateDouble(example),
        long: () => validateLong(example),
        boolean: () => validateBoolean(example),
        uuid: () => validateUuid(example),
        dateTime: () => validateDateTime(example),
        _unknown: () => {
            throw new Error("Unknown primitive type: " + primitiveType);
        },
    });
}

const validateString = createValidator((example) => typeof example === "string", "a string");
const validateInteger = createValidator((example) => Number.isInteger(example), "an integer");
const validateDouble = createValidator((example) => typeof example === "number", "a double");
const validateLong = createValidator((example) => Number.isInteger(example), "an integer");
const validateBoolean = createValidator((example) => typeof example === "boolean", "a boolean");
const validateUuid = createValidator((example) => typeof example === "string" && UUID_REGEX.test(example), "a UUID");
const validateDateTime = createValidator(
    (example) => typeof example === "string" && ISO_8601_REGEX.test(example),
    "an ISO 8601 timestamp"
);

function createValidator(
    validate: (example: RawSchemas.ExampleTypeReferenceSchema) => boolean,
    expectedTypeIncludingArticle: string
): (example: RawSchemas.ExampleTypeReferenceSchema) => RuleViolation[] {
    return (example) => {
        if (validate(example)) {
            return [];
        }
        return getRuleViolationsForMisshapenExample(example, expectedTypeIncludingArticle);
    };
}
