import { TypeDeclaration, WellKnownProtobufType } from "@fern-fern/ir-sdk/api";

/**
 * An instance of Google's well-known Protobuf types. These types often require
 * special handling (e.g. custom serialization).
 *
 * For an exhaustive list, see https://protobuf.dev/reference/protobuf/google.protobuf
 */
export interface ResolvedWellKnownProtobufType {
    typeDeclaration: TypeDeclaration;
    wellKnownProtobufType: WellKnownProtobufType;
}
