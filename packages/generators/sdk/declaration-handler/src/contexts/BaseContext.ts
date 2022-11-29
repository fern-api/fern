import { Constants } from "@fern-fern/ir-model/constants";
import { SourceFile } from "ts-morph";
import { CoreUtilities } from "../core-utilities";
import { ExternalDependencies } from "../external-dependencies";

export interface BaseContext {
    sourceFile: SourceFile;
    externalDependencies: ExternalDependencies;
    coreUtilities: CoreUtilities;
    fernConstants: Constants;
}
