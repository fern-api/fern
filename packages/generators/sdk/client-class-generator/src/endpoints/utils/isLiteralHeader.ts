import { HttpHeader } from "@fern-fern/ir-model/http";
import { SdkContext } from "@fern-typescript/contexts";

export function isLiteralHeader(header: HttpHeader, context: SdkContext): boolean {
    return getLiteralValueForHeader(header, context) != null;
}

export function getLiteralValueForHeader(header: HttpHeader, context: SdkContext): string | undefined {
    const resolvedType = context.type.resolveTypeReference(header.valueType);
    if (resolvedType._type === "container" && resolvedType.container._type === "literal") {
        return resolvedType.container.literal.string;
    } else {
        return undefined;
    }
}
