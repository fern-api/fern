import { Constants } from "@fern-fern/ir-sdk/api";
import {
    CoreUtilitiesManager,
    createExternalDependencies,
    DependencyManager,
    ExternalDependencies,
    ImportsManager
} from "@fern-typescript/commons";
import { BaseContext } from "@fern-typescript/contexts";
import { SourceFile } from "ts-morph";
import { CoreUtilities } from "../generators/typescript/utils/commons/src/core-utilities/CoreUtilities";

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
        fernConstants
    }: BaseContextImpl.Init) {
        this.sourceFile = sourceFile;
        this.externalDependencies = createExternalDependencies({
            dependencyManager,
            importsManager
        });
        this.coreUtilities = coreUtilitiesManager.getCoreUtilities({
            sourceFile,
            importsManager
        });
        this.fernConstants = fernConstants;
    }
}
