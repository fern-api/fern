import { GetReferenceOpts } from "@fern-typescript/commons";
import { ts } from "ts-morph";
import { ModelContext } from "../ModelContext";

export interface GeneratedTypeReferenceExample {
    build: (context: ModelContext, opts: GetReferenceOpts) => ts.Expression;
}
