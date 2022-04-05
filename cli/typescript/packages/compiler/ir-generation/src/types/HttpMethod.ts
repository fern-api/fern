import { TypeReference } from "./TypeReference";
import { WithDocs } from "./WithDocs";

export enum HttpMethod {
    GET = "GET",
    POST = "POST",
    PUT = "PUT",
    DELETE = "DELETE",
}

export interface HttpEndpointParameter extends WithDocs {
    key: string;
    valueType: TypeReference;
}
