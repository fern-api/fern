import { GetReferenceOpts } from "@fern-typescript/commons";
import { ts } from "ts-morph";

import { BaseContext } from "../../base-context/index.js";

export interface GeneratedTypeReferenceExample {
    build: (context: BaseContext, opts: GetReferenceOpts) => ts.Expression;
}
