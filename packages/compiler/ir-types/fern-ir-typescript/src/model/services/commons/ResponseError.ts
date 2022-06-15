import { WithDocs } from "../../commons/WithDocs";
import { TypeReference } from "../../types/TypeReference";

export interface ResponseError extends WithDocs {
    discriminantValue: string;
    error: TypeReference;
}
