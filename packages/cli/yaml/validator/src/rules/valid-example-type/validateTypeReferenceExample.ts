import { assertNever, isPlainObject } from "@fern-api/core-utils";
import { ExampleResolver, FernFileContext, ResolvedType, TypeResolver } from "@fern-api/ir-generator";
import { Workspace } from "@fern-api/workspace-loader";
import { EXAMPLE_REFERENCE_PREFIX, RawSchemas, visitRawTypeReference } from "@fern-api/yaml-schema";
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
    exampleResolver,
    file,
    workspace,
}: {
    rawTypeReference: string;
    example: RawSchemas.ExampleTypeReferenceSchema;
    typeResolver: TypeResolver;
    exampleResolver: ExampleResolver;
    file: FernFileContext;
    workspace: Workspace;
}): RuleViolation[] {
    if (typeof example === "string" && example.startsWith(EXAMPLE_REFERENCE_PREFIX)) {
        // if it's a reference to another example, we just need to compare the
        // expected type with the referenced type
        const resolvedExpectedType = typeResolver.resolveType({
            type: rawTypeReference,
            file,
        });
        // invalid reference. will be caught by another rule
        if (resolvedExpectedType == null) {
            return [];
        }

        const parsedExampleReference = exampleResolver.parseExampleReference(example);

        // invalid reference. will be caught by another rule
        if (parsedExampleReference == null) {
            return [];
        }
        const resolvedActualType = typeResolver.resolveNamedType({
            referenceToNamedType: parsedExampleReference.rawTypeReference,
            file,
        });
        // invalid reference. will be caught by another rule
        if (resolvedActualType == null) {
            return [];
        }

        if (areResolvedTypesEquivalent(resolvedExpectedType, resolvedActualType)) {
            return [];
        } else {
            return [
                {
                    severity: "error",
                    message: `Expected example to be: ${rawTypeReference}. Example is ${example}.`,
                },
            ];
        }
    }

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
                exampleResolver,
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
                    exampleResolver,
                    file,
                    workspace,
                }),
                ...validateTypeReferenceExample({
                    rawTypeReference: valueType,
                    example: exampleValue,
                    typeResolver,
                    exampleResolver,
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
                    exampleResolver,
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
                    exampleResolver,
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
                exampleResolver,
                file,
                workspace,
            });
        },
        unknown: () => {
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

function areResolvedTypesEquivalent(a: ResolvedType, b: ResolvedType): boolean {
    if (a._type === "unknown") {
        return true;
    }
    if (a._type === "primitive") {
        return b._type === "primitive" && a.primitive === b.primitive;
    }
    if (a._type === "container") {
        if (b._type !== "container") {
            return false;
        }
        switch (a.container._type) {
            case "list":
            case "set":
            case "optional":
                return (
                    b.container._type === a.container._type &&
                    areResolvedTypesEquivalent(a.container.itemType, b.container.itemType)
                );
            case "map":
                return (
                    b.container._type === a.container._type &&
                    areResolvedTypesEquivalent(a.container.keyType, b.container.keyType) &&
                    areResolvedTypesEquivalent(a.container.valueType, b.container.valueType)
                );
            case "literal":
                return (
                    b.container._type === a.container._type && a.container.literal.string === b.container.literal.string
                );
            default:
                assertNever(a.container);
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (a._type === "named") {
        return b._type === "named" && b.filepath === a.filepath && b.rawName === a.rawName;
    }

    assertNever(a);
}
