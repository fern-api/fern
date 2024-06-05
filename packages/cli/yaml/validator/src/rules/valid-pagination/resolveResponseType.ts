import { FernFileContext, ResolvedType, TypeResolver } from "@fern-api/ir-generator";
import { RawSchemas } from "@fern-api/yaml-schema";

export async function resolveResponseType({
    endpoint,
    typeResolver,
    file
}: {
    endpoint: RawSchemas.HttpEndpointSchema;
    typeResolver: TypeResolver;
    file: FernFileContext;
}): Promise<ResolvedType | undefined> {
    const responseType = typeof endpoint.response !== "string" ? endpoint.response?.type : endpoint.response;
    if (responseType == null) {
        return undefined;
    }
    return await typeResolver.resolveType({
        type: responseType,
        file
    });
}
