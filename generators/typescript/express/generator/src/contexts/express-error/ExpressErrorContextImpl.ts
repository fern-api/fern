import { FernIr } from "@fern-fern/ir-sdk";
import { ExportsManager, ImportsManager, Reference } from "@fern-typescript/commons";
import { ExpressErrorContext, GeneratedExpressError } from "@fern-typescript/contexts";
import { ExpressErrorGenerator } from "@fern-typescript/express-error-generator";
import { ErrorResolver } from "@fern-typescript/resolvers";
import { SourceFile } from "ts-morph";

import { ExpressErrorDeclarationReferencer } from "../../declaration-referencers/ExpressErrorDeclarationReferencer.js";

export declare namespace ExpressErrorContextImpl {
    export interface Init {
        sourceFile: SourceFile;
        importsManager: ImportsManager;
        exportsManager: ExportsManager;
        errorDeclarationReferencer: ExpressErrorDeclarationReferencer;
        expressErrorGenerator: ExpressErrorGenerator;
        errorResolver: ErrorResolver;
    }
}

export class ExpressErrorContextImpl implements ExpressErrorContext {
    private sourceFile: SourceFile;
    private importsManager: ImportsManager;
    private exportsManager: ExportsManager;
    private errorDeclarationReferencer: ExpressErrorDeclarationReferencer;
    private expressErrorGenerator: ExpressErrorGenerator;
    private errorResolver: ErrorResolver;

    constructor({
        sourceFile,
        importsManager,
        exportsManager,
        errorDeclarationReferencer,
        expressErrorGenerator,
        errorResolver
    }: ExpressErrorContextImpl.Init) {
        this.sourceFile = sourceFile;
        this.importsManager = importsManager;
        this.exportsManager = exportsManager;
        this.errorDeclarationReferencer = errorDeclarationReferencer;
        this.expressErrorGenerator = expressErrorGenerator;
        this.errorResolver = errorResolver;
    }

    public getReferenceToError(errorName: FernIr.DeclaredErrorName): Reference {
        return this.errorDeclarationReferencer.getReferenceToError({
            name: errorName,
            importStrategy: { type: "fromRoot", namespaceImport: this.errorDeclarationReferencer.namespaceExport },
            referencedIn: this.sourceFile,
            importsManager: this.importsManager,
            exportsManager: this.exportsManager
        });
    }

    public getGeneratedExpressError(errorName: FernIr.DeclaredErrorName): GeneratedExpressError {
        return this.expressErrorGenerator.generateError({
            errorName: this.getErrorClassName(errorName),
            errorDeclaration: this.getErrorDeclaration(errorName)
        });
    }

    public getErrorDeclaration(errorName: FernIr.DeclaredErrorName): FernIr.ErrorDeclaration {
        return this.errorResolver.getErrorDeclarationFromName(errorName);
    }

    public getErrorClassName(errorName: FernIr.DeclaredErrorName): string {
        return this.errorDeclarationReferencer.getExportedName(errorName);
    }
}
