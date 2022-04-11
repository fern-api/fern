import { TypeReference } from "./TypeReference";
import { WithDocs } from "./WithDocs";

export interface HttpEndpointQueryParameter extends WithDocs {
    key: string;
    valueType: TypeReference;
}
