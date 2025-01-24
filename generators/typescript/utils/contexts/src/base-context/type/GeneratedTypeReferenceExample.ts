import { GetReferenceOpts } from "@fern-typescript/commons";
import { ts } from "ts-morph";

import { BaseContext } from "../../base-context";

export interface GeneratedTypeReferenceExample {
    build: (context: BaseContext, opts: GetReferenceOpts) => ts.Expression;
}
