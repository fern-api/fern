import { PostmanHeader, PostmanUrlVariable } from "@fern-fern/postman-sdk/api";
import { getMockRequestBody } from "../getMockBody";
import { AbstractGeneratedRequest } from "./AbstractGeneratedRequest";

export class GeneratedDummyRequest extends AbstractGeneratedRequest {
    protected getQueryParams(): PostmanUrlVariable[] {
        return this.httpEndpoint.queryParameters.map((queryParam) => ({
            key: queryParam.name.wireValue,
            value: "",
            description: queryParam.docs ?? undefined,
        }));
    }

    protected getPathParams(): PostmanUrlVariable[] {
        return [...this.httpService.pathParameters, ...this.httpEndpoint.pathParameters].map((pathParam) => ({
            key: pathParam.name.originalName,
            value: "",
            description: pathParam.docs ?? undefined,
        }));
    }

    protected getHeaders(): PostmanHeader[] {
        return [...this.httpService.headers, ...this.httpEndpoint.headers].map((header) =>
            this.convertHeader({ header })
        );
    }

    protected getRequestBody(): unknown {
        if (this.httpEndpoint.requestBody == null) {
            return undefined;
        }
        return getMockRequestBody({
            requestBody: this.httpEndpoint.requestBody,
            allTypes: this.allTypes,
        });
    }
}
