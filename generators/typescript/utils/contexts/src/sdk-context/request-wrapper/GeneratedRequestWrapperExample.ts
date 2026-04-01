import { GetReferenceOpts } from "@fern-typescript/commons";
import { ts } from "ts-morph";

import { FileContext } from "../index.js";

export interface GeneratedRequestWrapperExample {
    build: (context: FileContext, opts: GetReferenceOpts) => ts.Expression;
}
