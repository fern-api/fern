import { ts } from "ts-morph";

import { GeneratedFile } from "../../commons/GeneratedFile.js";
import { ExpressContext } from "../ExpressContext.js";

export interface GeneratedExpressEndpointTypeSchemas extends GeneratedFile<ExpressContext> {
    getReferenceToRawResponse: (context: ExpressContext) => ts.TypeNode;
    deserializeRequest: (referenceToRawRequest: ts.Expression, context: ExpressContext) => ts.Expression;
    serializeResponse: (referenceToParsedResponse: ts.Expression, context: ExpressContext) => ts.Expression;
}
