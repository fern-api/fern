import { FernIr } from "@fern-fern/ir-sdk";
import { FileContext } from "@fern-typescript/contexts";

/**
 * Whether a value of the given type must be run through `context.type.stringify`
 * to produce its wire representation, rather than being placed directly into the
 * headers/query object. Containers, named types, and date/datetime primitives all
 * need formatting (e.g. `date`/`datetime` serialize to ISO-8601); other primitives
 * are already coerced correctly by the fetcher/query builder.
 *
 * Shared by header generation and global-parameter injection so the two agree; it
 * lives in its own module to avoid an import cycle between them.
 */
export function typeNeedsStringify(type: FernIr.TypeReference, context: FileContext): boolean {
    return type._visit({
        container: (containerType) => {
            return containerType._visit({
                list: () => true,
                map: () => true,
                set: () => true,
                literal: () => false,
                optional: (innerType) => typeNeedsStringify(innerType, context),
                nullable: (innerType) => typeNeedsStringify(innerType, context),
                _other: () => true
            });
        },
        named: (namedType) => {
            const declaration = context.type.getTypeDeclaration(namedType);
            return declaration.shape._visit({
                alias: (alias) => typeNeedsStringify(alias.aliasOf, context),
                enum: () => false,
                object: () => true,
                union: () => true,
                undiscriminatedUnion: () => true,
                _other: () => true
            });
        },
        primitive: (primitiveType) => {
            switch (primitiveType.v1) {
                case "INTEGER":
                case "LONG":
                case "UINT":
                case "UINT_64":
                case "FLOAT":
                case "DOUBLE":
                case "BOOLEAN":
                case "STRING":
                case "UUID":
                case "BASE_64":
                case "BIG_INTEGER":
                    return false;
                case "DATE":
                case "DATE_TIME":
                case "DATE_TIME_RFC_2822":
                    return true;
                default:
                    return false;
            }
        },
        unknown: () => true,
        _other: () => true
    });
}
