import { HttpEndpoint, ServiceName } from "@fern-fern/ir-model/services";
import {
    GeneratedHttpServerEndpointTypes,
    HttpServiceTypeMetadata,
    ModelContext,
} from "@fern-typescript/model-context";
import { addSuccessResponseInterface } from "../commons/generate-response/generateResponse";
import { generateServiceTypeReference } from "../commons/service-type-reference/generateServiceTypeReference";
import { ServiceTypesConstants } from "../constants";
import { createHttpServiceTypeFileWriter } from "./createHttpServiceTypeFileWriter";

export declare namespace generateHttpServerResponseType {
    export interface Args {
        serviceName: ServiceName;
        endpoint: HttpEndpoint;
        modelContext: ModelContext;
    }

    export type Return = GeneratedHttpServerEndpointTypes["response"];
}

export function generateHttpServerResponseType({
    serviceName,
    endpoint,
    modelContext,
}: generateHttpServerResponseType.Args): generateHttpServerResponseType.Return {
    const responseReference = generateServiceTypeReference({
        typeReference: endpoint.response.type,
    });

    const writeServiceTypeFile = createHttpServiceTypeFileWriter({ modelContext, serviceName, endpoint });

    writeServiceTypeFile(ServiceTypesConstants.Commons.Response.TYPE_NAME, (file) => {
        addSuccessResponseInterface<HttpServiceTypeMetadata>({
            module: file,
            successBodyReference: responseReference,
            getTypeReferenceToServiceType: ({ reference, referencedIn }) =>
                modelContext.getReferenceToHttpServiceType({
                    reference,
                    referencedIn,
                }),
            additionalProperties: [],
        });
    });

    return responseReference;
}
