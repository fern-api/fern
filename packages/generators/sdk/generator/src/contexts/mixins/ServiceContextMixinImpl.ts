import { FernFilepath } from "@fern-fern/ir-model/commons";
import { GeneratedService, Reference, ServiceContextMixin } from "@fern-typescript/contexts";
import { ServiceResolver } from "@fern-typescript/resolvers";
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

    public getGeneratedService(service: FernFilepath): GeneratedService {
        return this.serviceGenerator.generateService({
            service: this.serviceResolver.getServiceDeclarationFromName(service),
            serviceClassName: this.serviceDeclarationReferencer.getExportedName(service),
        });
    }

    public getReferenceToService(service: FernFilepath, { importAlias }: { importAlias: string }): Reference {
        return this.serviceDeclarationReferencer.getReferenceToClient({
            name: service,
            referencedIn: this.sourceFile,
            importsManager: this.importsManager,
            importStrategy: { type: "direct", alias: importAlias },
        });
    }
}
