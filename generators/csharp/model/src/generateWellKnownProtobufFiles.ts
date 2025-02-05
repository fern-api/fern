import { CSharpFile } from "@fern-api/csharp-codegen";

import { WellKnownProtobufType } from "@fern-fern/ir-sdk/api";

import { ModelGeneratorContext } from "./ModelGeneratorContext";
import { WellKnownProtoStructGenerator } from "./proto/WellKnownProtoStructGenerator";
import { WellKnownProtoValueGenerator } from "./proto/WellKnownProtoValueGenerator";

export function generateWellKnownProtobufFiles(context: ModelGeneratorContext): CSharpFile[] | undefined {
    const resolvedProtoStructType = context.protobufResolver.resolveWellKnownProtobufType(
        WellKnownProtobufType.struct()
    );
    const resolvedProtoValueType = context.protobufResolver.resolveWellKnownProtobufType(WellKnownProtobufType.value());

    if (resolvedProtoStructType == null && resolvedProtoValueType == null) {
        return undefined;
    }

    if (resolvedProtoStructType != null && resolvedProtoValueType == null) {
        context.logger.debug(
            "Skipping well-known type generation a google.protobuf.Struct was defined without a google.protobuf.Value type."
        );
        return undefined;
    }

    if (resolvedProtoStructType == null && resolvedProtoValueType != null) {
        context.logger.debug(
            "Skipping well-known type generation a google.protobuf.Value was defined without a google.protobuf.Struct type."
        );
        return undefined;
    }

    const files: CSharpFile[] = [];
    if (resolvedProtoStructType != null && resolvedProtoValueType != null) {
        const protoStructClassReference = context.csharpTypeMapper.convertToClassReference(
            resolvedProtoStructType.typeDeclaration.name
        );
        const protoValueClassReference = context.csharpTypeMapper.convertToClassReference(
            resolvedProtoValueType.typeDeclaration.name
        );

        const protoStructGenerator = new WellKnownProtoStructGenerator({
            context,
            classReference: protoStructClassReference,
            typeDeclaration: resolvedProtoStructType.typeDeclaration,
            protoValueClassReference
        });
        files.push(protoStructGenerator.generate());

        const protoValueGenerator = new WellKnownProtoValueGenerator({
            context,
            classReference: protoValueClassReference,
            typeDeclaration: resolvedProtoValueType.typeDeclaration,
            protoStructClassReference
        });
        files.push(protoValueGenerator.generate());
    }

    return files;
}
