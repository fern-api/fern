import { HttpEndpointQueryParameter } from "./HttpEndpointQueryParameter";
import { HttpError } from "./HttpError";
import { HttpHeader } from "./HttpHeader";
import { HttpEndpointParameter, HttpMethod } from "./HttpMethod";
import { HttpRequest } from "./HttpRequest";
import { HttpResponse } from "./HttpResponse";
import { WithDocs } from "./WithDocs";

export interface HttpEndpoint extends WithDocs {
    name: string;
    method: HttpMethod;
    path: string;
    parameters: HttpEndpointParameter[];
    queryParameters: HttpEndpointQueryParameter[];
    headers: HttpHeader[];
    request: HttpRequest | null | undefined;
    response: HttpResponse | null | undefined;
    errors: HttpError[];
}
