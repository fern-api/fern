import { TypeReference } from "./TypeReference";
import { WithDocs } from "./WithDocs";

export interface WebSocketError extends WithDocs {
    name: string;
    bodyType: TypeReference | null | undefined;
}
