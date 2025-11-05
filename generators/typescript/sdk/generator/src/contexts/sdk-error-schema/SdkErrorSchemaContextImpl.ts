import { DeclaredErrorName } from "@fern-fern/ir-sdk/api";
import { CoreUtilities, ExportsManager, ImportsManager, Reference, Zurg } from "@fern-typescript/commons";
import { GeneratedSdkErrorSchema, SdkErrorSchemaContext } from "@fern-typescript/contexts";
import { ErrorResolver } from "@fern-typescript/resolvers";
import { SdkErrorSchemaGenerator } from "@fern-typescript/sdk-error-schema-generator";
import { SourceFile } from "ts-morph";

import { SdkErrorDeclarationReferencer } from "../../declaration-referencers/SdkErrorDeclarationReferencer";
import { getSchemaImportStrategy } from "../getSchemaImportStrategy";

export declare namespace SdkErrorSchemaContextImpl {
    export interface Init {
        sourceFile: SourceFile;
        coreUtilities: CoreUtilities;
        importsManager: ImportsManager;
        exportsManager: ExportsManager;
        sdkErrorSchemaDeclarationReferencer: SdkErrorDeclarationReferencer;
        sdkErrorSchemaGenerator: SdkErrorSchemaGenerator;
        errorResolver: ErrorResolver;
    }
}

export class SdkErrorSchemaContextImpl implements SdkErrorSchemaContext {
    private sourceFile: SourceFile;
    private coreUtilities: CoreUtilities;
    private importsManager: ImportsManager;
    private exportsManager: ExportsManager;
    private sdkErrorSchemaDeclarationReferencer: SdkErrorDeclarationReferencer;
    private sdkErrorSchemaGenerator: SdkErrorSchemaGenerator;
    private errorResolver: ErrorResolver;

    constructor({
        sourceFile,
        coreUtilities,
        importsManager,
        exportsManager,
        sdkErrorSchemaDeclarationReferencer,
        sdkErrorSchemaGenerator,
        errorResolver
    }: SdkErrorSchemaContextImpl.Init) {
        this.sourceFile = sourceFile;
        this.coreUtilities = coreUtilities;
        this.importsManager = importsManager;
        this.exportsManager = exportsManager;
        this.sdkErrorSchemaDeclarationReferencer = sdkErrorSchemaDeclarationReferencer;
        this.sdkErrorSchemaGenerator = sdkErrorSchemaGenerator;
        this.errorResolver = errorResolver;
    }

    public getSchemaOfError(errorName: DeclaredErrorName): Zurg.Schema {
        const referenceToSchema = this.sdkErrorSchemaDeclarationReferencer
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

    public getGeneratedSdkErrorSchema(errorName: DeclaredErrorName): GeneratedSdkErrorSchema | undefined {
        const schemaErrorName = this.sdkErrorSchemaDeclarationReferencer.getExportedName(errorName);
        this.importsManager.reserveLocal(schemaErrorName);

        return this.sdkErrorSchemaGenerator.generateSdkErrorSchema({
            errorDeclaration: this.errorResolver.getErrorDeclarationFromName(errorName),
            errorName: schemaErrorName
        });
    }

    public getReferenceToSdkErrorSchema(errorName: DeclaredErrorName): Reference {
        return this.sdkErrorSchemaDeclarationReferencer.getReferenceToError({
            name: errorName,
            importStrategy: getSchemaImportStrategy({ useDynamicImport: false }),
            referencedIn: this.sourceFile,
            importsManager: this.importsManager,
            exportsManager: this.exportsManager
        });
    }
}
