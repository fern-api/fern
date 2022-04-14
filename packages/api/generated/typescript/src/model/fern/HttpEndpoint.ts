import { HttpEndpointParameter } from "./HttpEndpointParameter";
import { HttpEndpointQueryParameter } from "./HttpEndpointQueryParameter";
import { HttpError } from "./HttpError";
import { HttpHeader } from "./HttpHeader";
import { HttpMethod } from "./HttpMethod";
import { HttpRequest } from "./HttpRequest";
import { HttpResponse } from "./HttpResponse";
import { WithDocs } from "./WithDocs";

export interface HttpEndpoint extends WithDocs {
    endpointId: string;
    method: HttpMethod;
    path: string;
    parameters: HttpEndpointParameter[];
    queryParameters: HttpEndpointQueryParameter[];
    headers: HttpHeader[];
    request: HttpRequest | null | undefined;
    response: HttpResponse | null | undefined;
    errors: HttpError[];
}
