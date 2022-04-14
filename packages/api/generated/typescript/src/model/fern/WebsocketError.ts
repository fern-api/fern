import { TypeReference } from "./TypeReference";
import { WithDocs } from "./WithDocs";

export interface WebsocketError extends WithDocs {
    name: string;
    bodyType: TypeReference | null | undefined;
}
