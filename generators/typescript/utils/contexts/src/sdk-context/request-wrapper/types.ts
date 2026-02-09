import { FernIr } from "@fern-fern/ir-sdk";
export interface RequestWrapperBodyProperty {
    propertyName: string;
    safeName: string;
}

export interface RequestWrapperNonBodyProperty {
    propertyName: string;
    safeName: string;
}

interface QueryParameterOriginalParameter {
    type: "query";
    parameter: FernIr.QueryParameter;
}

interface PathParameterOriginalParameter {
    type: "path";
    parameter: FernIr.PathParameter;
}

interface HeaderOriginalParameter {
    type: "header";
    parameter: FernIr.HttpHeader;
}

interface FileOriginalParameter {
    type: "file";
    parameter: FernIr.FileProperty;
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
