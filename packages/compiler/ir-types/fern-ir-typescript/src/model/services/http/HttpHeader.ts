import { WithDocs } from "../../commons/WithDocs";
import { TypeReference } from "../../types/TypeReference";

export interface HttpHeader extends WithDocs {
    header: string;
    valueType: TypeReference;
}
