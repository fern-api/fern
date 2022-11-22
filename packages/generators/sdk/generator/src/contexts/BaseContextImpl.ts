import { FernConstants } from "@fern-fern/ir-model/ir";
import { CoreUtilities, ExternalDependencies } from "@fern-typescript/sdk-declaration-handler";
import { SourceFile } from "ts-morph";
import { CoreUtilitiesManager } from "../core-utilities/CoreUtilitiesManager";
import { DependencyManager } from "../dependency-manager/DependencyManager";
import { createExternalDependencies } from "../external-dependencies/createExternalDependencies";
import { ImportsManager } from "../imports-manager/ImportsManager";

export declare namespace BaseContextImpl {
    export interface Init {
        sourceFile: SourceFile;
        importsManager: ImportsManager;
        dependencyManager: DependencyManager;
        coreUtilitiesManager: CoreUtilitiesManager;
        fernConstants: FernConstants;
    }
}

export abstract class BaseContextImpl {
    public readonly sourceFile: SourceFile;
    public readonly externalDependencies: ExternalDependencies;
    public readonly coreUtilities: CoreUtilities;
    public readonly fernConstants: FernConstants;

    protected importsManager: ImportsManager;

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
        this.importsManager = importsManager;
    }
}
