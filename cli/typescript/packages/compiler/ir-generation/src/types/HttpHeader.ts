import { TypeReference } from "./TypeReference";
import { WithDocs } from "./WithDocs";

export interface HttpHeader extends WithDocs {
    header: string;
    valueType: TypeReference;
}
