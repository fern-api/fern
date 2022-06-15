import { WithDocs } from "../../commons/WithDocs";
import { NamedType } from "../../types/NamedType";
import { HttpEndpoint } from "./HttpEndpoint";
import { HttpHeader } from "./HttpHeader";

export interface HttpService extends WithDocs {
    name: NamedType;
    basePath: string | null | undefined;
    endpoints: HttpEndpoint[];
    headers: HttpHeader[];
}
