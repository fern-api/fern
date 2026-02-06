import { FernIr } from "@fern-fern/ir-sdk";
import { ts } from "ts-morph";

import { GeneratedFile } from "../../commons/GeneratedFile.js";
import { SdkContext } from "../SdkContext.js";

export interface GeneratedEnvironments extends GeneratedFile<SdkContext> {
    hasDefaultEnvironment: () => boolean;
    getReferenceToDefaultEnvironment: (context: SdkContext) => ts.Expression | undefined;
    getTypeForUserSuppliedEnvironment: (context: SdkContext) => ts.TypeNode;
    getReferenceToEnvironmentUrl: (args: {
        referenceToEnvironmentValue: ts.Expression;
        baseUrlId: FernIr.EnvironmentBaseUrlId | undefined;
    }) => ts.Expression;
}
