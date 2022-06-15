import { WithDocs } from "../../commons/WithDocs";
import { Encoding } from "../commons/Encoding";
import { FailedResponse } from "../commons/FailedResponse";
import { WebSocketOkResponse } from "./WebSocketOkResponse";

export interface WebSocketResponse extends WithDocs {
    encoding: Encoding;
    ok: WebSocketOkResponse;
    failed: FailedResponse;
}
