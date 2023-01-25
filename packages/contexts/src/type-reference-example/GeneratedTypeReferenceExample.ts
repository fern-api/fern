import { GetReferenceOpts } from "@fern-typescript/commons";
import { ts } from "ts-morph";
import { TypeReferenceExampleContext } from "./TypeReferenceExampleContext";

export interface GeneratedTypeReferenceExample {
    build: (context: TypeReferenceExampleContext, opts: GetReferenceOpts) => ts.Expression;
}
