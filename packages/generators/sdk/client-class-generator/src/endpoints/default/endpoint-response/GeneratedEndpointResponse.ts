import { SdkClientClassContext } from "@fern-typescript/contexts";
import { ts } from "ts-morph";

export interface GeneratedEndpointResponse {
    getResponseVariableName: () => string;
    getReturnResponseStatements: (context: SdkClientClassContext) => ts.Statement[];
    getReturnType: (context: SdkClientClassContext) => ts.TypeNode;
    getNamesOfThrownExceptions: (context: SdkClientClassContext) => string[];
}
