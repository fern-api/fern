import { HttpEndpoint, HttpService } from "@fern-api/api";
import { ClientConstants, getLocalEndpointTypeReference } from "@fern-typescript/client";
import { FernWriters, getTextOfTsNode, TypeResolver } from "@fern-typescript/commons";
import { tsMorph } from "@fern-typescript/helper-utils";
import { constructEncodeMethods } from "../constructEncodeMethods";
import { getEncodeMethodsForType } from "../model/writeModel";

export function writeHttpService({
    service,
    typeResolver,
    file,
    modelDirectory,
    servicesDirectory,
}: {
    service: HttpService;
    typeResolver: TypeResolver;
    file: tsMorph.SourceFile;
    modelDirectory: tsMorph.Directory;
    servicesDirectory: tsMorph.Directory;
}): tsMorph.WriterFunction {
    const writer = FernWriters.object.writer({ newlinesBetweenProperties: true });
    for (const endpoint of service.endpoints) {
        writer.addProperty({
            key: endpoint.endpointId,
            value: writeHttpEndpoint({
                endpoint,
                service,
                typeResolver,
                file,
                modelDirectory,
                servicesDirectory,
            }),
        });
    }
    return writer.toFunction();
}

function writeHttpEndpoint({
    endpoint,
    service,
    typeResolver,
    file,
    modelDirectory,
    servicesDirectory,
}: {
    endpoint: HttpEndpoint;
    service: HttpService;
    typeResolver: TypeResolver;
    file: tsMorph.SourceFile;
    modelDirectory: tsMorph.Directory;
    servicesDirectory: tsMorph.Directory;
}): tsMorph.WriterFunction {
    const writer = FernWriters.object.writer({ newlinesBetweenProperties: true });
    if (endpoint.request.type._type !== "alias") {
        writer.addProperty({
            key: ClientConstants.HttpService.Endpoint.Types.Request.Properties.Body.TYPE_NAME,
            value: getTextOfTsNode(
                constructEncodeMethods({
                    methods: getEncodeMethodsForType({
                        decodedType: getLocalEndpointTypeReference({
                            serviceName: service.name,
                            endpointId: endpoint.endpointId,
                            typeName: ClientConstants.HttpService.Endpoint.Types.Request.Properties.Body.TYPE_NAME,
                            referencedIn: file,
                            servicesDirectory,
                        }),
                        typeDefinition: {
                            docs: undefined,
                            name: {
                                name: ClientConstants.HttpService.Endpoint.Types.Request.Properties.Body.TYPE_NAME,
                                fernFilepath: service.name.fernFilepath,
                            },
                            shape: endpoint.request.type,
                        },
                        typeResolver,
                        file,
                        modelDirectory,
                    }),
                })
            ),
        });
    }

    if (endpoint.response.ok.type._type !== "alias") {
        writer.addProperty({
            key: ClientConstants.HttpService.Endpoint.Types.Response.Success.Properties.Body.TYPE_NAME,
            value: getTextOfTsNode(
                constructEncodeMethods({
                    methods: getEncodeMethodsForType({
                        decodedType: getLocalEndpointTypeReference({
                            serviceName: service.name,
                            endpointId: endpoint.endpointId,
                            typeName:
                                ClientConstants.HttpService.Endpoint.Types.Response.Success.Properties.Body.TYPE_NAME,
                            referencedIn: file,
                            servicesDirectory,
                        }),
                        typeDefinition: {
                            docs: undefined,
                            name: {
                                name: ClientConstants.HttpService.Endpoint.Types.Response.Success.Properties.Body
                                    .TYPE_NAME,
                                fernFilepath: service.name.fernFilepath,
                            },
                            shape: endpoint.response.ok.type,
                        },
                        typeResolver,
                        file,
                        modelDirectory,
                    }),
                })
            ),
        });
    }

    // TODO add errors

    return writer.toFunction();
}
