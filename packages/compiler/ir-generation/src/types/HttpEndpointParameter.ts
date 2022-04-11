import { TypeReference } from "./TypeReference";
import { WithDocs } from "./WithDocs";

export interface HttpEndpointParameter extends WithDocs {
    key: string;
    valueType: TypeReference;
}
