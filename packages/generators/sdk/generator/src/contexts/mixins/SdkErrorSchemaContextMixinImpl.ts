import { DeclaredErrorName } from "@fern-fern/ir-model/errors";
import { ImportsManager, Reference, Zurg } from "@fern-typescript/commons";
import { CoreUtilities } from "@fern-typescript/commons/src/core-utilities/CoreUtilities";
import { GeneratedSdkErrorSchema, SdkErrorSchemaContextMixin } from "@fern-typescript/contexts";
import { SdkErrorSchemaGenerator } from "@fern-typescript/error-schema-generator";
import { ErrorResolver } from "@fern-typescript/resolvers";
import { SourceFile } from "ts-morph";
import { SdkErrorDeclarationReferencer } from "../../declaration-referencers/SdkErrorDeclarationReferencer";
import { getSchemaImportStrategy } from "./getSchemaImportStrategy";

export declare namespace SdkErrorSchemaContextMixinImpl {
    export interface Init {
        sourceFile: SourceFile;
        coreUtilities: CoreUtilities;
        importsManager: ImportsManager;
        sdkErrorSchemaDeclarationReferencer: SdkErrorDeclarationReferencer;
        sdkErrorSchemaGenerator: SdkErrorSchemaGenerator;
        errorResolver: ErrorResolver;
    }
}

export class SdkErrorSchemaContextMixinImpl implements SdkErrorSchemaContextMixin {
    private sourceFile: SourceFile;
    private coreUtilities: CoreUtilities;
    private importsManager: ImportsManager;
    private sdkErrorSchemaDeclarationReferencer: SdkErrorDeclarationReferencer;
    private sdkErrorSchemaGenerator: SdkErrorSchemaGenerator;
    private errorResolver: ErrorResolver;

    constructor({
        sourceFile,
        coreUtilities,
        importsManager,
        sdkErrorSchemaDeclarationReferencer,
        sdkErrorSchemaGenerator,
        errorResolver,
    }: SdkErrorSchemaContextMixinImpl.Init) {
        this.sourceFile = sourceFile;
        this.coreUtilities = coreUtilities;
        this.importsManager = importsManager;
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
                    useDynamicImport: true,
                }),
                importsManager: this.importsManager,
                referencedIn: this.sourceFile,
            })
            .getExpression();

        return this.coreUtilities.zurg.lazy(this.coreUtilities.zurg.Schema._fromExpression(referenceToSchema));
    }

    public getGeneratedSdkErrorSchema(errorName: DeclaredErrorName): GeneratedSdkErrorSchema | undefined {
        return this.sdkErrorSchemaGenerator.generateSdkErrorSchema({
            errorDeclaration: this.errorResolver.getErrorDeclarationFromName(errorName),
            errorName: this.sdkErrorSchemaDeclarationReferencer.getExportedName(errorName),
        });
    }

    public getReferenceToSdkErrorSchema(errorName: DeclaredErrorName): Reference {
        return this.sdkErrorSchemaDeclarationReferencer.getReferenceToError({
            name: errorName,
            importStrategy: getSchemaImportStrategy({ useDynamicImport: false }),
            referencedIn: this.sourceFile,
            importsManager: this.importsManager,
        });
    }
}
