import { WithDocs } from "../../commons/WithDocs";
import { Type } from "../../types/Type";

export interface HttpOkResponse extends WithDocs {
    type: Type;
}
