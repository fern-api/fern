import { WithDocs } from "../commons/WithDocs";
import { NamedType } from "../types/NamedType";
import { Type } from "../types/Type";
import { HttpErrorConfiguration } from "./HttpErrorConfiguration";

export interface ErrorDefinition extends WithDocs {
    name: NamedType;
    type: Type;
    http: HttpErrorConfiguration | null | undefined;
}
