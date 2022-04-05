import { TypeReference } from "./TypeReference";
import { WithDocs } from "./WithDocs";

export interface ObjectField extends WithDocs {
    key: string;
    valueType: TypeReference;
}
