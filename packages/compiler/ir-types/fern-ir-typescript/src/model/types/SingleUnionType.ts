import { WithDocs } from "../commons/WithDocs";
import { TypeReference } from "./TypeReference";

export interface SingleUnionType extends WithDocs {
    discriminantValue: string;
    valueType: TypeReference;
}
