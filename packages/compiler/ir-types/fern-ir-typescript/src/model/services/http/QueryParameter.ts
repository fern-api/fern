import { WithDocs } from "../../commons/WithDocs";
import { TypeReference } from "../../types/TypeReference";

export interface QueryParameter extends WithDocs {
    key: string;
    valueType: TypeReference;
}
