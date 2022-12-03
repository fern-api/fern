import { DeclaredServiceName } from "@fern-fern/ir-model/services/commons";
import { ServiceResolver } from "@fern-typescript/resolvers";
import { GeneratedService, Reference, ServiceContextMixin } from "@fern-typescript/sdk-declaration-handler";
import { ServiceGenerator } from "@fern-typescript/service-generator";
import { SourceFile } from "ts-morph";
import { ServiceDeclarationReferencer } from "../../declaration-referencers/ServiceDeclarationReferencer";
import { ImportsManager } from "../../imports-manager/ImportsManager";

export declare namespace ServiceContextMixinImpl {
    export interface Init {
        sourceFile: SourceFile;
        importsManager: ImportsManager;
        serviceDeclarationReferencer: ServiceDeclarationReferencer;
        serviceGenerator: ServiceGenerator;
        serviceResolver: ServiceResolver;
    }
}

export class ServiceContextMixinImpl implements ServiceContextMixin {
    private sourceFile: SourceFile;
    private importsManager: ImportsManager;
    private serviceGenerator: ServiceGenerator;
    private serviceDeclarationReferencer: ServiceDeclarationReferencer;
    private serviceResolver: ServiceResolver;

    constructor({
        sourceFile,
        importsManager,
        serviceGenerator,
        serviceDeclarationReferencer,
        serviceResolver,
    }: ServiceContextMixinImpl.Init) {
        this.sourceFile = sourceFile;
        this.importsManager = importsManager;
        this.serviceGenerator = serviceGenerator;
        this.serviceDeclarationReferencer = serviceDeclarationReferencer;
        this.serviceResolver = serviceResolver;
    }

    public getGeneratedService(serviceName: DeclaredServiceName): GeneratedService {
        return this.serviceGenerator.generateService({
            service: this.serviceResolver.getServiceDeclarationFromName(serviceName),
            serviceClassName: this.serviceDeclarationReferencer.getExportedName(serviceName),
        });
    }

    public getReferenceToService(
        serviceName: DeclaredServiceName,
        { importAlias }: { importAlias: string }
    ): Reference {
        return this.serviceDeclarationReferencer.getReferenceToClient({
            name: serviceName,
            referencedIn: this.sourceFile,
            importsManager: this.importsManager,
            importStrategy: { type: "direct", alias: importAlias },
        });
    }
}
