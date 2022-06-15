import { WithDocs } from "../../commons/WithDocs";
import { ResponseError } from "./ResponseError";

export interface FailedResponse extends WithDocs {
    discriminant: string;
    errors: ResponseError[];
}
