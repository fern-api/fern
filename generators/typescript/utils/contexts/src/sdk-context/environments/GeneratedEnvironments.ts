import { FernIr } from "@fern-fern/ir-sdk";
import { ts } from "ts-morph";

import { GeneratedFile } from "../../commons/GeneratedFile.js";
import { FileContext } from "../file-context/FileContext.js";

export interface GeneratedEnvironments extends GeneratedFile<FileContext> {
    hasDefaultEnvironment: () => boolean;
    getReferenceToDefaultEnvironment: (context: FileContext) => ts.Expression | undefined;
    getTypeForUserSuppliedEnvironment: (context: FileContext) => ts.TypeNode;
    getReferenceToEnvironmentUrl: (args: {
        referenceToEnvironmentValue: ts.Expression;
        baseUrlId: FernIr.EnvironmentBaseUrlId | undefined;
    }) => ts.Expression;
}
