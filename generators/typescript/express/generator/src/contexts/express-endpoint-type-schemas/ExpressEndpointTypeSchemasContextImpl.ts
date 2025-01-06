import { ImportsManager, PackageId, Reference } from "@fern-typescript/commons";
import { ExpressEndpointTypeSchemasContext, GeneratedExpressEndpointTypeSchemas } from "@fern-typescript/contexts";
import { ExpressEndpointTypeSchemasGenerator } from "@fern-typescript/express-endpoint-type-schemas-generator";
import { PackageResolver } from "@fern-typescript/resolvers";
import { SourceFile } from "ts-morph";

import { Name } from "@fern-fern/ir-sdk/api";

import { EndpointDeclarationReferencer } from "../../declaration-referencers/EndpointDeclarationReferencer";
import { getSchemaImportStrategy } from "../getSchemaImportStrategy";

export declare namespace ExpressEndpointTypeSchemasContextImpl {
    export interface Init {
        expressEndpointTypeSchemasGenerator: ExpressEndpointTypeSchemasGenerator;
        expressEndpointSchemaDeclarationReferencer: EndpointDeclarationReferencer;
        packageResolver: PackageResolver;
        sourceFile: SourceFile;
        importsManager: ImportsManager;
    }
}

export class ExpressEndpointTypeSchemasContextImpl implements ExpressEndpointTypeSchemasContext {
    private expressEndpointTypeSchemasGenerator: ExpressEndpointTypeSchemasGenerator;
    private packageResolver: PackageResolver;
    private expressEndpointSchemaDeclarationReferencer: EndpointDeclarationReferencer;
    private sourceFile: SourceFile;
    private importsManager: ImportsManager;

    constructor({
        sourceFile,
        importsManager,
        expressEndpointTypeSchemasGenerator,
        expressEndpointSchemaDeclarationReferencer,
        packageResolver
    }: ExpressEndpointTypeSchemasContextImpl.Init) {
        this.sourceFile = sourceFile;
        this.importsManager = importsManager;
        this.packageResolver = packageResolver;
        this.expressEndpointTypeSchemasGenerator = expressEndpointTypeSchemasGenerator;
        this.expressEndpointSchemaDeclarationReferencer = expressEndpointSchemaDeclarationReferencer;
    }

    public getGeneratedEndpointTypeSchemas(
        packageId: PackageId,
        endpointName: Name
    ): GeneratedExpressEndpointTypeSchemas {
        const serviceDeclaration = this.packageResolver.getServiceDeclarationOrThrow(packageId);
        const endpoint = serviceDeclaration.endpoints.find(
            (endpoint) => endpoint.name.originalName === endpointName.originalName
        );
        if (endpoint == null) {
            throw new Error(`Endpoint ${endpointName.originalName} does not exist`);
        }
        return this.expressEndpointTypeSchemasGenerator.generateEndpointTypeSchemas({
            packageId,
            service: serviceDeclaration,
            endpoint
        });
    }

    public getReferenceToEndpointTypeSchemaExport(
        packageId: PackageId,
        endpointName: Name,
        export_: string | string[]
    ): Reference {
        const serviceDeclaration = this.packageResolver.getServiceDeclarationOrThrow(packageId);
        const endpoint = serviceDeclaration.endpoints.find(
            (endpoint) => endpoint.name.originalName === endpointName.originalName
        );
        if (endpoint == null) {
            throw new Error(`Endpoint ${endpointName.originalName} does not exist`);
        }
        return this.expressEndpointSchemaDeclarationReferencer.getReferenceToEndpointExport({
            name: { packageId, endpoint },
            referencedIn: this.sourceFile,
            importsManager: this.importsManager,
            importStrategy: getSchemaImportStrategy({ useDynamicImport: false }),
            subImport: typeof export_ === "string" ? [export_] : export_
        });
    }
}
