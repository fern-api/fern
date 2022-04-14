import { TypeName } from "./TypeName";
import { WithDocs } from "./WithDocs";

export interface BaseService extends WithDocs {
    name: TypeName;
    displayName: string;
    basePath: string;
}
