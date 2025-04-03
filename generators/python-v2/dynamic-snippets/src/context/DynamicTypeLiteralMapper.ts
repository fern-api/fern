import { Severity } from "@fern-api/browser-compatible-base-generator";
import { assertNever } from "@fern-api/core-utils";
import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { python } from "@fern-api/python-ast";

import { DynamicSnippetsGeneratorContext } from "./DynamicSnippetsGeneratorContext";

export declare namespace DynamicTypeLiteralMapper {
    interface Args {
        typeReference: FernIr.dynamic.TypeReference;
        value: unknown;
        as?: ConvertedAs;
    }

    // Identifies what the type is being converted as, which sometimes influences how
    // the type is instantiated.
    type ConvertedAs = "key";
}

export class DynamicTypeLiteralMapper {
    private context: DynamicSnippetsGeneratorContext;

    constructor({ context }: { context: DynamicSnippetsGeneratorContext }) {
        this.context = context;
    }

    public convert(args: DynamicTypeLiteralMapper.Args): python.TypeInstantiation {
        // eslint-disable-next-line eqeqeq
        if (args.value === null) {
            if (this.context.isNullable(args.typeReference)) {
                return python.TypeInstantiation.none();
            }
            this.context.errors.add({
                severity: Severity.Critical,
                message: "Expected non-null value, but got null"
            });
            return python.TypeInstantiation.none();
        }
        if (args.value === undefined) {
            return python.TypeInstantiation.none();
        }
        switch (args.typeReference.type) {
            case "list":
            case "literal":
            case "map":
            case "named":
            case "nullable":
            case "optional":
            case "primitive":
            case "set":
            case "unknown":
                return python.TypeInstantiation.none();
            default:
                assertNever(args.typeReference);
        }
    }
}
