import { TypeReference } from "./TypeReference";
import { WithDocs } from "./WithDocs";

export interface HttpRequest extends WithDocs {
    bodyType: TypeReference;
}
