import { FernWorkspace } from "@fern-api/api-workspace-commons";
import { assertNever, getDuplicates, isPlainObject } from "@fern-api/core-utils";
import { EXAMPLE_REFERENCE_PREFIX, RawSchemas, visitRawTypeReference } from "@fern-api/fern-definition-schema";
import {
    DoubleValidationRules,
    IntegerValidationRules,
    Literal,
    PrimitiveType,
    PrimitiveTypeV1,
    PrimitiveTypeV2,
    StringValidationRules
} from "@fern-api/ir-sdk";

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

const RFC_3339_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const MAX_RECURSION_DEPTH = 128;

export function validateTypeReferenceExample({
    rawTypeReference,
    example,
    typeResolver,
    exampleResolver,
    file,
    workspace,
    breadcrumbs,
    depth
}: {
    rawTypeReference: string;
    example: RawSchemas.ExampleTypeReferenceSchema;
    typeResolver: TypeResolver;
    exampleResolver: ExampleResolver;
    file: FernFileContext;
    workspace: FernWorkspace;
    breadcrumbs: string[];
    depth: number;
}): ExampleViolation[] {
    if (depth > MAX_RECURSION_DEPTH) {
        // This comment never reaches the user and serves as a termination condition for the recursion.
        return [
            {
                message: "Example is too deeply nested. This may indicate a circular reference."
            }
        ];
    }

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

    return visitRawTypeReference({
        type: rawTypeReference,
        _default: undefined,
        validation: undefined,
        visitor: {
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
                    workspace,
                    breadcrumbs,
                    depth: depth + 1
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
                        workspace,
                        breadcrumbs: [...breadcrumbs, exampleKey],
                        depth: depth + 1
                    }),
                    ...validateTypeReferenceExample({
                        rawTypeReference: valueType,
                        example: exampleValue,
                        typeResolver,
                        exampleResolver,
                        file,
                        workspace,
                        breadcrumbs: [...breadcrumbs, exampleKey],
                        depth: depth + 1
                    })
                ]);
            },
            list: (itemType) => {
                if (!Array.isArray(example)) {
                    return getViolationsForMisshapenExample(example, "a list");
                }
                return example.flatMap((exampleItem, idx) =>
                    validateTypeReferenceExample({
                        rawTypeReference: itemType,
                        example: exampleItem,
                        typeResolver,
                        exampleResolver,
                        file,
                        workspace,
                        breadcrumbs: [...breadcrumbs, `${idx}`],
                        depth: depth + 1
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

                return example.flatMap((exampleItem, idx) =>
                    validateTypeReferenceExample({
                        rawTypeReference: itemType,
                        example: exampleItem,
                        typeResolver,
                        exampleResolver,
                        file,
                        workspace,
                        breadcrumbs: [...breadcrumbs, `${idx}`],
                        depth: depth + 1
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
                    breadcrumbs,
                    depth: depth + 1
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
                        return createValidator(
                            (e) => e === expectedLiteral.string,
                            `"${expectedLiteral.string}"`
                        )(example);
                    default:
                        assertNever(expectedLiteral);
                }
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
    if (primitiveType.v2 != null) {
        return PrimitiveTypeV2._visit<ExampleViolation[]>(primitiveType.v2, {
            integer: (v2) =>
                validateIntegerWithRules({
                    example,
                    rules: v2.validation
                }),
            long: () => validateLong(example),
            uint: () => validateUint(example),
            uint64: () => validateUint64(example),
            double: (v2) =>
                validateDoubleWithRules({
                    example,
                    rules: v2.validation
                }),
            float: () => validateFloat(example),
            boolean: () => validateBoolean(example),
            string: (v2) =>
                validateStringWithRules({
                    example,
                    rules: v2.validation
                }),
            uuid: () => validateUuid(example),
            date: () => validateDate(example),
            dateTime: () => validateDateTime(example),
            base64: () => validateString(example),
            bigInteger: () => validateString(example),
            _other: () => {
                throw new Error("Unknown primitive type v2: " + primitiveType.v2);
            }
        });
    }
    return PrimitiveTypeV1._visit<ExampleViolation[]>(primitiveType.v1, {
        integer: () => validateInteger(example),
        long: () => validateLong(example),
        uint: () => validateUint(example),
        uint64: () => validateUint64(example),
        double: () => validateDouble(example),
        float: () => validateFloat(example),
        boolean: () => validateBoolean(example),
        string: () => validateString(example),
        uuid: () => validateUuid(example),
        dateTime: () => validateDateTime(example),
        date: () => validateDate(example),
        base64: () => validateString(example),
        bigInteger: () => validateString(example),
        _other: () => {
            throw new Error("Unknown primitive type: " + primitiveType.v1);
        }
    });
}

function validateIntegerWithRules({
    example,
    rules
}: {
    example: RawSchemas.ExampleTypeReferenceSchema;
    rules: IntegerValidationRules | undefined;
}): ExampleViolation[] {
    const violations = validateInteger(example);
    if (violations.length > 0 || rules == null) {
        return violations;
    }
    const integer = example as number;
    if (rules.min != null) {
        if ((rules.exclusiveMin && integer <= rules.min) || (!rules.exclusiveMin && integer < rules.min)) {
            return [
                {
                    message: `Expected integer to be greater than or equal to ${rules.min}. Example is ${example}.`
                }
            ];
        }
    }
    if (rules.max != null) {
        if ((rules.exclusiveMax && integer >= rules.max) || (!rules.exclusiveMax && integer > rules.max)) {
            return [
                {
                    message: `Expected integer to be less than or equal to ${rules.max}. Example is ${example}.`
                }
            ];
        }
    }
    if (rules.multipleOf != null) {
        if (integer % rules.multipleOf !== 0) {
            return [
                {
                    message: `Expected integer to be a multiple of ${rules.multipleOf}. Example is ${example}.`
                }
            ];
        }
    }
    return [];
}

function validateDoubleWithRules({
    example,
    rules
}: {
    example: RawSchemas.ExampleTypeReferenceSchema;
    rules: DoubleValidationRules | undefined;
}): ExampleViolation[] {
    const violations = validateDouble(example);
    if (violations.length > 0 || rules == null) {
        return violations;
    }
    const double = example as number;
    if (rules.min != null) {
        if ((rules.exclusiveMin && double <= rules.min) || (!rules.exclusiveMin && double < rules.min)) {
            return [
                {
                    message: `Expected double to be greater than or equal to ${rules.min}. Example is ${example}.`
                }
            ];
        }
    }
    if (rules.max != null) {
        if ((rules.exclusiveMax && double >= rules.max) || (!rules.exclusiveMax && double > rules.max)) {
            return [
                {
                    message: `Expected double to be less than or equal to ${rules.max}. Example is ${example}.`
                }
            ];
        }
    }
    if (rules.multipleOf != null) {
        if (double % rules.multipleOf !== 0) {
            return [
                {
                    message: `Expected double to be a multiple of ${rules.multipleOf}. Example is ${example}.`
                }
            ];
        }
    }
    return [];
}

function validateStringWithRules({
    example,
    rules
}: {
    example: RawSchemas.ExampleTypeReferenceSchema;
    rules: StringValidationRules | undefined;
}): ExampleViolation[] {
    const violations = validateString(example);
    if (violations.length > 0 || rules == null) {
        return violations;
    }
    const str = example as string;
    if (rules.minLength != null) {
        if (str.length < rules.minLength) {
            return [
                {
                    message: `Expected string length to be greater than or equal to ${rules.minLength}. Example is ${example}, which is of length ${str.length}.`
                }
            ];
        }
    }
    if (rules.maxLength != null) {
        if (str.length > rules.maxLength) {
            return [
                {
                    message: `Expected string length to be less than or equal to ${rules.maxLength}. Example is ${example}, which is of length ${str.length}.`
                }
            ];
        }
    }
    if (rules.pattern != null) {
        const regex = new RegExp(rules.pattern);
        if (!regex.test(str)) {
            return [
                {
                    message: `Expected string to match pattern ${rules.pattern}. Example is ${example}.`
                }
            ];
        }
    }
    // TODO(amckinney): Add support for the supported OpenAPI formats listed here: https://swagger.io/docs/specification/data-models/data-types
    return [];
}

const validateString = createValidator((example) => typeof example === "string", "a string");
const validateInteger = createValidator((example) => Number.isInteger(example), "an integer");
const validateUint = createValidator(
    (example) => Number.isInteger(example) && typeof example === "number" && example >= 0,
    "a uint"
);
const validateUint64 = createValidator(
    (example) => Number.isInteger(example) && typeof example === "number" && example >= 0,
    "a uint64"
);
const validateFloat = createValidator((example) => typeof example === "number", "a float");
const validateDouble = createValidator((example) => typeof example === "number", "a double");
const validateLong = createValidator((example) => Number.isInteger(example), "an integer");
const validateBoolean = createValidator((example) => typeof example === "boolean", "a boolean");
const validateUuid = createValidator((example) => typeof example === "string" && UUID_REGEX.test(example), "a UUID");
const validateDateTime = createValidator(
    (example) => typeof example === "string" && ISO_8601_REGEX.test(example),
    "an ISO 8601 timestamp"
);
const validateDate = createValidator(
    (example) => typeof example === "string" && RFC_3339_DATE_REGEX.test(example) && ISO_8601_REGEX.test(example),
    "a date"
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
        return actual._type === "primitive" && expected.primitive.v1 === actual.primitive.v1;
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
