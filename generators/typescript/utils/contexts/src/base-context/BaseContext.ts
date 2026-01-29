import { Constants } from "@fern-api/ir-sdk";
import { Logger } from "@fern-api/logger";
import { CoreUtilities, ExternalDependencies } from "@fern-typescript/commons";
import { SourceFile } from "ts-morph";

import { TypeContext, TypeSchemaContext } from "../model-context";
import { JsonContext } from "./json";

export interface BaseContext {
    logger: Logger;
    sourceFile: SourceFile;
    externalDependencies: ExternalDependencies;
    coreUtilities: CoreUtilities;
    fernConstants: Constants;
    type: TypeContext;
    typeSchema: TypeSchemaContext;
    includeSerdeLayer: boolean;
    jsonContext: JsonContext;
}
