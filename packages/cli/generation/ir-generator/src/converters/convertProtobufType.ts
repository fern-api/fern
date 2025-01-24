import { RawSchemas } from "@fern-api/fern-definition-schema";
import { ProtobufType, WellKnownProtobufType } from "@fern-api/ir-sdk";
import { ResolvedSource } from "@fern-api/source-resolver";

import { CASINGS_GENERATOR } from "../utils/getAllPropertiesForObject";
import { convertProtobufFile } from "./convertProtobufFile";

export function convertSourceToProtobufType({
    name,
    source
}: {
    name: string;
    source: ResolvedSource.Protobuf;
}): ProtobufType {
    return ProtobufType.userDefined({
        file: convertProtobufFile({ source }),
        // Use the global casings generator so that the name is not
        // affected by the user's casing settings (e.g. smart-casing).
        name: CASINGS_GENERATOR.generateName(name)
    });
}

export function maybeConvertEncodingToProtobufType({
    encoding
}: {
    encoding: RawSchemas.EncodingSchema;
}): ProtobufType | undefined {
    if (encoding.proto != null && encoding.proto.type != null) {
        const wellKnownType = maybeConvertWellKnownProtobufType({ type: encoding.proto.type });
        if (wellKnownType != null) {
            return wellKnownType;
        }
    }
    return undefined;
}

function maybeConvertWellKnownProtobufType({ type }: { type: string }): ProtobufType | undefined {
    switch (type) {
        case "google.protobuf.Any":
            return ProtobufType.wellKnown(WellKnownProtobufType.any());
        case "google.protobuf.Api":
            return ProtobufType.wellKnown(WellKnownProtobufType.api());
        case "google.protobuf.BoolValue":
            return ProtobufType.wellKnown(WellKnownProtobufType.boolValue());
        case "google.protobuf.BytesValue":
            return ProtobufType.wellKnown(WellKnownProtobufType.bytesValue());
        case "google.protobuf.DoubleValue":
            return ProtobufType.wellKnown(WellKnownProtobufType.doubleValue());
        case "google.protobuf.Duration":
            return ProtobufType.wellKnown(WellKnownProtobufType.duration());
        case "google.protobuf.Empty":
            return ProtobufType.wellKnown(WellKnownProtobufType.empty());
        case "google.protobuf.Enum":
            return ProtobufType.wellKnown(WellKnownProtobufType.enum());
        case "google.protobuf.EnumValue":
            return ProtobufType.wellKnown(WellKnownProtobufType.enumValue());
        case "google.protobuf.Field":
            return ProtobufType.wellKnown(WellKnownProtobufType.field());
        case "google.protobuf.FieldCardinality":
            return ProtobufType.wellKnown(WellKnownProtobufType.fieldCardinality());
        case "google.protobuf.FieldKind":
            return ProtobufType.wellKnown(WellKnownProtobufType.fieldKind());
        case "google.protobuf.FieldMask":
            return ProtobufType.wellKnown(WellKnownProtobufType.fieldMask());
        case "google.protobuf.FloatVlaue":
            return ProtobufType.wellKnown(WellKnownProtobufType.floatValue());
        case "google.protobuf.Int32Value":
            return ProtobufType.wellKnown(WellKnownProtobufType.int32Value());
        case "google.protobuf.Int64Value":
            return ProtobufType.wellKnown(WellKnownProtobufType.int64Value());
        case "google.protobuf.ListValue":
            return ProtobufType.wellKnown(WellKnownProtobufType.listValue());
        case "google.protobuf.Method":
            return ProtobufType.wellKnown(WellKnownProtobufType.method());
        case "google.protobuf.Mixin":
            return ProtobufType.wellKnown(WellKnownProtobufType.mixin());
        case "google.protobuf.NullValue":
            return ProtobufType.wellKnown(WellKnownProtobufType.nullValue());
        case "google.protobuf.Option":
            return ProtobufType.wellKnown(WellKnownProtobufType.option());
        case "google.protobuf.SourceContext":
            return ProtobufType.wellKnown(WellKnownProtobufType.sourceContext());
        case "google.protobuf.StringValue":
            return ProtobufType.wellKnown(WellKnownProtobufType.stringValue());
        case "google.protobuf.Struct":
            return ProtobufType.wellKnown(WellKnownProtobufType.struct());
        case "google.protobuf.Syntax":
            return ProtobufType.wellKnown(WellKnownProtobufType.syntax());
        case "google.protobuf.Timestamp":
            return ProtobufType.wellKnown(WellKnownProtobufType.timestamp());
        case "google.protobuf.Type":
            return ProtobufType.wellKnown(WellKnownProtobufType.type());
        case "google.protobuf.Uint32Value":
            return ProtobufType.wellKnown(WellKnownProtobufType.uint32Value());
        case "google.protobuf.Uint64Value":
            return ProtobufType.wellKnown(WellKnownProtobufType.uint64Value());
        case "google.protobuf.Value":
            return ProtobufType.wellKnown(WellKnownProtobufType.value());
    }
    return undefined;
}
