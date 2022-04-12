import { TypeReference } from "./TypeReference";
import { WithDocs } from "./WithDocs";

export interface HttpResponse extends WithDocs {
    bodyType: TypeReference;
}
