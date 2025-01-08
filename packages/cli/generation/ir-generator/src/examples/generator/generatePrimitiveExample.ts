import { Examples, assertNever } from "@fern-api/core-utils";
import {
    DoubleValidationRules,
    ExamplePrimitive,
    IntegerValidationRules,
    PrimitiveType,
    PrimitiveTypeV2,
    StringValidationRules
} from "@fern-api/ir-sdk";

import { ExampleGenerationSuccess } from "./ExampleGenerationResult";

export declare namespace generatePrimitiveExample {
    interface Args {
        /* The field name that the example is being generated for*/
        fieldName?: string;
        primitiveType: PrimitiveType;
    }
}

export function generatePrimitiveExample({
    fieldName,
    primitiveType
}: generatePrimitiveExample.Args): ExampleGenerationSuccess<ExamplePrimitive> {
    switch (primitiveType.v1) {
        case "STRING": {
            return generatePrimitiveStringExample({
                fieldName,
                validation: maybeStringValidation(primitiveType.v2)
            });
        }
        case "BASE_64": {
            return { type: "success", example: ExamplePrimitive.base64(Examples.BASE64), jsonExample: Examples.BASE64 };
        }
        case "BOOLEAN": {
            return {
                type: "success",
                example: ExamplePrimitive.boolean(Examples.BOOLEAN),
                jsonExample: Examples.BOOLEAN
            };
        }
        case "DATE": {
            return { type: "success", example: ExamplePrimitive.date(Examples.DATE), jsonExample: Examples.DATE };
        }
        case "DATE_TIME": {
            return {
                type: "success",
                example: ExamplePrimitive.datetime({
                    datetime: new Date(Examples.DATE_TIME),
                    raw: Examples.DATE_TIME
                }),
                jsonExample: Examples.DATE_TIME
            };
        }
        case "DOUBLE": {
            return generatePrimitiveDoubleExample({
                fieldName,
                validation: maybeDoubleValidation(primitiveType.v2)
            });
        }
        case "FLOAT": {
            return { type: "success", example: ExamplePrimitive.float(Examples.FLOAT), jsonExample: Examples.FLOAT };
        }
        case "INTEGER": {
            return generatePrimitiveIntegerExample({
                fieldName,
                validation: maybeIntegerValidation(primitiveType.v2)
            });
        }
        case "UINT_64": {
            return { type: "success", example: ExamplePrimitive.uint64(Examples.INT64), jsonExample: Examples.INT64 };
        }
        case "UINT": {
            return { type: "success", example: ExamplePrimitive.uint(Examples.UINT), jsonExample: Examples.UINT };
        }
        case "BIG_INTEGER": {
            return {
                type: "success",
                example: ExamplePrimitive.bigInteger(Examples.INT64.toString()),
                jsonExample: `${Examples.INT64}`
            };
        }
        case "LONG": {
            return { type: "success", example: ExamplePrimitive.long(Examples.INT64), jsonExample: Examples.INT64 };
        }
        case "UUID": {
            return { type: "success", example: ExamplePrimitive.uuid(Examples.UUID), jsonExample: Examples.UUID };
        }
        default:
            assertNever(primitiveType.v1);
    }
}

function maybeStringValidation(v2: PrimitiveTypeV2 | undefined): StringValidationRules | undefined {
    if (v2?.type === "string") {
        const stringType = v2 as PrimitiveTypeV2.String;
        return stringType.validation;
    }
    return undefined;
}

function maybeDoubleValidation(v2: PrimitiveTypeV2 | undefined): DoubleValidationRules | undefined {
    if (v2?.type === "double") {
        const doubleType = v2 as PrimitiveTypeV2.Double;
        return doubleType.validation;
    }
    return undefined;
}

function maybeIntegerValidation(v2: PrimitiveTypeV2 | undefined): IntegerValidationRules | undefined {
    if (v2?.type === "integer") {
        const integerType = v2 as PrimitiveTypeV2.Integer;
        return integerType.validation;
    }
    return undefined;
}

function getStringExampleOfLength(length: number): string {
    if (length <= Examples.SAMPLE_STRINGS.length) {
        const sampleString = Examples.SAMPLE_STRINGS[length - 1];
        if (sampleString) {
            return sampleString;
        } else {
            throw new Error(`Unexpected undefined value in SAMPLE_STRINGS at index ${length - 1}`);
        }
    }
    return (
        Examples.SAMPLE_STRINGS[Examples.SAMPLE_STRINGS.length - 1] +
        ".".repeat(length - Examples.SAMPLE_STRINGS.length)
    );
}

function generatePrimitiveStringExample({
    fieldName,
    validation
}: {
    fieldName: string | undefined;
    validation: StringValidationRules | undefined;
}): ExampleGenerationSuccess<ExamplePrimitive> {
    if (validation) {
        const minLength = validation.minLength;
        const maxLength = validation.maxLength;
        if (minLength) {
            const minLengthExample = getStringExampleOfLength(minLength);
            return {
                type: "success",
                example: ExamplePrimitive.string({ original: minLengthExample }),
                jsonExample: minLengthExample
            };
        } else if (maxLength) {
            const maxLengthExample = getStringExampleOfLength(maxLength);
            return {
                type: "success",
                example: ExamplePrimitive.string({ original: maxLengthExample }),
                jsonExample: maxLengthExample
            };
        }
    }
    const jsonExample = fieldName ?? Examples.STRING;
    return { type: "success", example: ExamplePrimitive.string({ original: jsonExample }), jsonExample };
}

function generatePrimitiveDoubleExample({
    fieldName,
    validation
}: {
    fieldName: string | undefined;
    validation: DoubleValidationRules | undefined;
}): ExampleGenerationSuccess<ExamplePrimitive> {
    if (validation) {
        const maximum = validation.max;
        const minimum = validation.min;
        if (maximum) {
            return { type: "success", example: ExamplePrimitive.double(maximum), jsonExample: maximum };
        } else if (minimum) {
            return { type: "success", example: ExamplePrimitive.double(minimum), jsonExample: minimum };
        }
    }
    return { type: "success", example: ExamplePrimitive.double(Examples.DOUBLE), jsonExample: Examples.DOUBLE };
}

function generatePrimitiveIntegerExample({
    fieldName,
    validation
}: {
    fieldName: string | undefined;
    validation: IntegerValidationRules | undefined;
}): ExampleGenerationSuccess<ExamplePrimitive> {
    if (validation) {
        const maximum = validation.max;
        const minimum = validation.min;
        if (maximum) {
            return { type: "success", example: ExamplePrimitive.integer(maximum), jsonExample: maximum };
        } else if (minimum) {
            return { type: "success", example: ExamplePrimitive.integer(minimum), jsonExample: minimum };
        }
    }
    return { type: "success", example: ExamplePrimitive.integer(Examples.INT), jsonExample: Examples.INT };
}
