import { FileProperty, HttpHeader, PathParameter, QueryParameter } from "@fern-fern/ir-sdk";

export interface RequestWrapperNonBodyProperty {
    propertyName: string;
    safeName: string;
}

interface QueryParameterOriginalParameter {
    type: "query";
    parameter: QueryParameter;
}

interface PathParameterOriginalParameter {
    type: "path";
    parameter: PathParameter;
}

interface HeaderOriginalParameter {
    type: "header";
    parameter: HttpHeader;
}

interface FileOriginalParameter {
    type: "file";
    parameter: FileProperty;
}

type OriginalParameter<T extends "query" | "path" | "header" | "file"> = T extends "query"
    ? QueryParameterOriginalParameter
    : T extends "path"
      ? PathParameterOriginalParameter
      : T extends "header"
        ? HeaderOriginalParameter
        : FileOriginalParameter;

export interface RequestWrapperNonBodyPropertyWithData extends RequestWrapperNonBodyProperty {
    originalParameter?: OriginalParameter<"query" | "path" | "header" | "file">;
}
