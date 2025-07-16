import { GetReferenceOpts } from "@fern-typescript/commons";
import { ts } from "ts-morph";

import { SdkContext } from "..";

export interface GeneratedRequestWrapperExample {
    build: (context: SdkContext, opts: GetReferenceOpts) => ts.Expression;
}
