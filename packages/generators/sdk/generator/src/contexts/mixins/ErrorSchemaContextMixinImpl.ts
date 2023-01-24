import { DeclaredErrorName } from "@fern-fern/ir-model/errors";
import { Zurg } from "@fern-typescript/commons";
import { CoreUtilities, ErrorSchemaContextMixin, GeneratedErrorSchema, Reference } from "@fern-typescript/contexts";
import { ErrorSchemaGenerator } from "@fern-typescript/error-schema-generator";
import { ErrorResolver } from "@fern-typescript/resolvers";
import { SourceFile } from "ts-morph";
import { ErrorDeclarationReferencer } from "../../declaration-referencers/ErrorDeclarationReferencer";
import { ImportsManager } from "../../imports-manager/ImportsManager";
import { getSchemaImportStrategy } from "./getSchemaImportStrategy";

export declare namespace ErrorSchemaContextMixinImpl {
    export interface Init {
        sourceFile: SourceFile;
        coreUtilities: CoreUtilities;
        importsManager: ImportsManager;
        errorSchemaDeclarationReferencer: ErrorDeclarationReferencer;
        errorSchemaGenerator: ErrorSchemaGenerator;
        errorResolver: ErrorResolver;
    }
}

export class ErrorSchemaContextMixinImpl implements ErrorSchemaContextMixin {
    private sourceFile: SourceFile;
    private coreUtilities: CoreUtilities;
    private importsManager: ImportsManager;
    private errorSchemaDeclarationReferencer: ErrorDeclarationReferencer;
    private errorSchemaGenerator: ErrorSchemaGenerator;
    private errorResolver: ErrorResolver;

    constructor({
        sourceFile,
        coreUtilities,
        importsManager,
        errorSchemaDeclarationReferencer,
        errorSchemaGenerator,
        errorResolver,
    }: ErrorSchemaContextMixinImpl.Init) {
        this.sourceFile = sourceFile;
        this.coreUtilities = coreUtilities;
        this.importsManager = importsManager;
        this.errorSchemaDeclarationReferencer = errorSchemaDeclarationReferencer;
        this.errorSchemaGenerator = errorSchemaGenerator;
        this.errorResolver = errorResolver;
    }

    public getSchemaOfError(errorName: DeclaredErrorName): Zurg.Schema {
        const referenceToSchema = this.errorSchemaDeclarationReferencer
            .getReferenceToError({
                name: errorName,
                importStrategy: getSchemaImportStrategy({
                    // use dynamic imports when  schemas insides schemas,
                    // to avoid issues with circular imports
                    useDynamicImport: true,
                }),
                importsManager: this.importsManager,
                referencedIn: this.sourceFile,
            })
            .getExpression();

        return this.coreUtilities.zurg.lazy(this.coreUtilities.zurg.Schema._fromExpression(referenceToSchema));
    }

    public getGeneratedErrorSchema(errorName: DeclaredErrorName): GeneratedErrorSchema | undefined {
        return this.errorSchemaGenerator.generateErrorSchema({
            errorDeclaration: this.errorResolver.getErrorDeclarationFromName(errorName),
            errorName: this.errorSchemaDeclarationReferencer.getExportedName(errorName),
        });
    }

    public getReferenceToErrorSchema(errorName: DeclaredErrorName): Reference {
        return this.errorSchemaDeclarationReferencer.getReferenceToError({
            name: errorName,
            importStrategy: getSchemaImportStrategy({ useDynamicImport: false }),
            referencedIn: this.sourceFile,
            importsManager: this.importsManager,
        });
    }
}
