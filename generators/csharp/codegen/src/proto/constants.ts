import * as csharp from "../csharp";

export const WELL_KNOWN_PROTO_TYPES_NAMESPACE = "Google.Protobuf.WellKnownTypes";

export const EXTERNAL_PROTO_STRUCT_CLASS_REFERENCE = csharp.classReference({
    name: "Struct",
    namespace: WELL_KNOWN_PROTO_TYPES_NAMESPACE,
    namespaceAlias: "WellKnownProto"
});

export const EXTERNAL_PROTO_VALUE_CLASS_REFERENCE = csharp.classReference({
    name: "Value",
    namespace: WELL_KNOWN_PROTO_TYPES_NAMESPACE,
    namespaceAlias: "WellKnownProto"
});

export const EXTERNAL_PROTO_LIST_VALUE_CLASS_REFERENCE = csharp.classReference({
    name: "ListValue",
    namespace: WELL_KNOWN_PROTO_TYPES_NAMESPACE,
    namespaceAlias: "WellKnownProto"
});

export const EXTERNAL_PROTO_TIMESTAMP_CLASS_REFERENCE = csharp.classReference({
    name: "Timestamp",
    namespace: WELL_KNOWN_PROTO_TYPES_NAMESPACE,
    namespaceAlias: "WellKnownProto"
});
