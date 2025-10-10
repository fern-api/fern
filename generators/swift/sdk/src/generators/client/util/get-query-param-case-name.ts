import { assertNever } from "@fern-api/core-utils";
import { swift } from "@fern-api/swift-codegen";

// TODO(kafkas): Remove this
export function getQueryParamCaseName(swiftType: swift.Type): string {
    switch (swiftType.type) {
        case "optional":
            return getQueryParamCaseName(swift.Type.nonOptional(swiftType));
        case "nullable":
            return getQueryParamCaseName(swift.Type.nonNullable(swiftType));
        case "custom":
            // TODO(kafkas): We are currently assuming that this refers to a string enum.
            // Need to handle other cases.
            return "string";
        case "string":
            return "string";
        case "bool":
            return "bool";
        case "int":
            return "int";
        case "uint":
            return "uint";
        case "uint64":
            return "uint64";
        case "int64":
            return "int64";
        case "float":
            return "float";
        case "double":
            return "double";
        case "date":
            return "date";
        case "calendar-date":
            return "calendarDate";
        case "array":
            // TODO(kafkas): We are assuming string array for now.
            // Revise this to support more complex query param types.
            return "stringArray";
        case "uuid":
            return "uuid";
        // TODO(kafkas): The following are currently unsupported.
        case "data":
            return "data";
        case "tuple":
            return "unknown";
        case "dictionary":
            return "unknown";
        case "void":
            return "unknown";
        case "any":
            return "unknown";
        case "existential-any":
            return "unknown";
        case "json-value":
            return "unknown";
        default:
            assertNever(swiftType.type);
    }
}
