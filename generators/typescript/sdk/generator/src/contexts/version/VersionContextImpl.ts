import { ExportsManager, ImportsManager, Reference } from "@fern-typescript/commons"
import { GeneratedVersion, VersionContext } from "@fern-typescript/contexts"
import { SourceFile } from "ts-morph"

import { IntermediateRepresentation } from "@fern-fern/ir-sdk/api"

import { VersionDeclarationReferencer } from "../../declaration-referencers/VersionDeclarationReferencer"
import { VersionGenerator } from "../../version/VersionGenerator"

export declare namespace VersionContextImpl {
    export interface Init {
        intermediateRepresentation: IntermediateRepresentation
        versionGenerator: VersionGenerator
        versionDeclarationReferencer: VersionDeclarationReferencer
        importsManager: ImportsManager
        exportsManager: ExportsManager
        sourceFile: SourceFile
    }
}

export class VersionContextImpl implements VersionContext {
    private intermediateRepresentation: IntermediateRepresentation
    private versionGenerator: VersionGenerator
    private versionDeclarationReferencer: VersionDeclarationReferencer
    private importsManager: ImportsManager
    private exportsManager: ExportsManager
    private sourceFile: SourceFile

    constructor({
        intermediateRepresentation,
        versionGenerator,
        versionDeclarationReferencer,
        importsManager,
        exportsManager,
        sourceFile
    }: VersionContextImpl.Init) {
        this.intermediateRepresentation = intermediateRepresentation
        this.versionGenerator = versionGenerator
        this.versionDeclarationReferencer = versionDeclarationReferencer
        this.importsManager = importsManager
        this.exportsManager = exportsManager
        this.sourceFile = sourceFile
    }

    public getGeneratedVersion(): GeneratedVersion | undefined {
        if (this.intermediateRepresentation.apiVersion == null) {
            return undefined
        }
        const firstEnumValue = this.versionDeclarationReferencer.getExportedNameOfFirstVersionEnum()
        if (firstEnumValue == null) {
            return undefined
        }
        return this.versionGenerator.generateVersion({
            apiVersion: this.intermediateRepresentation.apiVersion,
            versionEnumName: this.versionDeclarationReferencer.getExportedNameOfVersionEnum(),
            firstEnumValue
        })
    }

    public getReferenceToVersionEnum(): Reference | undefined {
        return this.versionDeclarationReferencer.getReferenceToVersionEnum({
            importsManager: this.importsManager,
            exportsManager: this.exportsManager,
            sourceFile: this.sourceFile
        })
    }
}
