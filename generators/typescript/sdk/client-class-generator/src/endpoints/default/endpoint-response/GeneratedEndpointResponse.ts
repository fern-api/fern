import { SdkContext } from "@fern-typescript/contexts";
import { ts } from "ts-morph";

export interface GeneratedEndpointResponse {
    getResponseVariableName: () => string;
    getReturnResponseStatements: (context: SdkContext) => ts.Statement[];
    getReturnType: (context: SdkContext) => ts.TypeNode;
    getNamesOfThrownExceptions: (context: SdkContext) => string[];
}
