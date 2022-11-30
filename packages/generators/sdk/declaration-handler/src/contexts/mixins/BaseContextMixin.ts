import { Constants } from "@fern-fern/ir-model/constants";
import { SourceFile } from "ts-morph";
import { CoreUtilities } from "../../core-utilities";
import { ExternalDependencies } from "../../external-dependencies";

export interface BaseContextMixin {
    sourceFile: SourceFile;
    externalDependencies: ExternalDependencies;
    coreUtilities: CoreUtilities;
    fernConstants: Constants;
}

export interface WithBaseContextMixin {
    base: BaseContextMixin;
}
