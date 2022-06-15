import { WithDocs } from "../../commons/WithDocs";
import { Type } from "../../types/Type";

export interface WebSocketOkResponse extends WithDocs {
    type: Type;
}
