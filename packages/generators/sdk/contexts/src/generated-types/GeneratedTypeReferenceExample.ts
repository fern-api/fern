import { ts } from "ts-morph";
import { TypeReferenceExampleContext } from "../contexts";
import { GetReferenceOpts } from "../Reference";

export interface GeneratedTypeReferenceExample {
    build: (context: TypeReferenceExampleContext, opts: GetReferenceOpts) => ts.Expression;
}
