import { Constants } from "@fern-fern/ir-sdk/api";
import { ExternalDependencies } from "@fern-typescript/commons";
import { CoreUtilities } from "@fern-typescript/commons/src/core-utilities/CoreUtilities";
import { SourceFile } from "ts-morph";

export interface BaseContext {
    sourceFile: SourceFile;
    externalDependencies: ExternalDependencies;
    coreUtilities: CoreUtilities;
    fernConstants: Constants;
}
