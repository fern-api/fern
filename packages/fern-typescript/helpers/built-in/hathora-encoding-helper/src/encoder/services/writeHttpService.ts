import { HttpEndpoint, HttpService } from "@fern-api/api";
import { FernWriters, getTextOfTsNode, TypeResolver } from "@fern-typescript/commons";
import { ts, tsMorph } from "@fern-typescript/helper-utils";
import { ServiceTypesConstants } from "@fern-typescript/service-types";
import { constructEncodeMethods } from "../constructEncodeMethods";
import { getEncodeMethodsForType } from "../model/writeModel";

export function writeHttpService({
    service,
    typeResolver,
    file,
    modelDirectory,
}: {
    service: HttpService;
    typeResolver: TypeResolver;
    file: tsMorph.SourceFile;
    modelDirectory: tsMorph.Directory;
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
}: {
    endpoint: HttpEndpoint;
    service: HttpService;
    typeResolver: TypeResolver;
    file: tsMorph.SourceFile;
    modelDirectory: tsMorph.Directory;
}): tsMorph.WriterFunction {
    const writer = FernWriters.object.writer({ newlinesBetweenProperties: true });
    if (endpoint.request.type._type !== "alias") {
        writer.addProperty({
            key: ServiceTypesConstants.Commons.Request.Properties.Body.TYPE_NAME,
            value: getTextOfTsNode(
                constructEncodeMethods({
                    methods: getEncodeMethodsForType({
                        decodedType: ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword),
                        typeDefinition: {
                            docs: undefined,
                            name: {
                                name: ServiceTypesConstants.Commons.Request.Properties.Body.TYPE_NAME,
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
            key: ServiceTypesConstants.Commons.Response.Success.Properties.Body.TYPE_NAME,
            value: getTextOfTsNode(
                constructEncodeMethods({
                    methods: getEncodeMethodsForType({
                        decodedType: ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword),
                        typeDefinition: {
                            docs: undefined,
                            name: {
                                name: ServiceTypesConstants.Commons.Response.Success.Properties.Body.TYPE_NAME,
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
