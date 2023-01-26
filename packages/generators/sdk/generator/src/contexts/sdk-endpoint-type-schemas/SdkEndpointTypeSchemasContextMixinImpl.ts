import { FernFilepath, Name } from "@fern-fern/ir-model/commons";
import { ImportsManager, Reference } from "@fern-typescript/commons";
import { GeneratedSdkEndpointTypeSchemas, SdkEndpointTypeSchemasContextMixin } from "@fern-typescript/contexts";
import { ServiceResolver } from "@fern-typescript/resolvers";
import { SdkEndpointTypeSchemasGenerator } from "@fern-typescript/sdk-endpoint-type-schemas-generator";
import { SourceFile } from "ts-morph";
import { EndpointDeclarationReferencer } from "../../declaration-referencers/EndpointDeclarationReferencer";
import { getSchemaImportStrategy } from "../getSchemaImportStrategy";

export declare namespace SdkEndpointTypeSchemasContextMixinImpl {
    export interface Init {
        sdkEndpointTypeSchemasGenerator: SdkEndpointTypeSchemasGenerator;
        sdkEndpointSchemaDeclarationReferencer: EndpointDeclarationReferencer;
        serviceResolver: ServiceResolver;
        sourceFile: SourceFile;
        importsManager: ImportsManager;
    }
}

export class SdkEndpointTypeSchemasContextMixinImpl implements SdkEndpointTypeSchemasContextMixin {
    private sdkEndpointTypeSchemasGenerator: SdkEndpointTypeSchemasGenerator;
    private serviceResolver: ServiceResolver;
    private sdkEndpointSchemaDeclarationReferencer: EndpointDeclarationReferencer;
    private sourceFile: SourceFile;
    private importsManager: ImportsManager;

    constructor({
        sourceFile,
        importsManager,
        sdkEndpointTypeSchemasGenerator,
        sdkEndpointSchemaDeclarationReferencer,
        serviceResolver,
    }: SdkEndpointTypeSchemasContextMixinImpl.Init) {
        this.sourceFile = sourceFile;
        this.importsManager = importsManager;
        this.serviceResolver = serviceResolver;
        this.sdkEndpointTypeSchemasGenerator = sdkEndpointTypeSchemasGenerator;
        this.sdkEndpointSchemaDeclarationReferencer = sdkEndpointSchemaDeclarationReferencer;
    }

    public getGeneratedEndpointTypeSchemas(service: FernFilepath, endpointName: Name): GeneratedSdkEndpointTypeSchemas {
        const serviceDeclaration = this.serviceResolver.getServiceDeclarationFromName(service);
        const endpoint = serviceDeclaration.endpoints.find(
            (endpoint) => endpoint.name.originalName === endpointName.originalName
        );
        if (endpoint == null) {
            throw new Error(`Endpoint ${endpointName.originalName} does not exist`);
        }
        return this.sdkEndpointTypeSchemasGenerator.generateEndpointTypeSchemas({
            service: serviceDeclaration,
            endpoint,
        });
    }

    public getReferenceToEndpointTypeSchemaExport(
        service: FernFilepath,
        endpointName: Name,
        export_: string | string[]
    ): Reference {
        const serviceDeclaration = this.serviceResolver.getServiceDeclarationFromName(service);
        const endpoint = serviceDeclaration.endpoints.find(
            (endpoint) => endpoint.name.originalName === endpointName.originalName
        );
        if (endpoint == null) {
            throw new Error(`Endpoint ${endpointName.originalName} does not exist`);
        }
        return this.sdkEndpointSchemaDeclarationReferencer.getReferenceToEndpointExport({
            name: { service, endpoint },
            referencedIn: this.sourceFile,
            importsManager: this.importsManager,
            importStrategy: getSchemaImportStrategy({ useDynamicImport: false }),
            subImport: typeof export_ === "string" ? [export_] : export_,
        });
    }
}
