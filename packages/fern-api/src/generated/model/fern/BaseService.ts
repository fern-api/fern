import { TypeName } from "./TypeName";
import { WithDocs } from "./WithDocs";

export interface BaseService extends WithDocs {
    name: TypeName;
    basePath: string;
}
