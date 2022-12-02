import { Constants } from "@fern-fern/ir-model/constants";
import { SourceFile } from "ts-morph";
import { CoreUtilitiesManager } from "../core-utilities/CoreUtilitiesManager";
import { DependencyManager } from "../dependency-manager/DependencyManager";
import { ImportsManager } from "../imports-manager/ImportsManager";
import { BaseContextMixinImpl } from "./mixins/BaseContextMixinImpl";

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
