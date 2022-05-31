import { ContainerType, PrimitiveType } from "@fern-api/api";
import { assertNever } from "./utils/assertNever";

export const HathoraEncoderConstants = {
    NAME: "HathoraEncoder",

    BinSerDe: {
        NAMESPACE_IMPORT: "binSerde",
        Exports: {
            READER: "Reader",
            WRITER: "Writer",
        },
    },

    Primitives: {
        NAME: "Primitives",
    },
    Containers: {
        NAME: "Containers",
    },
    Model: {
        NAME: "Model",
    },
    Services: {
        NAME: "Services",
    },
    Errors: {
        NAME: "Errors",
    },
};

export function getEncoderNameForPrimitive(primitiveType: PrimitiveType): string {
    return PrimitiveType._visit(primitiveType, {
        integer: () => "Integer",
        double: () => "Double",
        string: () => "String",
        boolean: () => "Boolean",
        long: () => "Long",
        _unknown: () => {
            throw new Error("Unknown primitive type: " + primitiveType);
        },
    });
}

export function getEncoderNameForContainer(containerType: ContainerType["_type"]): string {
    switch (containerType) {
        case "list":
            return "List";
        case "optional":
            return "Optional";
        case "set":
            return "Set";
        case "map":
            return "Map";
        default:
            assertNever(containerType);
    }
}
