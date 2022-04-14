import { HttpEndpointParameter } from "./HttpEndpointParameter";
import { HttpEndpointQueryParameter } from "./HttpEndpointQueryParameter";
import { HttpError } from "./HttpError";
import { HttpHeader } from "./HttpHeader";
import { HttpRequest } from "./HttpRequest";
import { HttpResponse } from "./HttpResponse";
import { HttpVerb } from "./HttpVerb";
import { WithDocs } from "./WithDocs";

export interface HttpEndpoint extends WithDocs {
    endpointId: string;
    verb: HttpVerb;
    path: string;
    parameters: HttpEndpointParameter[];
    queryParameters: HttpEndpointQueryParameter[];
    header: HttpHeader[];
    request: HttpRequest | null | undefined;
    response: HttpResponse | null | undefined;
    errors: HttpError[];
}
