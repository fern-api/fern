import { getTextOfTsNode } from "@fern-typescript/commons";
import { GeneratedHttpEndpointTypes, ModelContext } from "@fern-typescript/model-context";
import { OptionalKind, ParameterDeclarationStructure, SourceFile } from "ts-morph";
import { ServiceTypesConstants } from "../constants";

export function getHttpRequestParameters({
    generatedEndpointTypes,
    modelContext,
    file,
}: {
    generatedEndpointTypes: GeneratedHttpEndpointTypes;
    modelContext: ModelContext;
    file: SourceFile;
}): OptionalKind<ParameterDeclarationStructure>[] {
    if (generatedEndpointTypes.request.wrapper != null) {
        return [
            {
                name: ServiceTypesConstants.HttpEndpint.Request.VARIABLE_NAME,
                type: getTextOfTsNode(
                    modelContext.getReferenceToHttpServiceType({
                        reference: generatedEndpointTypes.request.wrapper.reference,
                        referencedIn: file,
                    })
                ),
            },
        ];
    }

    if (generatedEndpointTypes.request.body != null) {
        return [
            {
                name: ServiceTypesConstants.HttpEndpint.Request.VARIABLE_NAME,
                type: getTextOfTsNode(
                    modelContext.getReferenceToHttpServiceType({
                        reference: generatedEndpointTypes.request.body,
                        referencedIn: file,
                    })
                ),
            },
        ];
    }

    return [];
}
