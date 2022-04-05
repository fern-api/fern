import { BaseService } from "./BaseService";
import { HttpEndpoint } from "./HttpEndpoint";
import { HttpHeader } from "./HttpHeader";

export interface HttpService extends BaseService {
    headers: HttpHeader[];
    endpoints: HttpEndpoint[];
}
