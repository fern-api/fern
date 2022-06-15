import { WithDocs } from "../../commons/WithDocs";
import { Type } from "../../types/Type";
import { Encoding } from "../commons/Encoding";

export interface HttpRequest extends WithDocs {
    encoding: Encoding;
    type: Type;
}
