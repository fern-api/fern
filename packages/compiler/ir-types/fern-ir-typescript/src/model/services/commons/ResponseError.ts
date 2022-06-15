import { WithDocs } from "../../commons/WithDocs";
import { NamedType } from "../../types/NamedType";

export interface ResponseError extends WithDocs {
    discriminantValue: string;
    error: NamedType;
}
