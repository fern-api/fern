import { assertNever } from "@fern-api/core-utils";
import { SdkContext } from "@fern-typescript/contexts";
import { ts } from "ts-morph";

export function getReadableTypeNode({
    typeArgument,
    context,
    streamType
}: {
    typeArgument?: ts.TypeNode;
    context: SdkContext;
    streamType: "wrapper" | "web";
}): ts.TypeNode {
    switch (streamType) {
        case "wrapper":
            return context.externalDependencies.stream.Readable._getReferenceToType();
        case "web":
            return ts.factory.createTypeReferenceNode(
                "ReadableStream",
                typeArgument != null ? [typeArgument] : undefined
            );
        default:
            assertNever(streamType);
    }
}
