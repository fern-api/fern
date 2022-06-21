import { HttpEndpoint, HttpServiceTypeReference, TypeReference } from "@fern-api/api";

export interface EndpointParameter {
    typeReference: TypeReference;
    bodyProperty: string | undefined;
}

export function getEndpointParameter(endpoint: HttpEndpoint): EndpointParameter {
    const bodyReference = endpoint.request.type;
	const hasBody = HttpServiceTypeReference._visit(endpoint.request.type, {
		model: (modelType) => modelType._type !== "void",
		inlined: (inlinedType) => inlinedType.
	})

    if (endpoint.pathParameters.length > 0 || endpoint.queryParameters.length > 0) {
        return {
			typeReference: "reference of request",
			bodyProperty: 
		}

        wrapper = {
            name: "Request",
            file: wrapperFile,
            bodyProperty: "body",
        };
    }

    return { bodyReference, wrapper };
}
