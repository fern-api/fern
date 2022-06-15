import { WithDocs } from "../../commons/WithDocs";
import { TypeReference } from "../../types/TypeReference";

export interface PathParameter extends WithDocs {
    key: string;
    valueType: TypeReference;
}
