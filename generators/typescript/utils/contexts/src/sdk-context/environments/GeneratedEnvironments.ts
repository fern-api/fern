import { ts } from "ts-morph";

import { EnvironmentBaseUrlId } from "@fern-fern/ir-sdk/api";

import { GeneratedFile } from "../../commons/GeneratedFile";
import { SdkContext } from "../SdkContext";

export interface GeneratedEnvironments extends GeneratedFile<SdkContext> {
    hasDefaultEnvironment: () => boolean;
    getReferenceToDefaultEnvironment: (context: SdkContext) => ts.Expression | undefined;
    getTypeForUserSuppliedEnvironment: (context: SdkContext) => ts.TypeNode;
    getReferenceToEnvironmentUrl: (args: {
        referenceToEnvironmentValue: ts.Expression;
        baseUrlId: EnvironmentBaseUrlId | undefined;
    }) => ts.Expression;
}
