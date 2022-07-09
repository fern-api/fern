import { HttpEndpoint, ServiceName } from "@fern-fern/ir-model/services";
import { getTextOfTsNode } from "@fern-typescript/commons";
import { HttpServiceTypeMetadata, ModelContext } from "@fern-typescript/model-context";
import { OptionalKind, PropertySignatureStructure, SourceFile } from "ts-morph";
import { GeneratedRequest, generateRequest } from "../commons/generate-request/generateRequest";
import { createHttpServiceTypeFileWriter } from "./createHttpServiceTypeFileWriter";

export declare namespace generateRequestTypes {
    export interface Args {
        endpoint: HttpEndpoint;
        serviceName: ServiceName;
        modelContext: ModelContext;
    }
}

export function generateRequestTypes({
    endpoint,
    serviceName,
    modelContext,
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
        ...endpoint.headers.map(
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
        writeServiceTypeFile: createHttpServiceTypeFileWriter({ modelContext, serviceName, endpoint }),
    });
}
