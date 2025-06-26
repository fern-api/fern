import { FieldDescriptorProto_Type } from "@bufbuild/protobuf/wkt";

export type ProtobufSettings = undefined;

export function getProtobufSettings(): ProtobufSettings {
    return undefined;
}

export const PRIMITIVE_TYPES = new Set([
    FieldDescriptorProto_Type.DOUBLE,
    FieldDescriptorProto_Type.FLOAT,
    FieldDescriptorProto_Type.INT64,
    FieldDescriptorProto_Type.UINT64,
    FieldDescriptorProto_Type.INT32,
    FieldDescriptorProto_Type.FIXED64,
    FieldDescriptorProto_Type.FIXED32,
    FieldDescriptorProto_Type.BOOL,
    FieldDescriptorProto_Type.STRING,
    FieldDescriptorProto_Type.BYTES,
    FieldDescriptorProto_Type.UINT32,
    FieldDescriptorProto_Type.SFIXED32,
    FieldDescriptorProto_Type.SFIXED64,
    FieldDescriptorProto_Type.SINT32,
    FieldDescriptorProto_Type.SINT64
]);
