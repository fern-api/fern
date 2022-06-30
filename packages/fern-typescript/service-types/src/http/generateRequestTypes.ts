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
    const getAdditionalProperties = [
        ...[...endpoint.pathParameters, ...endpoint.queryParameters].map(
            (parameter) =>
                (requestFile: SourceFile): OptionalKind<PropertySignatureStructure> => ({
                    name: parameter.key,
                    type: getTextOfTsNode(
                        modelContext.getReferenceToType({
                            reference: parameter.valueType,
                            referencedIn: requestFile,
                        })
                    ),
                })
        ),
    ];

    return generateRequest({
        modelContext,
        getTypeReferenceToServiceType: ({ reference, referencedIn }) =>
            modelContext.getReferenceToHttpServiceType({
                reference,
                referencedIn,
            }),
        body: {
            type: endpoint.request.type,
            docs: endpoint.request.docs,
        },
        additionalProperties: getAdditionalProperties,
        writeServiceTypeFile: createHttpServiceTypeFileWriter({ modelContext, serviceName, endpoint }),
    });
}
