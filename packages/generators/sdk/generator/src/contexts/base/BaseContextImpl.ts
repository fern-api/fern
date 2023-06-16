import { Constants } from "@fern-fern/ir-model/constants";
import {
    CoreUtilitiesManager,
    createExternalDependencies,
    DependencyManager,
    ExternalDependencies,
    ImportsManager,
} from "@fern-typescript/commons";
import { CoreUtilities } from "@fern-typescript/commons/src/core-utilities/CoreUtilities";
import { BaseContext } from "@fern-typescript/contexts";
import { SourceFile } from "ts-morph";

export declare namespace BaseContextImpl {
    export interface Init {
        sourceFile: SourceFile;
        importsManager: ImportsManager;
        dependencyManager: DependencyManager;
        coreUtilitiesManager: CoreUtilitiesManager;
        fernConstants: Constants;
    }
}

export class BaseContextImpl implements BaseContext {
    public readonly sourceFile: SourceFile;
    public readonly externalDependencies: ExternalDependencies;
    public readonly coreUtilities: CoreUtilities;
    public readonly fernConstants: Constants;

    constructor({
        sourceFile,
        importsManager,
        dependencyManager,
        coreUtilitiesManager,
        fernConstants,
    }: BaseContextImpl.Init) {
        this.sourceFile = sourceFile;
        this.externalDependencies = createExternalDependencies({
            dependencyManager,
            importsManager,
        });
        this.coreUtilities = coreUtilitiesManager.getCoreUtilities({
            sourceFile,
            importsManager,
        });
        this.fernConstants = fernConstants;
    }
}
