import { Constants } from "@fern-fern/ir-model/constants";
import { CoreUtilitiesManager, DependencyManager, ImportsManager } from "@fern-typescript/commons";
import { SourceFile } from "ts-morph";
import { BaseContextMixinImpl } from "./BaseContextMixinImpl";

export declare namespace BaseContextImpl {
    export interface Init {
        sourceFile: SourceFile;
        importsManager: ImportsManager;
        dependencyManager: DependencyManager;
        coreUtilitiesManager: CoreUtilitiesManager;
        fernConstants: Constants;
    }
}

export abstract class BaseContextImpl {
    public readonly base: BaseContextMixinImpl;

    protected sourceFile: SourceFile;
    protected importsManager: ImportsManager;

    constructor({
        sourceFile,
        importsManager,
        dependencyManager,
        coreUtilitiesManager,
        fernConstants,
    }: BaseContextImpl.Init) {
        this.base = new BaseContextMixinImpl({
            sourceFile,
            importsManager,
            dependencyManager,
            coreUtilitiesManager,
            fernConstants,
        });
        this.sourceFile = sourceFile;
        this.importsManager = importsManager;
    }
}
