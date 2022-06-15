import { WithDocs } from "../../commons/WithDocs";
import { Encoding } from "../commons/Encoding";
import { FailedResponse } from "../commons/FailedResponse";
import { HttpOkResponse } from "./HttpOkResponse";

export interface HttpResponse extends WithDocs {
    encoding: Encoding;
    ok: HttpOkResponse;
    failed: FailedResponse;
}
