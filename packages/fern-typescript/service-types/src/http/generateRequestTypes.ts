import { HttpEndpoint, HttpHeader, HttpService } from "@fern-fern/ir-model/services";
import { getTextOfTsNode } from "@fern-typescript/commons";
import { HttpServiceTypeMetadata, ModelContext } from "@fern-typescript/model-context";
import { OptionalKind, PropertySignatureStructure, SourceFile } from "ts-morph";
import { GeneratedRequest, generateRequest } from "../commons/generate-request/generateRequest";
import { ServiceTypesGenerationMode } from "../types";
import { createHttpServiceTypeFileWriter } from "./createHttpServiceTypeFileWriter";

export declare namespace generateRequestTypes {
    export interface Args {
        service: HttpService;
        endpoint: HttpEndpoint;
        modelContext: ModelContext;
        mode: ServiceTypesGenerationMode;
    }
}

export function generateRequestTypes({
    service,
    endpoint,
    modelContext,
    mode,
}: generateRequestTypes.Args): GeneratedRequest<HttpServiceTypeMetadata> {
    const additionalProperties = [
        ...[...endpoint.pathParameters, ...endpoint.queryParameters].map(
            (parameter) =>
                (requestFile: SourceFile): OptionalKind<PropertySignatureStructure> => ({
                    name: parameter.key,
                    docs: parameter.docs != null ? [parameter.docs] : undefined,
                    type: getTextOfTsNode(
                        modelContext.getReferenceToType({
                            reference: parameter.valueType,
                            referencedIn: requestFile,
                        })
                    ),
                })
        ),
        ...getHeaders({ service, endpoint, mode }).map(
            (header) =>
                (requestFile: SourceFile): OptionalKind<PropertySignatureStructure> => ({
                    name: `"${header.header}"`,
                    docs: header.docs != null ? [header.docs] : undefined,
                    type: getTextOfTsNode(
                        modelContext.getReferenceToType({
                            reference: header.valueType,
                            referencedIn: requestFile,
                        })
                    ),
                })
        ),
    ];

    return generateRequest({
        getTypeReferenceToServiceType: ({ reference, referencedIn }) =>
            modelContext.getReferenceToHttpServiceType({
                reference,
                referencedIn,
            }),
        body: {
            typeReference: endpoint.request.type,
            docs: endpoint.request.docs,
        },
        additionalProperties,
        writeServiceTypeFile: createHttpServiceTypeFileWriter({ modelContext, serviceName: service.name, endpoint }),
    });
}

function getHeaders({
    service,
    endpoint,
    mode,
}: {
    service: HttpService;
    endpoint: HttpEndpoint;
    mode: ServiceTypesGenerationMode;
}): HttpHeader[] {
    switch (mode) {
        // for clients, the request only includes the endpoint-level headers.
        // service-level headers are passed in when the servie is instantiated.
        case "client":
            return [...endpoint.headers];
        // for servers, each request contains all headers
        case "server":
            return [...service.headers, ...endpoint.headers];
    }
}
