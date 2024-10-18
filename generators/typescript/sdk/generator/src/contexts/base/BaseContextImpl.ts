import { BaseTypescriptCustomConfigSchema, BaseTypescriptGeneratorContext } from "@fern-api/typescript-codegen";
import { Constants } from "@fern-fern/ir-sdk/api";
import {
    CoreUtilitiesManager,
    createExternalDependencies,
    DependencyManager,
    ExternalDependencies,
    ImportsManager
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
        v2Context: BaseTypescriptGeneratorContext<BaseTypescriptCustomConfigSchema>;
    }
}

export class BaseContextImpl implements BaseContext {
    public readonly sourceFile: SourceFile;
    public readonly externalDependencies: ExternalDependencies;
    public readonly coreUtilities: CoreUtilities;
    public readonly fernConstants: Constants;
    public V2: BaseTypescriptGeneratorContext<BaseTypescriptCustomConfigSchema>;

    constructor({
        sourceFile,
        importsManager,
        dependencyManager,
        coreUtilitiesManager,
        fernConstants,
        v2Context
    }: BaseContextImpl.Init) {
        this.V2 = v2Context;
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
