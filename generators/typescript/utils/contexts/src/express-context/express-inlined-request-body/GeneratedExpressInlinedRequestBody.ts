import { FernIr } from "@fern-fern/ir-sdk";
import { GeneratedFile } from "../../commons/GeneratedFile.js";
import { ExpressContext } from "../index.js";

export interface GeneratedExpressInlinedRequestBody extends GeneratedFile<ExpressContext> {
    getPropertyKey: (property: FernIr.InlinedRequestBodyProperty) => string;
}
