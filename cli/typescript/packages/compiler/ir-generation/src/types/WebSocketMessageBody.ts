import { TypeReference } from "./TypeReference";
import { WithDocs } from "./WithDocs";

export interface WebSocketMessageBody extends WithDocs {
    bodyType: TypeReference;
}
