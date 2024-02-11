import { Constants } from "@fern-fern/ir-sdk/api";
import { ExternalDependencies } from "@fern-typescript/commons";
import { SourceFile } from "ts-morph";
import { CoreUtilities } from "../generators/typescript/utils/commons/src/core-utilities/CoreUtilities";

export interface BaseContext {
    sourceFile: SourceFile;
    externalDependencies: ExternalDependencies;
    coreUtilities: CoreUtilities;
    fernConstants: Constants;
}
