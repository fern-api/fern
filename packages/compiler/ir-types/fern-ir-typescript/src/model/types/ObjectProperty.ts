import { WithDocs } from "../commons/WithDocs";
import { TypeReference } from "./TypeReference";

export interface ObjectProperty extends WithDocs {
    key: string;
    valueType: TypeReference;
}
