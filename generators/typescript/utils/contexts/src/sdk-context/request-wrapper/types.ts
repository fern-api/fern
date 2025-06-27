export interface RequestWrapperNonBodyProperty {
    propertyName: string;
    safeName: string;
}

export interface RequestWrapperNonBodyPropertyWithData extends RequestWrapperNonBodyProperty {
    originalParameter?: {
        type: "query" | "path" | "header" | "file";
        parameter: any; // QueryParameter | PathParameter | HttpHeader | FileProperty
    };
}
