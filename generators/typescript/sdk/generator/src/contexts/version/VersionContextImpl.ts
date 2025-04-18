import { ImportsManager, Reference } from "@fern-typescript/commons";
import { GeneratedVersion, VersionContext } from "@fern-typescript/contexts";
import { SourceFile } from "ts-morph";

import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api";

import { VersionDeclarationReferencer } from "../../declaration-referencers/VersionDeclarationReferencer";
import { VersionGenerator } from "../../version/VersionGenerator";

export declare namespace VersionContextImpl {
    export interface Init {
        intermediateRepresentation: IntermediateRepresentation;
        versionGenerator: VersionGenerator;
        versionDeclarationReferencer: VersionDeclarationReferencer;
        importsManager: ImportsManager;
        sourceFile: SourceFile;
    }
}

export class VersionContextImpl implements VersionContext {
    private intermediateRepresentation: IntermediateRepresentation;
    private versionGenerator: VersionGenerator;
    private versionDeclarationReferencer: VersionDeclarationReferencer;
    private importsManager: ImportsManager;
    private sourceFile: SourceFile;

    constructor({
        intermediateRepresentation,
        versionGenerator,
        versionDeclarationReferencer,
        importsManager,
        sourceFile
    }: VersionContextImpl.Init) {
        this.intermediateRepresentation = intermediateRepresentation;
        this.versionGenerator = versionGenerator;
        this.versionDeclarationReferencer = versionDeclarationReferencer;
        this.importsManager = importsManager;
        this.sourceFile = sourceFile;
    }

    public getGeneratedVersion(): GeneratedVersion | undefined {
        if (this.intermediateRepresentation.apiVersion == null) {
            return undefined;
        }
        const firstEnumValue = this.versionDeclarationReferencer.getExportedNameOfFirstVersionEnum();
        if (firstEnumValue == null) {
            return undefined;
        }
        return this.versionGenerator.generateVersion({
            apiVersion: this.intermediateRepresentation.apiVersion,
            versionEnumName: this.versionDeclarationReferencer.getExportedNameOfVersionEnum(),
            firstEnumValue
        });
    }

    public getReferenceToVersionEnum(): Reference | undefined {
        return this.versionDeclarationReferencer.getReferenceToVersionEnum({
            importsManager: this.importsManager,
            sourceFile: this.sourceFile
        });
    }
}
