import { ExamplePrimitive, PrimitiveType } from "@fern-api/ir-sdk";
import { assertNever, Examples } from "@fern-api/core-utils";
import { ExampleGenerationResult, ExampleGenerationSuccess } from "./ExampleGenerationResult";

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
            const jsonExample = fieldName ?? Examples.STRING;
            return { type: "success", example: ExamplePrimitive.string({ original: jsonExample }), jsonExample };
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
            return { type: "success", example: ExamplePrimitive.double(Examples.DOUBLE), jsonExample: Examples.DOUBLE };
        }
        case "FLOAT": {
            return { type: "success", example: ExamplePrimitive.float(Examples.FLOAT), jsonExample: Examples.FLOAT };
        }
        case "INTEGER": {
            return { type: "success", example: ExamplePrimitive.integer(Examples.INT), jsonExample: Examples.INT };
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
