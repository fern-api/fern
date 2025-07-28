import { ExportsManager, ImportsManager, Reference, Zurg } from "@fern-typescript/commons";
import { CoreUtilities } from "@fern-typescript/commons/src/core-utilities/CoreUtilities";
import { ExpressErrorSchemaContext, GeneratedExpressErrorSchema } from "@fern-typescript/contexts";
import { ExpressErrorSchemaGenerator } from "@fern-typescript/express-error-schema-generator";
import { ErrorResolver } from "@fern-typescript/resolvers";
import { SourceFile } from "ts-morph";

import { DeclaredErrorName } from "@fern-fern/ir-sdk";

import { ExpressErrorDeclarationReferencer } from "../../declaration-referencers/ExpressErrorDeclarationReferencer";
import { getSchemaImportStrategy } from "../getSchemaImportStrategy";

export declare namespace ExpressErrorSchemaContextImpl {
    export interface Init {
        sourceFile: SourceFile;
        coreUtilities: CoreUtilities;
        importsManager: ImportsManager;
        exportsManager: ExportsManager;
        expressErrorSchemaDeclarationReferencer: ExpressErrorDeclarationReferencer;
        expressErrorSchemaGenerator: ExpressErrorSchemaGenerator;
        errorResolver: ErrorResolver;
    }
}

export class ExpressErrorSchemaContextImpl implements ExpressErrorSchemaContext {
    private sourceFile: SourceFile;
    private coreUtilities: CoreUtilities;
    private importsManager: ImportsManager;
    private exportsManager: ExportsManager;
    private expressErrorSchemaDeclarationReferencer: ExpressErrorDeclarationReferencer;
    private expressErrorSchemaGenerator: ExpressErrorSchemaGenerator;
    private errorResolver: ErrorResolver;

    constructor({
        sourceFile,
        coreUtilities,
        importsManager,
        exportsManager,
        expressErrorSchemaDeclarationReferencer,
        expressErrorSchemaGenerator,
        errorResolver
    }: ExpressErrorSchemaContextImpl.Init) {
        this.sourceFile = sourceFile;
        this.coreUtilities = coreUtilities;
        this.importsManager = importsManager;
        this.exportsManager = exportsManager;
        this.expressErrorSchemaDeclarationReferencer = expressErrorSchemaDeclarationReferencer;
        this.expressErrorSchemaGenerator = expressErrorSchemaGenerator;
        this.errorResolver = errorResolver;
    }

    public getSchemaOfError(errorName: DeclaredErrorName): Zurg.Schema {
        const referenceToSchema = this.expressErrorSchemaDeclarationReferencer
            .getReferenceToError({
                name: errorName,
                importStrategy: getSchemaImportStrategy({
                    // use dynamic imports when schemas reference schemas,
                    // to avoid issues with circular imports
                    useDynamicImport: true
                }),
                importsManager: this.importsManager,
                exportsManager: this.exportsManager,
                referencedIn: this.sourceFile
            })
            .getExpression();

        return this.coreUtilities.zurg.lazy(this.coreUtilities.zurg.Schema._fromExpression(referenceToSchema));
    }

    public getGeneratedExpressErrorSchema(errorName: DeclaredErrorName): GeneratedExpressErrorSchema | undefined {
        return this.expressErrorSchemaGenerator.generateExpressErrorSchema({
            errorDeclaration: this.errorResolver.getErrorDeclarationFromName(errorName),
            errorName: this.expressErrorSchemaDeclarationReferencer.getExportedName(errorName)
        });
    }

    public getReferenceToExpressErrorSchema(errorName: DeclaredErrorName): Reference {
        return this.expressErrorSchemaDeclarationReferencer.getReferenceToError({
            name: errorName,
            importStrategy: getSchemaImportStrategy({ useDynamicImport: false }),
            referencedIn: this.sourceFile,
            importsManager: this.importsManager,
            exportsManager: this.exportsManager
        });
    }
}
