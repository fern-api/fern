import { assertNever, getDuplicates, isPlainObject } from "@fern-api/core-utils";
import { Literal, PrimitiveType } from "@fern-api/ir-sdk";
import { FernWorkspace } from "@fern-api/workspace-loader";
import { EXAMPLE_REFERENCE_PREFIX, RawSchemas, visitRawTypeReference } from "@fern-api/yaml-schema";
import { FernFileContext } from "../FernFileContext";
import { ExampleResolver } from "../resolvers/ExampleResolver";
import { ResolvedType } from "../resolvers/ResolvedType";
import { TypeResolver } from "../resolvers/TypeResolver";
import { ExampleViolation } from "./exampleViolation";
import { getViolationsForMisshapenExample } from "./getViolationsForMisshapenExample";
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
    workspace
}: {
    rawTypeReference: string;
    example: RawSchemas.ExampleTypeReferenceSchema;
    typeResolver: TypeResolver;
    exampleResolver: ExampleResolver;
    file: FernFileContext;
    workspace: FernWorkspace;
}): ExampleViolation[] {
    if (typeof example === "string" && example.startsWith(EXAMPLE_REFERENCE_PREFIX)) {
        // if it's a reference to another example, we just need to compare the
        // expected type with the referenced type
        const resolvedExpectedType = typeResolver.resolveType({
            type: rawTypeReference,
            file
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
            file
        });
        // invalid reference. will be caught by another rule
        if (resolvedActualType == null) {
            return [];
        }

        if (areResolvedTypesEquivalent({ expected: resolvedExpectedType, actual: resolvedActualType })) {
            return [];
        } else {
            return [
                {
                    message: `Expected example to be: ${rawTypeReference}. Example is ${example}.`
                }
            ];
        }
    }

    return visitRawTypeReference(rawTypeReference, {
        primitive: (primitiveType) => validatePrimitiveExample({ primitiveType, example }),
        named: (referenceToNamedType) => {
            const declaration = typeResolver.getDeclarationOfNamedType({
                referenceToNamedType,
                file
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
                workspace
            });
        },
        map: ({ keyType, valueType }) => {
            if (!isPlainObject(example)) {
                return getViolationsForMisshapenExample(example, "a map");
            }
            return Object.entries(example).flatMap(([exampleKey, exampleValue]) => [
                ...validateTypeReferenceExample({
                    rawTypeReference: keyType,
                    example: exampleKey,
                    typeResolver,
                    exampleResolver,
                    file,
                    workspace
                }),
                ...validateTypeReferenceExample({
                    rawTypeReference: valueType,
                    example: exampleValue,
                    typeResolver,
                    exampleResolver,
                    file,
                    workspace
                })
            ]);
        },
        list: (itemType) => {
            if (!Array.isArray(example)) {
                return getViolationsForMisshapenExample(example, "a list");
            }
            return example.flatMap((exampleItem) =>
                validateTypeReferenceExample({
                    rawTypeReference: itemType,
                    example: exampleItem,
                    typeResolver,
                    exampleResolver,
                    file,
                    workspace
                })
            );
        },
        set: (itemType) => {
            if (!Array.isArray(example)) {
                return getViolationsForMisshapenExample(example, "a list");
            }

            const duplicates = getDuplicates(example);
            if (duplicates.length > 0) {
                return [
                    {
                        severity: "error",
                        message:
                            "Set has duplicate elements:\n" +
                            duplicates.map((item) => `  - ${JSON.stringify(item)}`).join("\n")
                    }
                ];
            }

            return example.flatMap((exampleItem) =>
                validateTypeReferenceExample({
                    rawTypeReference: itemType,
                    example: exampleItem,
                    typeResolver,
                    exampleResolver,
                    file,
                    workspace
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
                workspace
            });
        },
        unknown: () => {
            return [];
        },
        literal: (expectedLiteral) => {
            switch (expectedLiteral.type) {
                case "boolean":
                    return createValidator(
                        (e) => e === expectedLiteral.boolean,
                        expectedLiteral.boolean.toString()
                    )(example);
                case "string":
                    return createValidator((e) => e === expectedLiteral.string, `"${expectedLiteral.string}"`)(example);
                default:
                    assertNever(expectedLiteral);
            }
        }
    });
}

function validatePrimitiveExample({
    primitiveType,
    example
}: {
    primitiveType: PrimitiveType;
    example: RawSchemas.ExampleTypeReferenceSchema;
}): ExampleViolation[] {
    return PrimitiveType._visit<ExampleViolation[]>(primitiveType, {
        string: () => validateString(example),
        integer: () => validateInteger(example),
        double: () => validateDouble(example),
        long: () => validateLong(example),
        boolean: () => validateBoolean(example),
        uuid: () => validateUuid(example),
        dateTime: () => validateDateTime(example),
        date: () => validateString(example),
        base64: () => validateString(example),
        _other: () => {
            throw new Error("Unknown primitive type: " + primitiveType);
        }
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
): (example: RawSchemas.ExampleTypeReferenceSchema) => ExampleViolation[] {
    return (example) => {
        if (validate(example)) {
            return [];
        }
        return getViolationsForMisshapenExample(example, expectedTypeIncludingArticle);
    };
}

function areResolvedTypesEquivalent({ expected, actual }: { expected: ResolvedType; actual: ResolvedType }): boolean {
    if (expected._type === "unknown") {
        return true;
    }
    if (expected._type === "primitive") {
        return actual._type === "primitive" && expected.primitive === actual.primitive;
    }
    if (expected._type === "container") {
        switch (expected.container._type) {
            case "list":
            case "set":
                return (
                    actual._type === "container" &&
                    actual.container._type === expected.container._type &&
                    areResolvedTypesEquivalent({
                        expected: expected.container.itemType,
                        actual: actual.container.itemType
                    })
                );
            case "optional":
                // special case: if expected is an optional but actual is not, that's okay
                return areResolvedTypesEquivalent({
                    expected: expected.container.itemType,
                    actual:
                        actual._type === "container" && actual.container._type === "optional"
                            ? actual.container.itemType
                            : actual
                });
            case "map":
                return (
                    actual._type === "container" &&
                    actual.container._type === expected.container._type &&
                    areResolvedTypesEquivalent({
                        expected: expected.container.keyType,
                        actual: actual.container.keyType
                    }) &&
                    areResolvedTypesEquivalent({
                        expected: expected.container.valueType,
                        actual: actual.container.valueType
                    })
                );
            case "literal":
                if (actual._type !== "container" || actual.container._type !== expected.container._type) {
                    return false;
                }
                return areLiteralTypesEquivalent({
                    expected: expected.container.literal,
                    actual: actual.container.literal
                });
            default:
                assertNever(expected.container);
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (expected._type === "named") {
        return actual._type === "named" && actual.filepath === expected.filepath && actual.rawName === expected.rawName;
    }

    assertNever(expected);
}

function areLiteralTypesEquivalent({ expected, actual }: { expected: Literal; actual: Literal }) {
    switch (expected.type) {
        case "boolean":
            return actual.type === "boolean" ? expected.boolean === actual.boolean : false;
        case "string":
            return actual.type === "string" ? expected.string === actual.string : false;
        default:
            assertNever(expected);
    }
}
