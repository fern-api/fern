import { CSharpFile } from "@fern-api/csharp-codegen";
import { WellKnownProtobufType } from "@fern-fern/ir-sdk/api";
import { ModelGeneratorContext } from "./ModelGeneratorContext";
import { ProtoConverterGenerator } from "./proto/ProtoConverterGenerator";
import { WellKnownProtoValueGenerator } from "./proto/WellKnownProtoValueGenerator";

export function generateWellKnownProtobufFiles(context: ModelGeneratorContext): CSharpFile[] | undefined {
    const wellKnownProtoStructType = context.protobufResolver.getProtobufStructType();
    const wellKnownProtoValueType = context.protobufResolver.getProtobufValueType();

    if (wellKnownProtoStructType == null && wellKnownProtoValueType == null) {
        return undefined;
    }

    if (wellKnownProtoStructType != null && wellKnownProtoValueType == null) {
        context.logger.debug(
            "Skipping well-known type generation a google.protobuf.Struct was defined without a google.protobuf.Value type."
        );
        return undefined;
    }

    if (wellKnownProtoStructType == null && wellKnownProtoValueType != null) {
        context.logger.debug(
            "Skipping well-known type generation a google.protobuf.Value was defined without a google.protobuf.Struct type."
        );
        return undefined;
    }

    const files: CSharpFile[] = [];
    if (wellKnownProtoStructType != null && wellKnownProtoValueType != null) {
        const resolvedProtoValueType = context.protobufResolver.resolveWellKnownProtobufTypeOrThrow(
            WellKnownProtobufType.value()
        );
        const wellKnownProtoValueClassReference = context.csharpTypeMapper.convertToClassReference(
            resolvedProtoValueType.typeDeclaration.name
        );

        const protoValueGenerator = new WellKnownProtoValueGenerator({
            context,
            classReference: wellKnownProtoValueClassReference,
            typeDeclaration: resolvedProtoValueType.typeDeclaration,
            wellKnownProtoValueType,
            wellKnownProtoStructType
        });
        files.push(protoValueGenerator.generate());

        const protoConverterGenerator = new ProtoConverterGenerator({
            context,
            wellKnownProtoValueClassReference,
            wellKnownProtoValueType,
            wellKnownProtoStructType
        });
        files.push(protoConverterGenerator.generate());
    }

    return files;
}
