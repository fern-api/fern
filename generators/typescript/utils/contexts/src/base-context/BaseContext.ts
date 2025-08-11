import { ExternalDependencies, CoreUtilities } from "@fern-typescript/commons";
import { SourceFile } from "ts-morph";

import { Logger } from "@fern-api/logger";

import { Constants } from "@fern-fern/ir-sdk/api";

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
