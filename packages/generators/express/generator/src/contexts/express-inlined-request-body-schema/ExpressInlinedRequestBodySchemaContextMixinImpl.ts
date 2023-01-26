import { FernFilepath, Name } from "@fern-fern/ir-model/commons";
import { ImportsManager, Reference } from "@fern-typescript/commons";
import {
    ExpressInlinedRequestBodySchemaContextMixin,
    GeneratedExpressInlinedRequestBodySchema,
} from "@fern-typescript/contexts";
import { ExpressInlinedRequestBodySchemaGenerator } from "@fern-typescript/express-inlined-request-schema-generator";
import { ServiceResolver } from "@fern-typescript/resolvers";
import { SourceFile } from "ts-morph";
import { ExpressInlinedRequestBodyDeclarationReferencer } from "../../declaration-referencers/ExpressInlinedRequestBodyDeclarationReferencer";
import { getSchemaImportStrategy } from "../getSchemaImportStrategy";

export declare namespace ExpressInlinedRequestBodySchemaContextMixinImpl {
    export interface Init {
        expressInlinedRequestBodySchemaGenerator: ExpressInlinedRequestBodySchemaGenerator;
        expressInlinedRequestBodySchemaDeclarationReferencer: ExpressInlinedRequestBodyDeclarationReferencer;
        serviceResolver: ServiceResolver;
        sourceFile: SourceFile;
        importsManager: ImportsManager;
    }
}

export class ExpressInlinedRequestBodySchemaContextMixinImpl implements ExpressInlinedRequestBodySchemaContextMixin {
    private expressInlinedRequestBodySchemaGenerator: ExpressInlinedRequestBodySchemaGenerator;
    private expressInlinedRequestBodySchemaDeclarationReferencer: ExpressInlinedRequestBodyDeclarationReferencer;
    private serviceResolver: ServiceResolver;
    private sourceFile: SourceFile;
    private importsManager: ImportsManager;

    constructor({
        importsManager,
        serviceResolver,
        sourceFile,
        expressInlinedRequestBodySchemaDeclarationReferencer,
        expressInlinedRequestBodySchemaGenerator,
    }: ExpressInlinedRequestBodySchemaContextMixinImpl.Init) {
        this.expressInlinedRequestBodySchemaGenerator = expressInlinedRequestBodySchemaGenerator;
        this.expressInlinedRequestBodySchemaDeclarationReferencer =
            expressInlinedRequestBodySchemaDeclarationReferencer;
        this.sourceFile = sourceFile;
        this.importsManager = importsManager;
        this.serviceResolver = serviceResolver;
    }

    public getGeneratedInlinedRequestBodySchema(
        service: FernFilepath,
        endpointName: Name
    ): GeneratedExpressInlinedRequestBodySchema {
        const serviceDeclaration = this.serviceResolver.getServiceDeclarationFromName(service);
        const endpoint = serviceDeclaration.endpoints.find(
            (endpoint) => endpoint.name.originalName === endpointName.originalName
        );
        if (endpoint == null) {
            throw new Error(`Endpoint ${endpointName.originalName} does not exist`);
        }
        return this.expressInlinedRequestBodySchemaGenerator.generateInlinedRequestBodySchema({
            service: serviceDeclaration,
            endpoint,
            typeName: this.expressInlinedRequestBodySchemaDeclarationReferencer.getExportedName({
                service: serviceDeclaration.name.fernFilepath,
                endpoint,
            }),
        });
    }

    public getReferenceToInlinedRequestBody(service: FernFilepath, endpointName: Name): Reference {
        const serviceDeclaration = this.serviceResolver.getServiceDeclarationFromName(service);
        const endpoint = serviceDeclaration.endpoints.find(
            (endpoint) => endpoint.name.originalName === endpointName.originalName
        );
        if (endpoint == null) {
            throw new Error(`Endpoint ${endpointName.originalName} does not exist`);
        }
        return this.expressInlinedRequestBodySchemaDeclarationReferencer.getReferenceToInlinedRequestBody({
            name: { service, endpoint },
            referencedIn: this.sourceFile,
            importsManager: this.importsManager,
            importStrategy: getSchemaImportStrategy({ useDynamicImport: false }),
        });
    }
}
