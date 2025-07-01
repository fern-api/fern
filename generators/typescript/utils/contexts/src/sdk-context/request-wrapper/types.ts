export interface RequestWrapperNonBodyProperty {
    propertyName: string;
    safeName: string;
}
import {
    FileProperty,
    HttpHeader,
    PathParameter,
    QueryParameter
} from "@fern-fern/ir-sdk/api";

export interface RequestWrapperNonBodyPropertyWithData extends RequestWrapperNonBodyProperty {
    originalParameter?: {
        type: "query" | "path" | "header" | "file";
        parameter: QueryParameter | PathParameter | HttpHeader | FileProperty
    };
}
