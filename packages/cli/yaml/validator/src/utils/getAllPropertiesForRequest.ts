import { RelativeFilePath } from "@fern-api/fs-utils";
import { TypeResolverImpl } from "@fern-api/ir-generator";
import { FernWorkspace } from "@fern-api/workspace-loader";
import { isInlineRequestBody, RawSchemas } from "@fern-api/yaml-schema";
import {
    getAllPropertiesForObject,
    getAllPropertiesForType,
    ObjectPropertyWithPath,
} from "./getAllPropertiesForObject";

export function getAllPropertiesForRequest({
    endpoint,
    filepath,
    serviceFile,
    workspace,
}: {
    endpoint: RawSchemas.HttpEndpointSchema;
    filepath: RelativeFilePath;
    serviceFile: RawSchemas.ServiceFileSchema;
    workspace: FernWorkspace;
}): ObjectPropertyWithPath[] | undefined {
    if (endpoint.request == null) {
        return undefined;
    }

    const typeResolver = new TypeResolverImpl(workspace);

    if (typeof endpoint.request === "string") {
        return getAllPropertiesForType({
            typeName: endpoint.request,
            filepathOfDeclaration: filepath,
            serviceFile,
            workspace,
            typeResolver,
        });
    }

    if (endpoint.request.body == null) {
        return undefined;
    }

    if (typeof endpoint.request.body === "string" || !isInlineRequestBody(endpoint.request.body)) {
        return getAllPropertiesForType({
            typeName: typeof endpoint.request.body === "string" ? endpoint.request.body : endpoint.request.body.type,
            filepathOfDeclaration: filepath,
            serviceFile,
            workspace,
            typeResolver,
        });
    }

    return getAllPropertiesForObject({
        typeName: undefined,
        objectDeclaration: {
            extends: endpoint.request.body.extends,
            properties: endpoint.request.body.properties ?? {},
        },
        filepathOfDeclaration: filepath,
        serviceFile,
        workspace,
        typeResolver,
    });
}
