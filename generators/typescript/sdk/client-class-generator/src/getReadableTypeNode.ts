import { assertNever } from "@fern-api/core-utils";
import { FileContext } from "@fern-typescript/contexts";
import { ts } from "ts-morph";

export function getReadableTypeNode({
    typeArgument,
    context,
    streamType
}: {
    typeArgument?: ts.TypeNode;
    context: FileContext;
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
