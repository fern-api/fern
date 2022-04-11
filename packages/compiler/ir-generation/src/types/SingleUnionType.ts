import { TypeReference } from "./TypeReference";
import { WithDocs } from "./WithDocs";

export interface SingleUnionType extends WithDocs {
    discriminantValue: string;
    valueType: TypeReference;
}
