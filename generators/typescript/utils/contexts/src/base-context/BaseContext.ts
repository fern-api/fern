import { Logger } from "@fern-api/logger";
import { FernIr } from "@fern-fern/ir-sdk";
import { CoreUtilities, ExternalDependencies } from "@fern-typescript/commons";
import { SourceFile } from "ts-morph";

import { TypeContext, TypeSchemaContext } from "../model-context/index.js";
import { JsonContext } from "./json/index.js";

export interface BaseContext {
    logger: Logger;
    sourceFile: SourceFile;
    externalDependencies: ExternalDependencies;
    coreUtilities: CoreUtilities;
    fernConstants: FernIr.Constants;
    type: TypeContext;
    typeSchema: TypeSchemaContext;
    includeSerdeLayer: boolean;
    jsonContext: JsonContext;
}
