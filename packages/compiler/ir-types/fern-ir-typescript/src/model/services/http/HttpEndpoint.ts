import { WithDocs } from "../../commons/WithDocs";
import { HttpAuth } from "./HttpAuth";
import { HttpHeader } from "./HttpHeader";
import { HttpMethod } from "./HttpMethod";
import { HttpRequest } from "./HttpRequest";
import { HttpResponse } from "./HttpResponse";
import { PathParameter } from "./PathParameter";
import { QueryParameter } from "./QueryParameter";

export interface HttpEndpoint extends WithDocs {
    endpointId: string;
    path: string;
    method: HttpMethod;
    headers: HttpHeader[];
    pathParameters: PathParameter[];
    queryParameters: QueryParameter[];
    request: HttpRequest;
    response: HttpResponse;
    auth: HttpAuth;
}
